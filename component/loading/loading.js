require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    EWA.component(function () {

        var VM = this;

        var Load_Cover = this.$_View.children('div').on(
                'transitionend webkitTransitionEnd',  function () {

                    if (! VM.count)  this.style.display = 'none';
                }
            )[0];

        $( document ).on('ajaxSend',  function () {

            if (! VM.count)  Load_Cover.style.display = '';

            VM.count++ ;

        }).on('ajaxSuccess',  function () {

            VM.count-- ;
        });

        return  {count: 0};
    });
});
