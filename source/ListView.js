define(['jquery', 'View', 'HTMLView'],  function ($, View, HTMLView) {

    function ListView() {

        var _This_ = View.apply(this, arguments);

        if (this != _This_)  return _This_;

        this.template = this.$_View.html();

        this.clear();
    }

    return  $.inherit(View, ListView, null, {
        splice:    Array.prototype.splice,
        clear:     function () {
            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        },
        insert:    function (iData, Index) {

            var Item = (new HTMLView( this.template )).parse();

            Item.$_View.insertTo(this.$_View, Index);

            this.splice(Index || 0,  0,  Item.render( iData ));
        },
        render:    function (iList) {

            $.map(iList,  $.proxy(this.insert, this));

            return this;
        },
        remove:    function (Index) {

            this.splice(Index, 1)[0].$_View.remove();
        }
    });
});