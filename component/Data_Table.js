require(['jquery', 'EasyWebApp'],  function ($) {

    var iWebApp = $().iWebApp();

    iWebApp.component(function () {

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('[data-href]')[0]
            },
            $_tBody = this.$_View.find('tbody');

        var VM = this.on('update',  function () {

                this.$_View.find('[type="number"]').val(1).change();
            });

        var iList = $( iEvent.target ).view('ListView');

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            VM.render({
                total:      iData.total,
                pageSum:    Math.ceil(iData.total / VM.rows)
            });

            return iData.list;
        });

        return {
            pageChange:    function () {

                var iTarget = arguments[0].target;

                var iValue = parseInt(iTarget.value || iTarget.textContent);

                this.render(
                    (iTarget.tagName == 'SELECT')  ?  'rows'  :  'page',  iValue
                );

                iList.clear();

                iWebApp.load( iEvent.target );
            }
        };
    });
});