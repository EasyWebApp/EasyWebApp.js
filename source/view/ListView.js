define([
    'jquery', './View', './HTMLView', '../InnerLink'
],  function ($, View, HTMLView, InnerLink) {

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

            return this;
        },
        /**
         * 插入一项
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param    {object}   data      - Data of one Item
         * @param    {number}   [index=0] - Index of Insert Point
         * @param    {boolean}  [delay]   - Create one HTMLView, and not insert
         *
         * @returns  {HTMLView} Newly created Item
         */
        insert:     function (data, index, delay) {

            var Item = (new HTMLView(this.__HTML__, this.__data__)).parse();

            Item.$_View.find( InnerLink.HTML_Link ).addBack( InnerLink.HTML_Link )
                .each(function () {

                    new InnerLink( this );
                });

            data.__index__ = index = index || 0;

            this.splice(index,  0,  Item.render( data ));

            this.__data__.splice(index,  0,  Item.__data__);

            if (! delay)  Item.$_View.insertTo(this.$_View, index);

            return Item;
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

            index = index || 0;

            if ($.likeArray( list ))
                $(Array.from(list,  function (data, i) {

                    return  this.insert(data, index + i, true).$_View[0];

                },  this)).insertTo(this.$_View, index);

            return this;
        },
        /**
         * 根据 HTML 节点查询索引
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param    {jQueryAcceptable} $_Item - An HTMLElement in one of the List
         *
         * @returns  {number}           Index of $_Item
         */
        indexOf:    function ($_Item) {

            $_Item = ($_Item instanceof $)  ?  $_Item  :  $( $_Item );

            return (
                ($_Item[0].parentNode == this.$_View[0])  ?
                    $_Item  :  $_Item.parentsUntil( this.$_View )
            ).slice( -1 ).index();
        },
        /**
         * 删除一项
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param    {number}   index - Index of Remove Point
         *
         * @returns  {HTMLView} Newly removed Item
         */
        remove:     function (index) {

            var Item = this.splice(
                    $.isNumeric( index )  ?  index  :  this.indexOf( index ),  1
                )[0];

            Item.$_View.remove();

            return Item;
        },
        /**
         * 列表排序
         *
         * @author   TechQuery
         *
         * @memberof ListView.prototype
         *
         * @param    {function} callback - Same as the callback of
         *                                 Array.prototype.sort()
         *
         * @returns  {ListView} Current ListView
         */
        sort:       function (callback) {

            Array.prototype.sort.call(this, callback);

            this.$_View.append($.map(this,  function (Item) {

                Item.__index__ = arguments[1];

                return Item.$_View[0];
            }));

            return this;
        }
    });

    return ListView;

});
