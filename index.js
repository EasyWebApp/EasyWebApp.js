define(['jquery', 'TimePassed', 'iQuery+', 'EasyWebApp'],  function ($, TimePassed) {

    var BOM = self;

    $.ajaxSetup({
        crossDomain:    true,
        dataType:       'jsonp'
    });

    function Object_Filter(iValue) {
        iValue.title = iValue.title || iValue.name;

        if ((iValue.name || '').match(/^\S+?（.）/))  return;

        if (iValue.img) {
            if (iValue.img.indexOf('default.jpg') > -1)  return;

            if (! iValue.img.match(/^http(s)?:\/\//))
                iValue.img = 'http://tnfs.tngou.net/img' + iValue.img;
        }
        iValue.timePassed = iValue.time ?
            TimePassed(iValue.time) : iValue.keywords;

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

        $('.NavBar > .DropDown > .Body').each(function () {
            $.ListView(this,  false,  function ($_Item, iValue) {
                $_Item.text( iValue.name ).attr('title', iValue.title)[0]
                    .setAttribute('src',  $.extendURL($_Item[0].getAttribute('src'), {
                        id:    iValue.id
                    }));
            });
        });
        $('body > .Head > h1')[0].click();
    });
});
