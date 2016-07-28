define(['jquery', 'TimePassed', 'EasyWebApp'],  function ($, TimePassed) {
    $.ajaxSetup({
        crossDomain:    true,
        dataType:       'jsonp'
    });

    function Object_Filter(iValue) {
        if (iValue.img)
            iValue.img = 'http://tnfs.tngou.net/img' + iValue.img;

        if (iValue.time)
            iValue.timePassed = TimePassed(iValue.time);

        return iValue;
    }

    function Data_Filter() {
        return  arguments[1].tngou  ?
            $.map(arguments[1].tngou, Object_Filter)  :
            Object_Filter( arguments[1] );
    }

    $(document).ready(function () {
        $.ListView('body > .Head > .NavBar',  false,  function ($_Item, iValue) {
            $_Item.text( iValue.name.slice(0, 2) )[0]
                .setAttribute(
                    'src',  $_Item[0].getAttribute('src') + iValue.id
                );
        }).$_View.on('data', Data_Filter);

        $('body > .PC_Narrow').on('data',  function () {
            if ($.fileName( arguments[2].url )  !=  'list')  return;

            $.ListView($('ol.CenterX', this),  true,  function ($_Item, iValue) {
                $_Item.attr({
                    title:    iValue.description,
                    src:      $_Item[0].getAttribute('src') + iValue.id
                }).find('small > span')[0].title =
                     (new Date(iValue.time)).toLocaleString();
            });
        }).on('data', Data_Filter);

        $('body > .Head > h1')[0].click();
    });
});