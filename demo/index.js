define(['jquery', 'TimePassed', 'EasyWebApp'],  function ($, TimePassed) {

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

    $(document).ready(function () {

        var iApp = $('body > .PC_Narrow').iWebApp('http://www.tngou.net/api/');

        iApp.on('data',  function (iLink, iData) {
            if (! iData.status)
                return  self.alert("【服务器报错】" + iData.msg);

            if (! iData.tngou)  return  Object_Filter( iData );

            iData = $.map(iData.tngou, Object_Filter);

            return  iLink.href  ?  {list: iData}  :  iData;
        });
    });
});
