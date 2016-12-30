//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.3  (2016-12-30)  Beta
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

        var iLink = new InnerLink(new WebApp(), this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                UI_Module.prototype.loadJSON.call({
                    ownerApp:    iLink.ownerApp,
                    source:      iLink,
                    template:    iLink.ownerView.template
                });
                break;
            case '_self':     ;
            default:          {
                var iModule = UI_Module.instanceOf( iLink.$_DOM );

                if (iModule  &&  (iModule.domReady instanceof Promise))
                    break;

                iModule = UI_Module.instanceOf(iLink.getTarget(), false);

                (((! iModule)  ||  (iModule.type == 'page'))  ?
                    (new UI_Module(iLink))  :  iModule
                ).load();
            }
        }
    });

/* ----- 视图数据监听 ----- */

    function No_Input(iEvent) {
        var iKey = iEvent.which;

        return  (iEvent.type == 'keyup')  &&  (
            iEvent.ctrlKey || iEvent.shiftKey || iEvent.altKey || (
                (iKey != 8)  &&  (iKey != 46)  &&  (
                    (iKey < 48)  ||  (iKey > 105)  ||
                    ((iKey > 90)  &&  (iKey < 96))
                )
            )
        );
    }

    function Data_Change() {
        var iName = this.getAttribute('name'),
            iTemplate = HTML_Template.instanceOf( this );

        if (iName  &&  iTemplate  &&  (! No_Input( arguments[0] )))
            UI_Module.instanceOf( this ).update(
                iTemplate,  iName,  $(this).value('name')
            );
    }

    var Only_Change = ['select', 'textarea', '[designMode]'].concat(
            $.map([
                'hidden', 'radio', 'checkbox', 'number', 'search',
                'file', 'range', 'date', 'time', 'color'
            ],  function () {
                return  'input[type="' + arguments[0] + '"]';
            })
        ).join(', ');

    $(DOM)
        .on('change', Only_Change, Data_Change)
        .on(
            'keyup paste',
            ':input:not(:button, ' + Only_Change + ')',
            $.throttle( Data_Change )
        );

});
