//define(['jquery'],  function ($) {

    $('body > .PC_Narrow').on('data',  function () {
        if (! $.fileName( arguments[2].url ).match(/list|search/))
            return;

        $.ListView($('ol.CenterX', this),  true,  function ($_Item, iValue) {
            var iURL = $.split($_Item[0].getAttribute('src'), '?', 2);

            $_Item.attr({
                title:    iValue.description,
                src:      iURL[0]  +  '?'  +  $.param($.extend(
                    $.paramJSON('?' + iURL[1]),  {id:  iValue.id}
                ))
            }).find('small > span')[0].title =
                 (new Date(iValue.time)).toLocaleString();
        });
    });
//});