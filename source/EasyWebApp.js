//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.3  (2017-01-10)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
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

        (new WebApp()).boot( this );
    });

/* ----- 视图数据监听 ----- */

    var Only_Change = ['select', 'textarea', '[designMode]'].concat(
            $.map([
                'hidden', 'radio', 'checkbox', 'number', 'search',
                'file', 'range', 'date', 'time', 'color'
            ],  function () {
                return  'input[name][type="' + arguments[0] + '"]';
            })
        ).join(', ');

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
        var iTemplate = HTML_Template.instanceOf( this );

        if (iTemplate  &&  (! No_Input( arguments[0] )))
            UI_Module.instanceOf( this ).update(
                iTemplate,  this.getAttribute('name'),  $(this).value('name')
            );
    }

    $(DOM)
        .on('change', Only_Change, Data_Change)
        .on(
            'keyup paste',
            ':field:not(' + Only_Change + ')',
            $.throttle( Data_Change )
        );

});
