require([
    'jquery', 'marked', 'MediumEditor', 'EasyWebUI', 'EasyWebApp', 'QRcode'
],  function ($, marked, MediumEditor) {

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

        var $_Toolkit = $('#Toolkit'),  $_QRcode = $('#QRcode > .Body');

        $_App.iWebApp().on({
            type:    'template',
            href:    /\.md$/i
        },  function () {

            return  marked( arguments[1] );

        }).on('data',  function (iEvent, iData) {

            if (iData.code  ||  (iEvent.method.toUpperCase() != 'GET'))
                self.alert( iData.message );

            return  iData.data || iData;
        }).on({
            type:    'ready',
            href:    /(List\.html|ReadMe\.md)/
        },  function () {

            $_Toolkit.hide();

        }).on({
            type:    'ready',
            href:    /(content\.html|\.md)/
        },  function () {

            if (! $.browser.mobile)  $_Toolkit.show();

            var iTitle = this.$_View.find('h1').text() || '';

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