define([
    'jquery', 'DS_Inherit', 'MutationObserver', 'Node_Template', 'Observer', 'jQuery+'
],  function ($, DS_Inherit, MutationObserver, Node_Template, Observer) {

    function View($_View, iScope) {

        if (this.constructor == arguments.callee)
            throw TypeError(
                "View() is an Abstract Base Class which can't be instantiated."
            );

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.constructor.instanceOf(this.$_View, false);

        return  ((_This_ != null)  &&  (_This_ != this))  ?
            _This_  :
            $.extend(this, {
                __id__:       $.uuid('View'),
                __name__:     this.$_View[0].name || this.$_View[0].dataset.name,
                __data__:     DS_Inherit(iScope, { }),
                __child__:    [ ]
            }).attach();
    }

    $.extend(View.prototype, {
        toString:      function () {

            var iName = this.constructor.name;

            return  '[object ' + (
                (typeof iName == 'function')  ?  this.constructor.name()  :  iName
            )+ ']';
        },
        watch:         function (iKey) {
            var _This_ = this;

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {
                        if (_This_.__data__.hasOwnProperty( iKey ))
                            return _This_.__data__[iKey];
                    },
                    set:    function () {
                        _This_.render(iKey, arguments[0]);
                    }
                });
        },
        extend:        function (iData) {

            for (var iKey in iData)
                if (iData.hasOwnProperty( iKey )) {

                    this.__data__[iKey] = iData[iKey];

                    this.watch( iKey );
                }

            return this.__data__;
        },
        attrWatch:     function () {
            var _This_ = this;

            if (! this.__observer__)  this.extend( this.$_View[0].dataset );

            this.__observer__ = new self.MutationObserver(function () {

                var iData = { };

                $.each(arguments[0],  function () {

                    var iNew = this.target.getAttribute( this.attributeName ),
                        iOld = this.oldValue;

                    if (
                        (iNew != iOld)  &&
                        (! (iOld || '').match( Node_Template.expression ))
                    )
                        iData[$.camelCase( this.attributeName.slice(5) )] = iNew;
                });

                if (! $.isEmptyObject( iData ))
                    _This_.render( iData ).trigger('update', iData);
            });

            this.__observer__.observe(this.$_View[0], {
                attributes:           true,
                attributeOldValue:    true,
                attributeFilter:      $.map(
                    Object.keys( this.$_View[0].dataset ),
                    function () {
                        return  'data-'  +  $.hyphenCase( arguments[0] );
                    }
                )
            });
        },
        attach:        function () {

            this.$_View.data('[object View]', this);

            if ( this.$_View[0].dataset.href )  this.attrWatch();

            this.$_View.append( this.$_Content );

            return this;
        },
        detach:        function () {

            this.$_View.data('[object View]', null);

            if (this.__observer__) {
                this.__observer__.disconnect();

                delete this.__observer__;
            }

            this.$_Content = this.$_View.children().detach();

            return this;
        },
        scan:          function (iParser) {

            var Sub_View = [ ],  _This_ = this;

            var iSearcher = document.createTreeWalker(this.$_View[0], 1, {
                    acceptNode:    function (iDOM) {
                        var iView;

                        if ( iDOM.dataset.href ) {

                            _This_.__child__.push( iDOM );

                            return NodeFilter.FILTER_REJECT;

                        } else if (
                            iDOM.dataset.name  ||
                            (iView = View.instanceOf(iDOM, false))
                        ) {
                            Sub_View.push(iView  ||  View.getSub( iDOM ));

                            return NodeFilter.FILTER_REJECT;
                        } else if (
                            (iDOM.parentNode == document.head)  &&
                            (iDOM.tagName.toLowerCase() != 'title')
                        )
                            return NodeFilter.FILTER_REJECT;

                        return NodeFilter.FILTER_ACCEPT;
                    }
                });

            iParser.call(this, this.$_View[0]);

            var iPointer,  iNew,  iOld;

            while (iPointer = iPointer || iSearcher.nextNode()) {

                iNew = iParser.call(this, iPointer);

                if (iNew == iPointer) {
                    iPointer = null;
                    continue;
                }

                $( iNew ).insertTo(iPointer.parentNode,  $( iPointer ).index());

                iOld = iPointer;

                iPointer = iSearcher.nextNode();

                $( iOld ).remove();
            }

            for (var i = 0;  this.__child__[i];  i++)
                iParser.call(this, this.__child__[i]);

            for (var i = 0;  Sub_View[i];  i++)
                iParser.call(this, Sub_View[i]);
        },
        one:           Observer.prototype.one
    });

    $.each(['trigger', 'on', 'off'],  function (Index, iName) {

        View.prototype[this] = function () {

            var iArgs = $.makeArray( arguments );

            if ( Index ) {
                iArgs[0] += '.EWA_View';

                if (typeof iArgs.slice(-1)[0] == 'function') {

                    iArgs = iArgs.concat($.proxy(iArgs.pop(), this));
                }
            }

            $.fn[iName].apply(this.$_View, iArgs);

            return this;
        };
    });

    $.extend(View, {
        getClass:        function () {

            return this.prototype.toString.call(
                {constructor: this}
            ).split(' ')[1].slice(0, -1);
        },
        signSelector:    function () {
            var _This_ = this;

            $.expr[':'][ this.getClass().toLowerCase() ] = function () {
                return (
                    ($.data(arguments[0], '[object View]') || '') instanceof _This_
                );
            };

            return this;
        }
    });

    return  $.extend(View.signSelector(), {
        Sub_Class:     [ ],
        getSub:        function (iDOM) {

            for (var i = this.Sub_Class.length - 1;  this.Sub_Class[i];  i--)
                if (this.Sub_Class[i].is( iDOM ))
                    return  new this.Sub_Class[i](
                        iDOM,
                        (this.instanceOf( iDOM.parentNode )  ||  '').__data__
                    );
        },
        extend:        function (iConstructor, iStatic, iPrototype) {

            this.Sub_Class.push( iConstructor );

            return $.inherit(
                this, iConstructor, iStatic, iPrototype
            ).signSelector();
        },
        instanceOf:    function ($_Instance, Check_Parent) {

            var _Instance_;  $_Instance = $( $_Instance );

            do {
                _Instance_ = $_Instance.data('[object View]');

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        }
    });
});