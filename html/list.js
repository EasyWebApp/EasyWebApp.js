$('body > .PC_Narrow').iWebApp().on('data',  'list.html',  function () {

    $.ListView(
        $('ol.CenterX', arguments[0].$_View[0]),
        true,
        function ($_Item, iValue) {
            $_Item.attr('title', iValue.description)
                .find('small > span')[0].title =
                    (new Date(iValue.time)).toLocaleString();
        }
    );
});
