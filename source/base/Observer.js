define(['jquery', 'jQueryKit'],  function ($) {

    function Observer($_View) {

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.$_View.data('[object Observer]');

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        this.$_View.data('[object Observer]', this);

        this.__handle__ = { };

        return this;
    }

    $.extend(Observer, {
        getEvent:    function (iEvent) {
            return $.extend(
                { },
                (typeof iEvent == 'string')  ?  {type: iEvent}  :  iEvent,
                arguments[1]
            );
        },
        match:       function (iEvent, iHandle) {
            var iRegExp;

            for (var iKey in iHandle) {

                iRegExp = iEvent[iKey] instanceof RegExp;

                switch ($.Type( iHandle[iKey] )) {
                    case 'RegExp':
                        if ( iRegExp ) {
                            if (iEvent[iKey].toString() != iHandle[iKey].toString())
                                return;
                            break;
                        }
                    case 'String':    {
                        if (! (iEvent[iKey] || '')[iRegExp ? 'test' : 'match'](
                            iHandle[iKey]
                        ))
                            return;
                        break;
                    }
                    case 'Function':
                        if (typeof iEvent[iKey] != 'function')  break;
                    default:
                        if (iEvent[iKey] !== iHandle[iKey])  return;
                }
            }

            return iHandle;
        },
        getClass:        function () {

            return this.prototype.toString.call(
                {constructor: this}
            ).split(' ')[1].slice(0, -1);
        }
    });

    $.extend(Observer.prototype, {
        toString:      function () {

            return  '[object ' + this.constructor.name + ']';
        },
        destructor:    function () {

            this.$_View.data('[object Observer]', null);

            return {
                $_View:        this.$_View,
                __handle__:    this.__handle__
            };
        },
        valueOf:       function (iEvent, iKey) {

            if (! iEvent)  return  this.__handle__;

            return  (! iKey)  ?  this.__handle__[iEvent]  :
                $.map(this.__handle__[iEvent],  function () {

                    return  arguments[0][ iKey ];
                });
        },
        on:            function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        emit:          function (iEvent, iData) {

            iEvent = Observer.getEvent( iEvent );

            return  (this.__handle__[iEvent.type] || [ ]).reduce(
                (function (_Data_, iHandle) {

                    if (! Observer.match(iEvent, iHandle))  return _Data_;

                    var iResult = iHandle.handler.call(this, iEvent, _Data_);

                    return  (iResult != null)  ?  iResult  :  _Data_;

                }).bind( this ),
                iData
            );
        },
        off:           function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],  function (iHandle) {

                    return  Observer.match(iEvent, iHandle)  ?  null  :  iHandle;
                }
            );

            return this;
        },
        one:           function () {

            var _This_ = this,  iArgs = $.makeArray( arguments );

            var iCallback = iArgs.slice(-1)[0];

            iCallback = (typeof iCallback == 'function')  &&  iArgs.pop();

            var iPromise = new Promise(function (iResolve) {

                    _This_.on.apply(_This_,  iArgs.concat(function () {

                        _This_.off.apply(_This_,  iArgs.concat( arguments.callee ));

                        if ( iCallback )  return  iCallback.apply(this, arguments);

                        iResolve( arguments[1] );
                    }));
                });

            return  iCallback ? this : iPromise;
        }
    });

    return Observer;

});
