define([
    'jquery', '../base/Observer', '../base/DataScope', '../InnerLink',
    './RenderNode', 'jQueryKit'
],  function ($, Observer, DataScope, InnerLink, RenderNode) {

    function View($_View, iScope) {

        if (this.constructor == View)
            throw TypeError(
                "View() is an Abstract Base Class which can't be instantiated."
            );

        var _This_ = Observer.call(this, $_View);

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        _This_ = InnerLink.instanceOf( this.$_View );

        if (_This_)  $.extend(true,  this.__handle__,  _This_.__handle__ || { });

        return $.extend(
            DataScope.call(this, iScope),
            {
                __name__:     this.$_View[0].name || this.$_View[0].dataset.name,
                __child__:    [ ]
            }
        ).attach();
    }

    $.extend(View.prototype, DataScope.prototype);

    return  Observer.extend(View, {
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
        getObserver:     function ($_DOM) {

            return  this.instanceOf($_DOM, false)  ||
                InnerLink.instanceOf($_DOM, false)  ||
                new Observer( $_DOM );
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
        attrWatch:     function () {
            var _This_ = this;

            this.__observer__ = new self.MutationObserver(function () {

                var iData = { };

                $.each(arguments[0],  function () {

                    var iNew = this.target.getAttribute( this.attributeName );

                    if (
                        (iNew != this.oldValue)  &&
                        (! (this.oldValue || '').match( RenderNode.expression ))
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

            var Sub_View = [ ];

            var iSearcher = this.$_View.treeWalker(1,  (function (iDOM) {

                    var iView;

                    if (this.$_View[0] !== iDOM) {

                        if ( iDOM.dataset.href ) {

                            this.__child__.push( iDOM );

                            return null;

                        } else if (
                            iDOM.dataset.name  ||
                            (iView = View.instanceOf(iDOM, false))
                        ) {
                            Sub_View.push(iView  ||  View.getSub( iDOM ));

                            return null;

                        } else if (
                            (iDOM.parentNode == document.head)  &&
                            (iDOM.tagName.toLowerCase() != 'title')
                        )
                            return null;
                    }

                    return  iParser.call(this, iDOM);

                }).bind( this ));

            while (! iSearcher.next().done)  ;

            for (var i = 0;  this.__child__[i];  i++)
                iParser.call(this,  View.setEvent( this.__child__[i] ));

            for (var i = 0;  Sub_View[i];  i++)
                iParser.call(this, Sub_View[i]);
        },
        childOf:       function (iSelector) {

            return  iSelector  ?
                View.instanceOf(this.$_View.find(iSelector + '[data-href]'))  :
                this.__child__;
        }
    });
});