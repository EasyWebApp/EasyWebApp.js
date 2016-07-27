//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v2.6  (2016-07-27)  Beta
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


define(['jquery', 'WebApp', 'PageLink'],  function ($, WebApp, PageLink) {

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

/* ---------- User Event Switcher ---------- */

    var No_Hook = $.makeSet('form', 'input', 'textarea', 'select');

    function Event_Filter() {
        var iTagName = this.tagName.toLowerCase(),
            iEvent = arguments.callee.caller.arguments[0];

        switch (iEvent.type) {
            case 'click':     ;
            case 'tap':       {
                if (iTagName == 'a') {
                    if (this.matches('a[rel*="nofollow"]'))  return true;

                    iEvent.preventDefault();
                }
                return  (iTagName in No_Hook);
            }
            case 'change':    return  (this !== iEvent.target);
        }
    }

    $(DOM).on(
        ($.browser.mobile ? 'tap' : 'click') + ' change',
        '*[target]',
        function () {
            if ( Event_Filter.call(this) )  return;

            var iLink = new PageLink($('.EWA_Container').WebApp(), this);

            switch (iLink.target) {
                case '_self':     {
                    if (iLink.href)  iLink.loadTemplate();
                    break;
                }
                case '_blank':    {
                    if (iLink.src)  iLink.loadData();
                    break;
                }
                case '_top':      {
                    if (iLink.href)  iLink.loadPage();
                    break;
                }
                default:          iLink.loadTemplate();
            }
        }
    );
});