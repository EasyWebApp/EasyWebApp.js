define(['jquery', 'TimePassed', 'iQuery+', 'EasyWebApp'],  function ($, TimePassed) {

    var BOM = self;

    $.ajaxSetup({
        crossDomain:    true,
        dataType:       'jsonp'
    });

    function Object_Filter(iValue) {
        if (iValue.img) {
            if (iValue.img.match(/\/top\/default\.jpg$/))  return;

            if (! iValue.img.match(/^http(s)?:\/\//))
                iValue.img = 'http://tnfs.tngou.net/img' + iValue.img;
        }
        if (iValue.time)
            iValue.timePassed = TimePassed(iValue.time);

        return iValue;
    }

    BOM.Data_Filter = function () {
        var iData = arguments[0].data;

        return  iData.tngou  ?
            $.map(iData.tngou, Object_Filter)  :  Object_Filter( iData );
    };

    $(document).ready(function () {
        var iApp = $('body > .PC_Narrow').iWebApp('http://www.tngou.net/api/');

        iApp.on('data', Data_Filter);

        $.ListView('body > .Head > .NavBar',  false,  function ($_Item, iValue) {
            $_Item.text( iValue.name.slice(0, 2) )[0]
                .setAttribute(
                    'src',  $_Item[0].getAttribute('src') + iValue.id
                );
        }).$_View.on('data', Data_Filter);

        $('body > .Head > h1')[0].click();
    });
});
