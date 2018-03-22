define([
    'jquery', './View', '../InnerLink', './HTMLView'
],  function ($, View, InnerLink, HTMLView) {

    /**
     * 迭代视图类（对应 JSON 数组）
     *
     * @description 默认匹配：设置了 `data-name` 属性的 `ul, ol, tbody, select, datalist` 元素
     *
     * @author  TechQuery
     *
     * @class   ListView
     * @extends View
     *
     * @param   {jQueryAcceptable} $_View  - Container DOM of ListView
     * @param   {object}           [scope] - Data object as a scope
     * @param   {(string|URL)}     [base]
     *
     * @returns {ListView}         Return the last one if a ListView instance
     *                             has been created on this element
     */

    function ListView($_View, scope, base) {

        var _This_ = View.call(this, $_View, scope, base);

        return  (_This_ !== this)  ?
            _This_  :
            this.setPrivate({
                HTML:     this.$_View.html(),
                parse:    $.now()
            }).clear();
    }

    View.extend(ListView, {
        is:    $.expr[':'].list
    }, {
        splice:     Array.prototype.splice,
        /**
         * 清空视图
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @returns  {ListView} Current ListView
         */
        clear:      function () {

            this.$_View.empty();

            this.splice(0, Infinity);

            this.splice.call(this.__data__,  0,  Infinity);

            return this;
        },
        /**
         * 刷新列表
         *
         * @author TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param {number} [from=0] - Index of the start point to refresh
         *
         * @return {ListView} Current ListView
         */
        update:     function (from) {

            from = from || 0;

            if (from < 0)  from += this.length + 1;

            for ( ;  this[from];  from++)
                this[from].render( this[from].valueOf() );

            return this;
        },
        /**
         * 插入一项
         *
         * @author TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param {object}  data      - Data of one Item
         * @param {number}  [index=0] - Index of Insert Point
         * @param {boolean} [delay]   - Create one HTMLView, and not insert
         *
         * @return {HTMLView} Newly created Item
         */
        insert:     function (data, index, delay) {

            var item = View.getSub(this.__HTML__, this.__data__).parse();

            item.$_View.find( InnerLink.HTML_Link ).addBack( InnerLink.HTML_Link )
                .each(function () {

                    new InnerLink( this );
                });

            item.watch('__index__', {
                get:    Array.prototype.indexOf.bind(
                    this.__data__,  item.__data__
                ),
                set:    $.noop
            });

            index = this.__data__.insert(item.__data__,  index);

            this.splice(index,  0,  item.render( data ));

            if (! delay) {

                item.$_View.insertTo(this.$_View, index);

                this.update(index + 1);
            }

            return item;
        },
        /**
         * 渲染视图
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param    {object[]} list    - ArrayLike Object of Data Object
         * @param    {number}   [index] - Insert offset
         *
         * @returns  {ListView} Current ListView
         */
        render:     function (list, index) {

            if (! (index != null))  this.clear();

            if (! $.likeArray( list ))  return this;

            index = index || 0;

            $(Array.from(list,  function (data, i) {

                return  this.insert(data, index + i, true).$_View[0];

            },  this)).insertTo(this.$_View, index);

            return  this.update(index + list.length);
        },
        /**
         * 根据 HTML 节点查询索引
         *
         * @author TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param {jQueryAcceptable|HTMLView} $_Item - An HTMLElement or HTMLView
         *                                             in one item of the List
         * @return {number} Index of $_Item
         */
        indexOf:    function ($_Item) {

            if ($_Item instanceof HTMLView)
                return  Array.prototype.indexOf.call(this, $_Item);

            $_Item = ($_Item instanceof $)  ?  $_Item  :  $( $_Item );

            return (
                ($_Item[0].parentNode == this.$_View[0])  ?
                    $_Item  :  $_Item.parentsUntil( this.$_View )
            ).slice( -1 ).index();
        },
        /**
         * 删除一项
         *
         * @author TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param {jQueryAcceptable|HTMLView|number} item - Object or index of
         *                                                  the Item to be removed
         * @return {HTMLView} Newly removed Item
         */
        remove:     function (item) {

            var index = $.isNumeric( item )  ?  item  :  this.indexOf( item );

            item = this.splice(index, 1)[0];

            item.$_View.remove();

            this.splice.call(this.__data__,  index,  1);

            this.update( index );

            return item;
        },
        /**
         * 列表排序
         *
         * @author TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param {function} callback - Same as the callback of
         *                              `Array.prototype.sort()`
         * @return {ListView} Current ListView
         */
        sort:       function (callback) {

            var list = Array.from( this ).sort( callback ), _this_ = this;

            this.$_View.append(list.map(function (item, index) {

                if (_this_[index] !== item) {

                    _this_[index] = item;

                    item.render(_this_.__data__[index] = item.__data__);
                }

                return item.$_View[0];
            }));

            return this;
        }
    });

    return ListView;

});
