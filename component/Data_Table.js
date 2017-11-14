require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    var iWebApp = new EWA();


    EWA.component(function (_data_) {

        this.$_View.children().on('input', false);

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('tbody')[0]
            };

        var VM = this.on('update',  function () {

                iWebApp.load( iEvent.target );
            });

        iWebApp.off( iEvent ).on(iEvent,  function (_, data) {

            var total = _data_.total || data.total;

            VM.render({
                total:      total,
                pageSum:    Math.ceil(total / VM.rows)
            });

            return data.list;
        });

        $.extend(_data_, {
            pageChange:    function (event) {

                var target = event.target,
                    value = parseInt(target.value || target.textContent);

                if (
                    $( target ).is(':field, ul *')  &&
                    value  &&
                    ((target.name !== 'page')  ||  (value <= this.pageSum))
                ) {
                    this[target.name || 'page'] = value;

                    iWebApp.load( iEvent.target );

                    event.stopPropagation();    event.preventDefault();
                }
            }
        });
    });
});
