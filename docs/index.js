require(['jquery', 'marked', 'EasyWebUI', 'EasyWebApp'],  function ($, marked) {

    $.ajaxSetup({
        dataFilter:    function () {
            return  ($.fileName( this.url ).match(/\.(md|markdown)$/i))  ?
                marked( arguments[0] )  :  arguments[0];
        }
    });

    $(document).ready(function () {

        $('#Main_Nav').scrollFixed(function () {
            $(this.firstElementChild)[
                (arguments[0] == 'fixed')  ?  'addClass'  :  'removeClass'
            ]('focus');
        });

        var $_App = $('#Main_Content');

        $('#Content_Nav').iReadNav( $_App ).scrollFixed( $.noop );

        $_App.iWebApp().on('data',  '',  'index.json',  function (iLink, iData) {

            $.ListView(iLink.$_DOM,  false,  function ($_Item, iValue) {

                $_Item.children().attr(iValue);
            });

            return iData;

        }).on('ready',  '.md',  function () {

            $_App.trigger('Refresh');
        });
    });
});
