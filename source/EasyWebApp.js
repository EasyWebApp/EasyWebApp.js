//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v2.6  (2016-05-31)  Alpha
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+,
//
//                   [ marked.js ]  (for MarkDown rendering)
//
//      [Usage]      A Light-weight WebApp Framework
//                   jQuery Compatible API.
//
//
//              (C)2015-2016    shiy2008@gmail.com
//


define(['SPACore', 'jquery'],  function (WebApp, $) {

/* ---------->> jQuery Wrapper <<---------- */

    $.fn.WebApp = function () {
        if (! this[0])  return;

        var iWebApp = $(this[0]).data('_EWAI_');

        if (iWebApp instanceof WebApp)  return iWebApp;

        var iArgs = $.makeArray(arguments);

        var Init_Data = $.extend(
                $.parseJSON(BOM.sessionStorage.EWA_Model || '{ }'),
                $.paramJSON(),
                $.isPlainObject(iArgs[0])  &&  iArgs.shift()
            );
        var API_Root = (typeof iArgs[0] == 'string') && iArgs.shift();
        var Cache_Second = (typeof iArgs[0] == 'number') && iArgs.shift();
        var URL_Change = (typeof iArgs[0] == 'boolean') && iArgs[0];

        iWebApp = (new WebApp(
            this,  API_Root,  Cache_Second,  URL_Change
        )).boot(Init_Data);

        $(this[0]).data('_EWAI_', iWebApp).addClass('EWA_Container');

        return iWebApp;
    };

});