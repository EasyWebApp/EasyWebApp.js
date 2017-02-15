define([
    'jquery', 'marked', 'MediumEditor', 'EasyWebUI', 'EasyWebApp', 'QRcode'
],  function ($, marked, MediumEditor) {

    $.ajaxSetup({
        dataFilter:    function (iData) {
            var iName = $.fileName( this.url ).split('.');

            switch (iName[1]  &&  (iName.slice(-1)[0] || '').toLowerCase()) {
                case 'md':          ;
                case 'markdown':    return  marked( iData );
                case '':            break;
                default:            return iData;
            }

            iData = JSON.parse( iData );

            if ( iData.code )
                self.alert( iData.message );
            else {
                if (this.type.toUpperCase() != 'GET')
                    self.alert( iData.message );

                iData = iData.data || { };
            }

            return  JSON.stringify( iData );
        }
    });

    $(document).ready(function () {

        $('#Main_Nav').scrollFixed(function () {
            $(this.firstElementChild)[
                (arguments[0] == 'fixed')  ?  'addClass'  :  'removeClass'
            ]('focus');
        });

        var $_App = $('#Main_Content');

        $('#Toolkit .Icon.Pen').click(function () {

            if ($_App[0].contentEditable == "true")
                MediumEditor.getEditorFromElement( $_App[0] ).destroy();
            else
                new MediumEditor( $_App[0] );
        });

        var $_ReadNav = $('#Content_Nav').iReadNav( $_App ).scrollFixed(),
            $_Toolkit = $('#Toolkit'),
            $_QRcode = $('#QRcode > .Body');

        $_App.iWebApp().on('ready',  '(list\\.html|ReadMe\\.md)',  function () {

            $_Toolkit.hide();

        }).on('ready',  '(content\\.html|\\.md)',  function () {

            $_ReadNav.trigger('Refresh');

            if (! $.browser.mobile)  $_Toolkit.show();

            var iTitle = this.$_Root.find('h1').text() || '';

            document.title = iTitle + ' - EasyWiki';

            $_QRcode.empty().qrcode({
                render:        $.browser.modern ? 'image' : 'div',
                ecLevel:       'H',
                radius:        0.5,
                mode:          2,
                label:         iTitle.slice(0, 10),
                text:          self.location.href,
                background:    'white'
            });
        });
    });
});