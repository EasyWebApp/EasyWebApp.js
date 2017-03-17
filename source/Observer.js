define(['jquery', 'jQuery+'],  function ($) {

    function Observer() {
        this.__handle__ = { };

        return this;
    }

    $.extend(Observer, {
        getEvent:    function (iEvent) {
            return $.extend(
                (typeof iEvent == 'string')  ?  {type: iEvent}  :  iEvent,
                arguments[1]  ||  { }
            );
        },
        match:       function (iEvent, iHandle) {

            for (var iKey in iHandle)  switch (typeof iHandle[iKey]) {
                case 'object':
                    if (! (iHandle[iKey] instanceof RegExp)) {
                        if (iEvent[iKey] !== iHandle[iKey])
                            return;
                        break;
                    }
                case 'string':
                    if (! (iEvent[iKey] || '').match( iHandle[iKey] ))
                        return;
                case 'function':    ;
            }

            return iHandle;
        }
    });

    $.extend(Observer.prototype, {
        sign:    function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        on:      function (iEvent, iCallback) {

            if (typeof iCallback == 'function')
                return  this.sign(iEvent, iCallback);

            var _This_ = this;

            return  new Promise(function (iResolve) {

                _This_.sign(iEvent,  function () {

                    iResolve( arguments[1] );
                });
            });
        },
        emit:    function (iEvent, iData) {

            iEvent = Observer.getEvent( iEvent );

            return  (this.__handle__[iEvent.type] || [ ]).reduce(
                $.proxy(function (_Data_, iHandle) {

                    if (! Observer.match(iEvent, iHandle))  return _Data_;

                    var iResult = iHandle.handler.call(this, iEvent, _Data_);

                    return  (iResult != null)  ?  iResult  :  _Data_;

                },  this),
                iData
            );
        },
        off:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],  function (iHandle) {

                    return  Observer.match(iEvent, iHandle)  ?  null  :  iHandle;
                }
            );

            return this;
        },
        one:     function (iEvent, iCallback) {

            return  this.on(iEvent,  function () {

                this.off(iEvent, arguments.callee);

                if (typeof iCallback == 'function')
                    return  iCallback.apply(this, arguments);
            });
        }
    });

    return Observer;

});