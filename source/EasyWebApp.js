//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v2.5  (2016-05-21)  Stable
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

    $.fn.extend($.map(
        $.makeSet.apply($, $.map([
            'pageLoad', 'formSubmit', 'apiCall', 'pageRender', 'pageReady', 'appExit'
        ],  function () {
            return  ('on-' + arguments[0]).toCamelCase();
        })),
        function (iValue, iType) {
            return  function () {
                var iArgs = $.makeArray(arguments);

                var iHTML = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
                var iJSON = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
                var iCallback = (typeof iArgs[0] == 'function')  &&  iArgs[0];

                if ((iHTML || iJSON)  &&  iCallback)
                    this.WebApp().on(iType,  function (This_Page) {
                        var Page_Match = (iHTML && iJSON)  ?  2  :  1;

                        if (iHTML  &&  (This_Page.HTML || '').match(iHTML))
                            Page_Match-- ;
                        if (iJSON  &&  (This_Page.JSON || '').match(iJSON))
                            Page_Match-- ;

                        if (! Page_Match) {
                            var iArgs = $.makeArray( arguments );
                            iArgs.unshift( iArgs.pop() );

                            return  iCallback.apply(this, iArgs);
                        }
                    });

                return this;
            };
        }
    ));

});