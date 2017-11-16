define(['jquery', './ListView'],  function ($, ListView) {

    /**
     * 树形视图类（对应 JSON 数组 + 对象）
     *
     * @author  TechQuery
     *
     * @class   TreeView
     * @extends ListView
     *
     * @param   {jQueryAcceptable} $_View  - Container DOM of TreeView
     * @param   {object}           [scope] - Data object as a scope
     * @param   {(string|URL)}     [base]
     *
     * @returns {TreeView}             Return the last one if a TreeView instance
     *                                 has been created on this element
     */

    function TreeView($_View, scope, base) {

        $_View = $( $_View );

        this.setPrivate('self',  $_View[0].cloneNode( true ));

        this.__self__.removeAttribute('id');

        $_View.children().append(this.__self__ = this.__self__.outerHTML);

        var _This_ = ListView.call(this, $_View, scope, base);

        if (_This_ !== this)  return _This_;
    }

    /**
     * 平铺数据 转换为 立体数据
     *
     * @author   TechQuery
     *
     * @memberof TreeView
     *
     * @param    {object[]} list               Flat Data of a Tree
     * @param    {string}   [child_key='list'] Key of a Tree Branch in HTML Template
     *
     * @returns  {object[]} 3D Data of a Tree
     */

    TreeView.fromFlat = function (list, child_key) {

        child_key = child_key || 'list';

        var TempMap = { };

        $.each($.extend(true, [ ], list),  function () {

            var _This_ = TempMap[ this.id ];

            _This_ = TempMap[ this.id ] = _This_ ?
                $.extend(this, _This_)  :  this;

            this.pid = this.pid || 0;

            var parent = TempMap[ this.pid ] = TempMap[ this.pid ]  ||  { };

            (parent[ child_key ] = parent[ child_key ]  ||  [ ]).push(_This_);
        });

        return  TempMap[0][ child_key ];
    };

    return  ListView.extend( TreeView );

});
