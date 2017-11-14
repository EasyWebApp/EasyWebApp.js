define(['jquery', 'jQueryKit'],  function ($) {

    /**
     * 多条件观察者
     *
     * @author  TechQuery
     *
     * @class   Observer
     *
     * @param   {jQueryAcceptable} $_View      - Container DOM of Observer
     * @param   {boolean}          [all_event] - Register all kinds of
     *                                           event handlers in HTML code
     *
     * @returns {Observer}         Return the last one if a Observer instance
     *                             has been created on this element
     */

    function Observer($_View, all_event) {
        /**
         * 容器元素的 jQuery 包装
         *
         * @name     $_View
         * @type     {jQuery}
         *
         * @memberof Observer
         * @instance
         *
         * @readonly
         */
        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        this.setPrivate('handle',  { });

        return  this.init( all_event );
    }

    function basicMethod(iClass) {

        var iType = Observer.prototype.toString.call({constructor: iClass});

        $.extend(iClass.prototype, {
            init:          function (all_event) {

                var _This_ = this.$_View.data( iType );

                return  ((_This_ != null)  &&  (_This_ !== this))  ?
                    _This_  :
                    $.data(this.$_View[0],  iType,  this.setHandle( all_event ));
            },
            setHandle:     function (all_event) {

                var _This_ = this;

                $.each(this.$_View[0].attributes,  function () {

                    var iName = (this.nodeName.match(/^on(\w+)/i) || '')[1];

                    if (
                        (! iName)  ||
                        !(all_event  ||  (iName in iClass.Bind_Event))  ||
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
            /**
             * 注册子类事件类型
             *
             * @author    TechQuery
             *
             * @memberof  Observer
             * @protected
             *
             * @param     {...string} name - Event Names
             *
             * @returns   {function}  Sub Class of Observer
             */
            registerEvent:    function (name) {

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
            /**
             * 从一个元素节点开始向上查找实例，并返回首个发现的实例
             *
             * @author   TechQuery
             *
             * @memberof Observer
             *
             * @param    {jQueryAcceptable} $_DOM        Search up from this Element
             * @param    {boolean}          Check_Parent
             *
             * @returns  {Observer}         Observer instance
             */
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
        /**
         * 继承出一个观察者子类
         *
         * @author   TechQuery
         *
         * @memberof Observer
         *
         * @param    {function} constructor - Constructor of the Sub Class
         * @param    {?object}  Static      - Static properties
         * @param    {object}   [prototype] - Instance properties
         *
         * @returns  {function} The Sub Class
         */
        extend:      function (constructor, Static, prototype) {

            return basicMethod($.Class.extend.call(
                this,  constructor,  Static,  prototype
            ));
        },
        getEvent:    function (event) {

            return $.extend(
                { },
                (typeof event == 'string')  ?  {type: event}  :  event,
                arguments[1]
            );
        },
        match:       function (event, iHandle) {
            var iRegExp;

            for (var iKey in iHandle) {

                iRegExp = event[iKey] instanceof RegExp;

                switch ($.Type( iHandle[iKey] )) {
                    case 'RegExp':
                        if ( iRegExp ) {
                            if (event[iKey].toString() != iHandle[iKey].toString())
                                return;
                            break;
                        }
                    case 'String':    {
                        if (! (event[iKey] || '')[iRegExp ? 'test' : 'match'](
                            iHandle[iKey]
                        ))
                            return;
                        break;
                    }
                    case 'Function':
                        if (typeof event[iKey] != 'function')  break;
                    default:
                        if (event[iKey] !== iHandle[iKey])  return;
                }
            }

            return iHandle;
        }
    }, {
        toString:    function () {

            return  '[object ' + this.constructor.name + ']';
        },
        /**
         * 查询事件
         *
         * @author   TechQuery
         *
         * @memberof Observer.prototype
         *
         * @param    {string}          [event] - Event Name
         * @param    {string}          [key]   - Key of Event property
         *
         * @returns  {object|object[]} Event Handlers
         */
        valueOf:     function (event, key) {

            if (! event)  return  this.__handle__;

            return  (! key)  ?  this.__handle__[event]  :
                $.map(this.__handle__[event],  function () {

                    return  arguments[0][ key ];
                });
        },
        /**
         * 注册一个事件回调
         *
         * @author   TechQuery
         *
         * @memberof Observer.prototype
         *
         * @param    {string|object} event    - An Event Name or Event Object
         * @param    {function}      callback
         *
         * @returns  {Observer}      Current Observer
         */
        on:          function (event, callback) {

            event = Observer.getEvent(event,  {handler: callback});

            var iHandle = this.__handle__[event.type] =
                    this.__handle__[event.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], event))  return this;

            iHandle.push( event );

            return this;
        },
        /**
         * 触发一个事件
         *
         * @author   TechQuery
         *
         * @memberof Observer.prototype
         *
         * @param    {string|object} event  - An Event Name or Event Object
         * @param    {*}             [data] - Additional Data for callbacks
         *
         * @returns  {*}             Data returned by last callback
         */
        emit:        function (event, iData) {

            event = Observer.getEvent( event );

            return  (this.__handle__[event.type] || [ ]).reduce(
                (function (_Data_, iHandle) {

                    if (! Observer.match(event, iHandle))  return _Data_;

                    var iResult = iHandle.handler.call(this, event, _Data_);

                    return  (iResult != null)  ?  iResult  :  _Data_;

                }).bind( this ),
                iData
            );
        },
        /**
         * 注销事件回调
         *
         * @author   TechQuery
         *
         * @memberof Observer.prototype
         *
         * @param    {string|object}  event      An Event Name or Event Object
         * @param    {function}       [callback]
         *
         * @returns  {Observer}       Current Observer
         */
        off:         function (event, callback) {

            event = Observer.getEvent(event,  {handler: callback});

            this.__handle__[event.type] = $.map(
                this.__handle__[event.type],  function (iHandle) {

                    return  Observer.match(event, iHandle)  ?  null  :  iHandle;
                }
            );

            return this;
        },
        /**
         * 注册一个事件回调（一次性）
         *
         * @author   TechQuery
         *
         * @memberof Observer.prototype
         *
         * @param    {string|object}    event      An Event Name or Event Object
         * @param    {function}         [callback]
         *
         * @returns  {Observer|Promise} Current Observer or Promise
         */
        one:         function () {

            var _This_ = this,  iArgs = $.makeArray( arguments );

            var callback = iArgs.slice(-1)[0];

            callback = (typeof callback === 'function')  &&  iArgs.pop();

            var iPromise = new Promise(function (iResolve) {

                    _This_.on.apply(_This_,  iArgs.concat(function once() {

                        _This_.off.apply(_This_,  iArgs.concat( once ));

                        if ( callback )  return  callback.apply(this, arguments);

                        iResolve( arguments[1] );
                    }));
                });

            return  callback ? this : iPromise;
        }
    }));
});
