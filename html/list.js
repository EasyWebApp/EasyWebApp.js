//define(['jquery'],  function ($) {

    $('body > .PC_Narrow').on('data',  function () {
        if (! $.fileName( arguments[1].src ).match(/list|search/))
            return;

        $.ListView($('ol.CenterX', this),  true,  function ($_Item, iValue) {
            $_Item.attr({
                title:    iValue.description,
                src:      $.extendURL($_Item[0].getAttribute('src'), {
                    id:    iValue.id
                })
            }).find('small > span')[0].title =
                 (new Date(iValue.time)).toLocaleString();
        });
    });
//});