//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.1  (2016-11-22)  Alpha
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

        var iLink = new InnerLink(new WebApp(), this),  iModule;

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':    {
                iModule = $.extend({
                    ownerApp:    iLink.ownerApp,
                    source:      iLink,
                    data:        iLink.ownerView.data
                }, UI_Module.prototype);

                iModule.loadJSON().then(function () {

                    iModule.trigger('data', arguments[0]);
                });
                break;
            }
            case '_self':     ;
            default:          {
                iModule = iLink.ownerApp.getModule( iLink.$_DOM );

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

        var iName = $_VS[0].getAttribute('name');

        var iModule = UI_Module.instanceOf( $_VS );

        iModule.data.setValue(iName, iValue);

        if (! iModule.template)  return;

        var iData = { };
        iData[iName] = iValue;

        iModule.template.render( iData );
    });

});
