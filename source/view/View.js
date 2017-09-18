define([
    'jquery', '../base/Observer', '../base/DataScope', './RenderNode'
],  function ($, Observer, DataScope, RenderNode) {

    function View($_View, scope) {

        var _This_ = Observer.call(
                $.Class.call(this, View, ['render']),  $_View
            );

        return  (_This_ !== this)  ?
            _This_ :
            this.setPrivate({
                id:          '',
                name:        this.$_View[0].name || this.$_View[0].dataset.name,
                data:        new DataScope( scope ),
                parse:       0,
                child:       [ ],
                observer:    null
            }).attach();
    }

    var Sub_Class = [ ];

    return  Observer.extend(View, {
        getSub:    function (iDOM) {

            var is_View = iDOM.getAttribute('is');

            for (var i = Sub_Class.length - 1;  Sub_Class[i];  i--)
                if (
                    is_View ?
                        (is_View === Sub_Class[i].name)  :
                        Sub_Class[i].is( iDOM )
                )
                    return  new Sub_Class[i](
                        iDOM,
                        (this.instanceOf( iDOM.parentNode )  ||  '').__data__
                    );
        },
        extend:    function (iConstructor, iStatic, iPrototype) {

            Sub_Class.push( iConstructor );

            return $.Class.extend.call(
                this,  iConstructor,  iStatic,  iPrototype
            ).signSelector();
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

                if (_This_.__parse__  &&  (! $.isEmptyObject( iData )))
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

                            this.__child__.push( View.getSub( iDOM ) );

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
                iParser.call(this,  this.__child__[i].$_View[0]);

            for (var i = 0;  Sub_View[i];  i++)
                iParser.call(this, Sub_View[i]);

            this.__parse__ = $.now();

            return this;
        },
        watch:         function (key, get_set) {

            this.setPublic(key, get_set, {
                get:    function () {

                    return  this.__data__[key];
                },
                set:    this.render.bind(this, key)
            });

            return this;
        },
        valueOf:       function () {

            return  this.__data__.valueOf();
        },
        childOf:       function ($_Filter) {

            var children = this.__child__ || this;

            return  $_Filter ?
                $.map(children,  function (VM) {

                    return  VM.$_View.is( $_Filter )  ?  VM  :  null;
                }) :
                Array.from( children );
        }
    }).registerEvent('ready', 'update');

});