require(['jquery', 'EasyWebApp'],  function ($) {

    var iWebApp = $().iWebApp();

    iWebApp.component(function () {

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('[data-href]')[0]
            },
            VM = this;

        var iList = $( iEvent.target ).view('ListView');

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            VM.render('pageSum',  Math.ceil(iData.total / VM.rows));

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