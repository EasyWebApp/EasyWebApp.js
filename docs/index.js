define(['jquery', 'marked', 'EasyWebUI', 'EasyWebApp'],  function ($, marked) {

    $.ajaxSetup({
        dataFilter:    function () {
            return  ($.fileName( this.url ).match(/\.(md|markdown)$/i))  ?
                marked( arguments[0] )  :  arguments[0];
        }
    });

    $(document).ready(function () {

        $('body > .Head > .NavBar').scrollFixed(function () {
            $(this.firstElementChild)[
                (arguments[0] == 'fixed')  ?  'addClass'  :  'removeClass'
            ]('focus');
        });

        $('body > .PC_Narrow').iWebApp()
            .on('data',  '',  'index.json',  function (iLink, iData) {

                $.ListView(iLink.$_DOM,  false,  function ($_Item, iValue, Index) {
                    $_Item = $_Item.children().attr(iValue);

                    if (Index != 1)  $_Item[0].removeAttribute('autofocus');
                });

                return iData;
            });
    });
});
