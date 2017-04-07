define([
    'jquery', 'Observer', 'DS_Inherit', 'MutationObserver', 'Node_Template', 'jQuery+'
],  function ($, Observer, DS_Inherit, MutationObserver, Node_Template) {

    function View($_View, iScope) {

        if (this.constructor == arguments.callee)
            throw TypeError(
                "View() is an Abstract Base Class which can't be instantiated."
            );

        var _This_ = Observer.call(this, $_View);

        $.extend(this, _This_.destructor());

        _This_ = this.constructor.instanceOf(this.$_View, false);

        return  ((_This_ != null)  &&  (_This_ != this))  ?
            _This_  :
            $.extend(this, {
                __name__:     this.$_View[0].name || this.$_View[0].dataset.name,
                __data__:     DS_Inherit(iScope, { }),
                __child__:    [ ]
            }).attach();
    }

    return  $.inherit(Observer, View, {
        signSelector:    function () {
            var _This_ = this;

            $.expr[':'][ this.getClass().toLowerCase() ] = function () {
                return (
                    ($.data(arguments[0], '[object View]') || '') instanceof _This_
                );
            };

            return this;
        },
        Sub_Class:       [ ],
        getSub:          function (iDOM) {

            for (var i = this.Sub_Class.length - 1;  this.Sub_Class[i];  i--)
                if (this.Sub_Class[i].is( iDOM ))
                    return  new this.Sub_Class[i](
                        iDOM,
                        (this.instanceOf( iDOM.parentNode )  ||  '').__data__
                    );
        },
        extend:          function (iConstructor, iStatic, iPrototype) {

            this.Sub_Class.push( iConstructor );

            return $.inherit(
                this, iConstructor, iStatic, iPrototype
            ).signSelector();
        },
        instanceOf:      function ($_Instance, Check_Parent) {

            var _Instance_;  $_Instance = $( $_Instance );

            do {
                _Instance_ = $_Instance.data('[object View]');

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        },
        getObserver:     function (iDOM) {

            return  this.instanceOf(iDOM, false)  ||  new Observer( iDOM );
        },
        setEvent:        function (iDOM) {

            $.each(iDOM.attributes,  function () {

                var iName = (this.nodeName.match(/^on(\w+)/i) || '')[1];

                if ((! iName)  ||  (this.nodeName in iDOM))  return;

                Object.defineProperty(iDOM,  'on' + iName,  {
                    set:    function (iHandler) {

                        var iView = View.getObserver( iDOM );

                        iView.off( iName );

                        if (typeof iHandler == 'function')
                            iView.on(iName, iHandler);
                    },
                    get:    function () {

                        return Observer.prototype.valueOf.call(
                            View.getObserver( iDOM ),  iName,  'handler'
                        )[0];
                    }
                });
            });

            return iDOM;
        }
    }, {
        watch:         function (iKey) {
            var _This_ = this;

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {
                        if (_This_.__data__.hasOwnProperty( iKey ))
                            return _This_.__data__[iKey];
                    },
                    set:    this.render.bind(this, iKey)
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
                    _This_.render( iData ).emit({
                        type:      'update',
                        target:    _This_.$_View[0]
                    }, iData);
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

            if (! this.$_View[0].id)
                this.$_View[0].id = this.__id__ || $.uuid('View');

            this.__id__ = this.$_View[0].id;

            this.$_View.data('[object View]', this);

            if ( this.$_View[0].dataset.href )  this.attrWatch();

            this.emit({
                type:      'attach',
                target:    this.$_View.append( this.$_Content )[0]
            });

            return this;
        },
        detach:        function () {

            if ( this.$_View[0].id.match(/^View_\w+/) )  this.$_View[0].id = '';

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

                $( iNew ).insertTo(iPointer.parentNode,  $( iPointer ).index() + 1);

                iOld = iPointer;

                iPointer = iSearcher.nextNode();

                $( iOld ).remove();
            }

            for (var i = 0;  this.__child__[i];  i++)
                iParser.call(this,  View.setEvent( this.__child__[i] ));

            for (var i = 0;  Sub_View[i];  i++)
                iParser.call(this, Sub_View[i]);
        },
        valueOf:       function () {
            return  this.__data__.valueOf();
        },
        childOf:       function (iSelector) {

            return  iSelector  ?
                View.instanceOf(this.$_View.find(iSelector + '[data-href]'))  :
                this.__child__;
        }
    }).signSelector();

});