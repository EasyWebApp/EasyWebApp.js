//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.2  (2016-12-01)  Alpha
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
    'jquery', 'WebApp', 'InnerLink', 'UI_Module', 'HTML_Template'
],  function ($, WebApp, InnerLink, UI_Module, HTML_Template) {

    var BOM = self,  DOM = self.document;

    $.ajaxSetup({dataType: 'json'});


/* ----- SPA 链接事件 ----- */

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
    });

/* ----- 视图数据监听 ----- */

    function Data_Change() {
        var iValue = $(this).value('name');

        try {
            iValue = eval( iValue );
        } catch (iError) { }

        iValue = (iValue != null)  ?  iValue  :  '';

        var iName = this.getAttribute('name');

        UI_Module.instanceOf( this ).data.setValue(iName, iValue);

        var iData = { };
        iData[iName] = iValue;

        HTML_Template.instanceOf( this ).render( iData );
    }

    $(DOM)
        .on('change', 'select', Data_Change)
        .on('keyup paste', ':input:not(select)', Data_Change);

});
