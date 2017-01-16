define(['jquery', 'EasyWebApp'],  function ($) {

    function PageData(iLink, iData) {

        var tBody = this.getModule( iLink.$_DOM );

        this.getModule( tBody.$_View[0].parentNode ).update(
            'pageSum',  Math.ceil(iData.total / tBody.template.scope.pageSize)
        );

        return iData.list;
    }

    return  function () {
        var $_Number = this.on('data', 'tbody', PageData)
                .$_View.find('table + * [type="number"]');

        this.$_View.on('click',  'table + * li',  function () {

            var Index = parseInt( this.textContent );

            if ( Index )  $_Number.val( Index ).change();
        });
    };
});