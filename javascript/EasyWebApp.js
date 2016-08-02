//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-08-02)  Alpha
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+,
//
//                   [ marked.js ]  (for MarkDown rendering)
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2016    shiy2008@gmail.com
//


define([
    'jquery', 'WebApp', 'InnerLink', 'UI_Module'
],  function ($, WebApp, InnerLink, UI_Module) {

    $.fn.iWebApp = function () {
        return  this[0]  &&  (new WebApp(this[0], arguments[0]));
    };

    $(document).on('click change submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')
                return;
            else
                iEvent.preventDefault();
        } else if (
            (this !== iEvent.target)  &&
            $(iEvent.target).parentsUntil(this).addBack().filter('a')[0]
        )
            return;

        iEvent.stopPropagation();

        var iWebApp = new WebApp();

        var iLink = new InnerLink(iWebApp, this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                iLink.loadData(
                    UI_Module.prototype.getData.call({source: iLink}),
                    function () {
                        iWebApp.trigger('data',  '',  iLink.src || iLink.action,  [
                            iLink.valueOf(),  arguments[0]
                        ]);
                    }
                );
                break;
            case '_self':     ;
            default:          (new UI_Module(iLink, { })).load();
        }
    });
});
