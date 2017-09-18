define([
    'jquery', './View', './HTMLView', '../InnerLink'
],  function ($, View, HTMLView, InnerLink) {

    function ListView($_View, iScope) {

        var _This_ = View.call(this, $_View, iScope);

        if (_This_ !== this)  return _This_;

        this.setPrivate({
            HTML:     this.$_View.html(),
            parse:    $.now()
        }).clear();
    }

    View.extend(ListView, {
        is:    $.expr[':'].list
    }, {
        splice:     Array.prototype.splice,
        clear:      function () {

            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        },
        insert:     function (iData, Index, iDelay) {

            var Item = (new HTMLView(this.__HTML__, this.__data__)).parse();

            Item.$_View.find( InnerLink.HTML_Link ).addBack( InnerLink.HTML_Link )
                .each(function () {

                    new InnerLink( this );
                });

            iData.__index__ = Index = Index || 0;

            this.splice(Index,  0,  Item.render( iData ));

            this.__data__.splice(Index,  0,  Item.__data__);

            if (! iDelay)  Item.$_View.insertTo(this.$_View, Index);

            return Item;
        },
        render:     function (list, index) {

            if (! (index != null))  this.clear();

            index = index || 0;

            if ($.likeArray( list ))
                $(Array.from(list,  function (data, i) {

                    return  this.insert(data, index + i, true).$_View[0];

                },  this)).insertTo(this.$_View, index);

            return this;
        },
        indexOf:    function ($_Item) {

            $_Item = ($_Item instanceof $)  ?  $_Item  :  $( $_Item );

            return (
                ($_Item[0].parentNode == this.$_View[0])  ?
                    $_Item  :  $_Item.parentsUntil( this.$_View )
            ).slice( -1 ).index();
        },
        remove:     function (Index) {

            var Item = this.splice(
                    $.isNumeric( Index )  ?  Index  :  this.indexOf( Index ),  1
                )[0];

            Item.$_View.remove();

            return Item;
        },
        sort:       function () {

            Array.prototype.sort.call(this, arguments[0]);

            this.$_View.append($.map(this,  function (Item) {

                Item.__index__ = arguments[1];

                return Item.$_View[0];
            }));

            return this;
        },
        valueOf:    function () {

            return  $.map(this,  function () {

                return arguments[0].valueOf();
            });
        }
    });

    return ListView;

});