define(['jquery', 'TimePassed', 'iQuery+', 'EasyWebApp'],  function ($, TimePassed) {

    var BOM = self;

    $.ajaxSetup({
        dataType:    'jsonp',
        cache:       true
    });

    function Object_Filter(iValue) {
        iValue.title = iValue.title || iValue.name;

        if ((iValue.name || '').match(/^\S+?（.）/))  return;

        iValue.img = iValue.img || iValue.src;

        if (iValue.img) {
            if (iValue.img.indexOf('default.jpg') > -1)  return;

            if (! iValue.img.match(/^http(s)?:\/\//))
                iValue.img = 'http://tnfs.tngou.net/img' + iValue.img;
        }
        iValue.timePassed = iValue.time ?
            TimePassed(iValue.time) : iValue.keywords;

        iValue.list = $.map(iValue.list, arguments.callee);

        return iValue;
    }

    BOM.Data_Filter = function (iModule, iData) {
        if (! iData.status)
            return  BOM.alert("【服务器报错】" + iData.msg);

        return  iData.tngou  ?
            $.map(iData.tngou, Object_Filter)  :  Object_Filter( iData );
    };

    $(document).ready(function () {
        var iApp = $('body > .PC_Narrow').iWebApp('http://www.tngou.net/api/');

        iApp.on('data', Data_Filter);

        $('.NavBar > .DropDown > .Body').each(function () {
            $.ListView(this,  false,  function ($_Item, iValue) {
                $_Item.text( iValue.name ).attr('title', iValue.title);
            });
        })[0].parentNode.click();
    });
});
