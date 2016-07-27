define(['jquery', 'jQuery+', 'iQuery+'],  function ($) {

    var _Link_ = '*[target]:not(a, form)';

    function Load_Module() {
        var iHTML = this.getAttribute('href'),  iJSON = this.getAttribute('src'),
            $_Module = $( arguments[1] );

        var iReady = (iHTML && iJSON)  ?  2  :  1,  iData;

        if (iHTML)
            $_Module.load(iHTML,  function () {
                if (--iReady)  return;

                $_Module.trigger('ready');
            });

        if (iJSON)
            $[this.getAttribute('method') || 'get'](iJSON,  function () {
                var _Data_ = $.extend(
                        (arguments[0] instanceof Array)  ?  [ ]  :  { },
                        arguments[0]
                    );

                iData = $_Module.triggerHandler('data', arguments)  ||  _Data_;

                if (--iReady)  return;

                var iView;

                if (iData instanceof Array) {
                    iView = $.ListView.getInstance( $_Module );
                    if (! iView) {
                        iView = $.ListView.findView( $_Module )[0];
                        if (iView)
                            iView = $.ListView(iView,  function () {
                                arguments[0].value('name', arguments[1]);
                            });
                    }
                } else
                    iView = $.CommonView.getInstance($_Module);

                if (iView)  iView.clear().render(iData);

                $_Module.trigger('ready');
            }, 'jsonp');
    }

    $(document).on('click change',  _Link_,  function () {

        Load_Module.call(
            this,  0,  $('*[name="' + this.getAttribute('target') + '"]')
        );
    }).ready(function () {

        $('*[href]:not(a), *[src]:not(img, iframe)').not(_Link_).each(Load_Module);
    });

});