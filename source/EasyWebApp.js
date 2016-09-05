//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-09-05)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
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

    var BOM = self,  DOM = self.document;

    $.ajaxSetup({dataType: 'json'});

    $(DOM).on('click',  'a[href]:not(a[target="_blank"])',  function () {

        var iURL = this.href.split('#!');

        if (iURL[1]  &&  (iURL[0] == DOM.URL.split('#!')[0])) {
            arguments[0].preventDefault();

            (new WebApp()).load( iURL[1] );
        }
    }).on('click submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')  return;

            iEvent.preventDefault();
        }

        iEvent.stopPropagation();

        var iLink = new InnerLink(new WebApp(), this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                UI_Module.prototype.loadJSON.call({
                    source:    iLink,
                    data:      iLink.ownerView.getData()
                }).then(function () {
                    iLink.ownerApp.trigger(
                        'data',  '',  iLink.src || iLink.action,  [
                            iLink.valueOf(),  arguments[0]
                        ]
                    );
                });
                break;
            case '_self':     ;
            default:          (new UI_Module(iLink)).load();
        }
    }).change(function () {

        var $_VS = $( arguments[0].target );

        UI_Module.instanceOf( $_VS )
            .data[ $_VS[0].getAttribute('name') ] = $_VS.val();
    });
});
