define(['jquery', 'TimePassed', 'EasyWebApp'],  function ($, TimePassed) {
    $.ajaxSetup({
        crossDomain:    true,
        dataType:       'jsonp'
    });

    function DataFilter() {
        return  $.map(arguments[1].tngou,  function (iValue) {
            if (iValue.img)
                iValue.img = 'http://tnfs.tngou.net/img' + iValue.img;

            if (iValue.time)
                iValue.timePassed = TimePassed(iValue.time);

            return iValue;
        });
    }

    $(document).ready(function () {
        $.ListView('body > .Head > .NavBar',  false,  function ($_Item, iValue) {
            $_Item.text( iValue.name.slice(0, 2) )[0]
                .setAttribute(
                    'src',  $_Item[0].getAttribute('src') + iValue.id
                );
        }).$_View.on('data', DataFilter);

        $('body > .PC_Narrow').on('data', DataFilter);

        $('body > .Head > h1')[0].click();
    });
});