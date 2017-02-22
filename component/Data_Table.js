define(['jquery', 'EasyWebApp'],  function ($) {

    function PageData(_, iData) {

        this.getParent().update(
            'pageSum',  Math.ceil(iData.total / this.template.scope.rows)
        );

        return iData.list;
    }

    return  function () {
        this.bind('data', 'tbody', PageData);

        var $_Number = this.$_View.find('table + * [type="number"]');

        this.$_View.on('click',  'table + * li',  function () {

            var Index = parseInt( this.textContent );

            if ( Index )  $_Number.val( Index ).change();
        });
    };
});