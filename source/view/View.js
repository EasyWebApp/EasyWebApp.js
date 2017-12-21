define([
    'jquery', '../base/Observer', '../base/DataScope', './RenderNode'
],  function ($, Observer, DataScope, RenderNode) {

    /**
     * 视图抽象类
     *
     * @author  TechQuery
     *
     * @class   View
     * @extends Observer
     *
     * @param   {jQueryAcceptable} $_View  - Container DOM of View
     * @param   {object}           [scope] - Data object as a scope
     * @param   {(string|URL)}     [base]
     *
     * @returns {View}                 Return the last one if a View instance
     *                                 has been created on this element
     */

    function View($_View, scope, base) {

        var _This_ = Observer.call(
                $.Class.call(this, View, ['render']),  $_View,  true
            );

        return  (_This_ !== this)  ?
            _This_ :
            this.setPrivate({
                id:          '',
                name:        this.$_View[0].dataset.name,
                base:        base  ||  View.baseOf( this.$_View[0] ),
                /**
                 * 视图数据作用域
                 *
                 * @name      __data__
                 * @type      {DataScope}
                 *
                 * @memberof  View
                 * @instance
                 *
                 * @protected
                 */
                data:        new DataScope( scope ),
                parse:       0,
                child:       [ ],
                observer:    null
            }).attach();
    }

    var Sub_Class = [ ];

    return  Observer.extend(View, {
        baseOf:    function (box) {

            if (box.dataset.href  &&  (box.dataset.href[0] !== '?'))
                return  $.filePath( box.dataset.href );
        },
        getSub:    function (iDOM, base) {

            var is_View = iDOM.getAttribute('is');

            for (var i = Sub_Class.length - 1;  Sub_Class[i];  i--)
                if (
                    is_View ?
                        (is_View === Sub_Class[i].name)  :
                        Sub_Class[i].is( iDOM )
                )
                    return  new Sub_Class[i](
                        iDOM,
                        (this.instanceOf( iDOM.parentNode )  ||  '').__data__,
                        base
                    );
        },
        /**
         * 继承出一个视图子类
         *
         * @author   TechQuery
         *
         * @memberof View
         *
         * @param    {function} constructor - Constructor of the Sub Class
         * @param    {?object}  Static      - Static properties
         * @param    {object}   [prototype] - Instance properties
         *
         * @returns  {function} The Sub Class
         */
        extend:    function (constructor, Static, prototype) {

            Sub_Class.push( constructor );

            Static = Static  ||  { };

            Static.is = Static.is || $.noop;

            return $.Class.extend.call(
                this,  constructor,  Static,  prototype
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

                /**
                 * 自定义属性 更新事件
                 *
                 * @event    View#update
                 *
                 * @type     {object}
                 *
                 * @property {string}      type   - Event Name
                 * @property {HTMLElement} target - View container
                 */

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
        /**
         * 挂载视图
         *
         * @author   TechQuery
         *
         * @memberof View.prototype
         *
         * @fires    View#attach
         *
         * @returns  {View} Current View
         */
        attach:        function () {

            if (! this.$_View[0].id)
                this.$_View[0].id = this.__id__ || $.uuid('View');

            this.__id__ = this.$_View[0].id;

            this.$_View.data('[object View]', this);

            if ( this.$_View[0].dataset.href )  this.attrWatch();

            /**
             * 视图挂载完成事件
             *
             * @event    View#attach
             *
             * @type     {object}
             *
             * @property {string}      type   - Event Name
             * @property {HTMLElement} target - View container
             */

            this.emit({
                type:      'attach',
                target:    this.$_View.append( this.$_Content )[0]
            });

            return this;
        },
        /**
         * 卸载视图
         *
         * @author   TechQuery
         *
         * @memberof View.prototype
         *
         * @returns  {View} Current View
         */
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
        /**
         * HTML 树解析器
         *
         * @callback View~parser
         *
         * @this  View
         * @param {HTMLElement|View} node - A Renderable Object
         */
        /**
         * HTML 树扫描器
         *
         * @author    TechQuery
         *
         * @memberof  View.prototype
         * @protected
         *
         * @param     {View~parser} parser - A callback to process HTMLElement
         *
         * @returns   {View}        Current View
         */
        scan:          function (parser) {

            var Sub_View = [ ];

            var iSearcher = this.$_View.treeWalker((function (node) {

                    var iView;

                    if ((this.$_View[0] !== node)  &&  (node.nodeType === 1)) {

                        if ( node.dataset.href ) {

                            parser.call(this, node);

                            iView = View.getSub( node );

                            if (this.__child__.indexOf( iView )  <  0)
                                this.__child__.push( iView );

                            return null;

                        } else if (
                            node.dataset.name  ||
                            (iView = View.instanceOf(node, false))
                        ) {
                            parser.call(this, node);

                            iView = iView  ||  View.getSub(node, this.__base__);

                            Sub_View.push(iView.parse ? iView.parse() : iView);

                            return null;

                        } else if (
                            (node.parentNode == document.head)  &&
                            (node.tagName.toLowerCase() != 'title')
                        )
                            return null;
                    }

                    return  parser.call(this, node);

                }).bind( this ));

            while (! iSearcher.next().done)  ;

            for (var i = 0;  Sub_View[i];  i++)
                parser.call(this, Sub_View[i]);

            this.__parse__ = $.now();

            return this;
        },
        /**
         * 视图对象 属性监视
         *
         * @author   TechQuery
         *
         * @memberof View.prototype
         *
         * @param    {string} key       - Property Key
         * @param    {object} [get_set] - Getter & Setter
         *
         * @returns  {View}   Current View
         */
        watch:         function (key, get_set) {

            if (! (key in Object.getPrototypeOf( this )))
                this.setPublic(key, get_set, {
                    get:    function () {

                        return  this.__data__[key];
                    },
                    set:    this.render.bind(this, key)
                });

            return this;
        },
        /**
         * 获取视图上的数据
         *
         * @author   TechQuery
         *
         * @memberof View.prototype
         *
         * @returns  {object} Data of this View in plain object
         */
        valueOf:       function () {

            return  this.__data__.valueOf();
        },
        /**
         * 获取子组件
         *
         * @author   TechQuery
         *
         * @memberof View.prototype
         *
         * @param    {string}  [$_Filter] - jQuery Selector
         *
         * @returns  {View[]}  Array of Child Component
         */
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
