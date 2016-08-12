define(['jquery', 'EasyWebApp'],  function ($) {

    $.fn.iWebApp.fn.itemDelete = function ($_View, iAPI, ConfirmBack) {
        var iApp = this;

        $_View.on('click',  '*[method="DELETE"]',  function () {
            var iLV = $.ListView.instanceOf(this);

            var $_Item = $(this).parentsUntil( iLV.$_View ).slice(-1);

            return  ConfirmBack() &&
                iApp.one('data',  '',  iAPI,  function (iLink, iData) {
                    if (
                        (iLink.method.toUpperCase() != 'DELETE')  ||
                        iData.code
                    )
                        return;

                    iLV.remove($_Item);
                });
        });

        return this;
    };
});