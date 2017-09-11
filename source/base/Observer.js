define(['jquery', 'jQueryKit'],  function ($) {

    function Observer($_View) {

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        this.setPrivate('handle',  { });

        return this.init();
    }

    function basicMethod(iClass) {

        var iType = Observer.prototype.toString.call({constructor: iClass});

        $.extend(iClass.prototype, {
            init:          function () {

                var _This_ = this.$_View.data( iType );

                return  ((_This_ != null)  &&  (_This_ !== this))  ?
                    _This_  :
                    $.data(this.$_View[0], iType, this.setHandle());
            },
            setHandle:     function () {

                var _This_ = this;

                $.each(this.$_View[0].attributes,  function () {

                    var iName = (this.nodeName.match(/^on(\w+)/i) || '')[1];

                    if (
                        (! iName)  ||
                        !(iName in iClass.Bind_Event)  ||
                        (this.nodeName in this.ownerElement)
                    )
                        return;

                    Object.defineProperty(this.ownerElement,  'on' + iName,  {
                        set:    function (iHandler) {

                            _This_.off( iName );

                            if (typeof iHandler === 'function')
                                _This_.on(iName, iHandler);
                        },
                        get:    function () {

                            return Observer.prototype.valueOf.call(
                                _This_,  iName,  'handler'
                            )[0];
                        }
                    });
                });

                return this;
            },
            destructor:    function () {

                this.$_View.removeData( iType );

                return  this.valueOf.apply(this, arguments);
            }
        });

        return  $.extend(iClass, {
            Bind_Event:       { },
            registerEvent:    function () {

                $.extend(iClass.Bind_Event,  $.makeSet.apply($, arguments));

                return this;
            },
            signSelector:     function () {

                var _This_ = this;

                $.expr[':'][ this.name.toLowerCase() ] = function () {
                    return (
                        ($.data(arguments[0], iType) || '')  instanceof  _This_
                    );
                };

                return this;
            },
            instanceOf:       function ($_DOM, Check_Parent) {

                var _Instance_,  element = $( $_DOM )[0];

                while ( element ) {

                    _Instance_ = $.data(element, iType);

                    if (_Instance_ instanceof this)  return _Instance_;

                    element = (Check_Parent !== false)  &&  element.parentNode;
                }
            }
        }).signSelector();
    }

    return  basicMethod($.Class.extend(Observer, {
        extend:      function (iConstructor, iStatic, iPrototype) {

            return basicMethod($.Class.extend.call(
                this,  iConstructor,  iStatic,  iPrototype
            ));
        },
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
        }
    }, {
        toString:    function () {

            return  '[object ' + this.constructor.name + ']';
        },
        valueOf:     function (iEvent, iKey) {

            if (! iEvent)  return  this.__handle__;

            return  (! iKey)  ?  this.__handle__[iEvent]  :
                $.map(this.__handle__[iEvent],  function () {

                    return  arguments[0][ iKey ];
                });
        },
        on:          function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        emit:        function (iEvent, iData) {

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
        off:         function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],  function (iHandle) {

                    return  Observer.match(iEvent, iHandle)  ?  null  :  iHandle;
                }
            );

            return this;
        },
        one:         function () {

            var _This_ = this,  iArgs = $.makeArray( arguments );

            var iCallback = iArgs.slice(-1)[0];

            iCallback = (typeof iCallback == 'function')  &&  iArgs.pop();

            var iPromise = new Promise(function (iResolve) {

                    _This_.on.apply(_This_,  iArgs.concat(function once() {

                        _This_.off.apply(_This_,  iArgs.concat( once ));

                        if ( iCallback )  return  iCallback.apply(this, arguments);

                        iResolve( arguments[1] );
                    }));
                });

            return  iCallback ? this : iPromise;
        }
    }));
});
