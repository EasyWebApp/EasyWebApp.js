//define(['jquery'],  function ($) {

    $('body > .PC_Narrow').on('data',  function () {
        if ($.fileName( arguments[2].url )  !=  'list')  return;

        $.ListView($('ol.CenterX', this),  true,  function ($_Item, iValue) {
            $_Item.attr({
                title:    iValue.description,
                src:      $_Item[0].getAttribute('src') + iValue.id
            }).find('small > span')[0].title =
                 (new Date(iValue.time)).toLocaleString();
        });
    });
//});