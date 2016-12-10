require(['jquery', 'iQuery+'],  function ($) {

    $('body > .PC_Narrow').iWebApp().component(function () {

        var $_List = $('ol.CenterX', this.$_View[0]);

        if ($.fileName( this.source.action )  ==  'search')
            $( $_List[0].children[0] ).attr('src',  function () {
                return  arguments[1].replace(/\$\{.+?\}/, 'top');
            });

        $.ListView($_List, true);
    });
});
