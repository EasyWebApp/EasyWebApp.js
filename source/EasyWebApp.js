//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.5  (2017-03-02)  Beta
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
    'jquery', 'InnerLink', 'UI_Module', 'HTML_Template', 'Helper_API'
],  function ($, InnerLink, UI_Module, HTML_Template) {

    var BOM = self,  DOM = self.document;

    $.ajaxSetup({
        dataType:    'json',
        timeout:     30 * 1000
    });


/* ----- SPA 链接事件 ----- */

    $(DOM).on('click',  'a[href]:not(a[target="_blank"])',  function () {

        if (this.href.split('#')[0] != DOM.URL.split('#')[0])
            return  this.target = '_blank';

        arguments[0].preventDefault();

        $().iWebApp().loadLink( this );

    }).on('click submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')  return;

            iEvent.preventDefault();
        } else if ( iEvent.isPseudo() )
            return;

        iEvent.stopPropagation();

        $().iWebApp().boot( this );
    });

/* ----- 视图数据监听 ----- */

    var Only_Change = $.map(['select', 'textarea', '[designMode]'].concat(
            $.map([
                'hidden', 'radio', 'checkbox', 'number', 'search',
                'range', 'date', 'time', 'color'
            ],  function () {
                return  'input[type="' + arguments[0] + '"]';
            })
        ),  function () {  return  arguments[0] + '[name]';  }).join(', ');

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

    $(DOM).on('change', Only_Change, Data_Change)
        .on(
            $.browser.mobile ? 'input' : 'keyup paste',
            ':field:not(' + Only_Change + ')',
            $.throttle( Data_Change )
        );

});
