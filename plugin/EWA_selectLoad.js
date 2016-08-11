define(['jquery', 'EasyWebApp'],  function ($) {

    $.fn.iWebApp.fn.selectLoad = function (
        API_Path,  Value_Key,  Data_Filter,  Page_URL,  API_Setter
    ) {
        if ( Page_URL )
            this.on('ready',  Page_URL,  function () {
                var iApp = this;

                $('form', this.$_Root[0]).on('change',  'select',  function () {

                    if ((! $.isNumeric(this.value))  ||  (! this.nextElementSibling))
                        return;

                    iApp.getModule(
                        $(this.nextElementSibling).attr('src', API_Setter)
                    ).load();
                });
            });

        return  this.on('data',  '',  API_Path,  function (iLink, iData) {

            $.ListView(iLink.$_DOM,  false,  function () {

                arguments[0][0].value = arguments[1][Value_Key];
            });

            return  (typeof Data_Filter == 'function')  ?
                Data_Filter.apply(this, arguments)  :  iData;

        }).on('ready',  '',  API_Path,  function (iLink) {

            var pModule = this.getModule( iLink.$_DOM[0].parentNode );

            iLink.$_DOM.val(
                pModule.source.src  ?
                    pModule.data[ iLink.$_DOM[0].name ]  :
                    iLink.$_DOM[0].children[0].value
            ).change();
        });
    };
});