//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-10-21)  Beta
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

        var iURL = this.href.split('#');

        if (iURL[0] != DOM.URL.split('#')[0])
            return  this.target = '_blank';

        arguments[0].preventDefault();

        iURL = (iURL[1][0] == '!')  &&  iURL[1].slice(1);

        if (iURL)  (new WebApp()).load(iURL);

    }).on('click submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')  return;

            iEvent.preventDefault();
        } else if ( iEvent.isPseudo() )
            return;

        iEvent.stopPropagation();

        var iLink = new InnerLink(new WebApp(), this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                UI_Module.prototype.loadJSON.call({
                    source:    iLink,
                    data:      iLink.ownerView.data
                }).then(function () {
                    iLink.ownerApp.trigger(
                        'data',  '',  iLink.src || iLink.action,  [
                            iLink.valueOf(),  arguments[0]
                        ]
                    );
                });
                break;
            case '_self':     ;
            default:          {
                var iModule = iLink.ownerApp.getModule( iLink.$_DOM );

                if ((! iModule)  ||  !(iModule.domReady instanceof Promise))
                    (new UI_Module(iLink)).load();
            }
        }
    }).change(function () {

        var $_VS = $( arguments[0].target );

        var iValue = $_VS.val();

        try {
            iValue = $.parseJSON( iValue );
        } catch (iError) { }

        UI_Module.instanceOf( $_VS )
            .data.setValue($_VS[0].getAttribute('name'), iValue);
    });

});
