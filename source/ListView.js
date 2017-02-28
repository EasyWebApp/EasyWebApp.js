define(['jquery', 'HTMLView'],  function ($, HTMLView) {

    function ListView($_View) {

        this.$_View = $( $_View );

        this.$_Template = this.$_View.children().remove();

        this.length = 0;
    }

    $.extend(ListView.prototype, {
        splice:    Array.prototype.splice,
        insert:    function (iData, Index) {

            var Item = new HTMLView(
                    this.$_Template.clone(false, true).insertTo(this.$_View, Index)
                );
            this.splice(Index || 0,  0,  Item.render( iData ));
        },
        render:    function (iList) {

            $.map(iList,  $.proxy(this.insert, this));

            return this;
        },
        remove:    function (Index) {

            this.splice(Index, 1)[0].$_View.remove();
        },
        clear:     function () {
            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        }
    });

    return ListView;

});