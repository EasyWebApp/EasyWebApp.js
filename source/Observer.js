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

            for (var iKey in iHandle)
                if (
                    (typeof iHandle[iKey] != 'function')  &&
                    (! (iEvent[iKey] || '').match( iHandle[iKey] ))
                )
                    return false;

            return true;
        }
    });

    $.extend(Observer.prototype, {
        sign:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        on:       function (iEvent, iCallback) {

            if (typeof iCallback == 'function')
                return  this.sign(iEvent, iCallback);

            var _This_ = this;

            return  new Promise(function () {

                _This_.sign(iEvent, arguments[0]);
            });
        },
        emit:    function (iEvent, iData) {

            iEvent = Observer.getEvent( iEvent );

            return  (this.__handle__[iEvent.type] || [ ]).reduce(
                $.proxy(function (_Data_, iHandle) {

                    var iResult = Observer.match(iEvent, iHandle)  &&
                            iHandle.handler.call(this, iEvent, _Data_);

                    return  iResult || _Data_;

                },  this),
                iData
            );
        },
        off:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],
                $.proxy(Observer.match, Observer, iEvent)
            );

            return this;
        }
    });

    return Observer;

});