require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    var iWebApp = new EWA();


    EWA.component(function () {

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('tbody')[0]
            },
            VM = this.on('update',  function () {

                this.$_View.find('[type="number"]').val(1).change();
            });

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            VM.render({
                total:      iData.total,
                pageSum:    Math.ceil(iData.total / VM.rows)
            });

            return iData.list;
        });

        $.extend(arguments[0], {
            pageChange:    function () {

                var iTarget = arguments[0].target;

                var iValue = parseInt(iTarget.value || iTarget.textContent);

                if (! iValue)  return;

                this.render(
                    (iTarget.tagName == 'SELECT')  ?  'rows'  :  'page',  iValue
                );

                $( iEvent.target ).view().clear();

                iWebApp.load( iEvent.target );
            }
        });
    });
});