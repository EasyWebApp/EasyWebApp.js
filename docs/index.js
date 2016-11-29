define(['jquery', 'marked', 'EasyWebUI', 'EasyWebApp'],  function ($, marked) {

    $.ajaxSetup({
        dataFilter:    function (iText) {
            return  ($.fileName( this.url ).match(/\.(md|markdown)$/i))  ?
                marked( iText )  :  iText;
        }
    });

    $(document).ready(function () {

        $('#Main_Nav').scrollFixed(function () {
            $(this.firstElementChild)[
                (arguments[0] == 'fixed')  ?  'addClass'  :  'removeClass'
            ]('focus');
        });

        var $_App = $('#Main_Content');

        var $_ReadNav = $('#Content_Nav').iReadNav( $_App ).scrollFixed();

        $_App.iWebApp().on('data',  '',  'index.json',  function () {

            $.ajaxSetup({
                headers:    {
                    Authorization:    'token ' + arguments[1].Git_Token
                }
            });
        }).on('ready',  '\\.(html|md)',  function () {

            $_ReadNav.trigger('Refresh');

        }).on('data',  '',  '/contents/',  function (_, iData) {
            return {
                content:    $.map(iData,  function () {
                    return  (arguments[0].type != 'dir')  ?  null  :  arguments[0];
                })
            };
        });
    });
});
