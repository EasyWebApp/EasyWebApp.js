define(['jquery', './ListView'],  function ($, ListView) {

    function TreeView($_View, scope) {

        $_View = $( $_View );

        this.setPrivate('self',  $_View[0].cloneNode( true ));

        this.__self__.removeAttribute('id');

        $_View.children().append(this.__self__ = this.__self__.outerHTML);

        var _This_ = ListView.call(this, $_View, scope);

        if (_This_ !== this)  return _This_;
    }

//  Tree Data Convert (Flat to 3D)

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