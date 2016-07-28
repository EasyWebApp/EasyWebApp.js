define(['jquery', 'jQuery+', 'iQuery+'],  function ($) {

    var _Link_ = '*[target]:not(a)';

    function Load_Module() {
        var iHTML = this.getAttribute('href'),  iJSON = this.getAttribute('src'),
            $_Module = $( arguments[1] );

        var iReady = (iHTML && iJSON)  ?  2  :  1,  iData;

        function Render_Data() {
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
                iView = $.CommonView($_Module).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)  iView.render(iData);
        }

        if (iHTML)
            $_Module.load(iHTML,  function () {
                if (--iReady)  return;

                if (iData)  Render_Data();

                $_Module.trigger('ready');
            });

        if (! iJSON)  return;

        $[this.getAttribute('method') || 'get'](iJSON,  function (_JSON_) {
            var _Data_ = $.extend(
                    (_JSON_ instanceof Array)  ?  [ ]  :  { },  _JSON_
                );

            iData = $_Module.triggerHandler('data', [_JSON_, this])  ||  _Data_;

            if (--iReady)  return;

            Render_Data();

            $_Module.trigger('ready');
        }, 'jsonp');
    }

    $(document).on('click change',  _Link_,  function () {

        if (this.tagName == 'FORM')  return;

        Load_Module.call(
            this,  0,  $('*[name="' + this.getAttribute('target') + '"]')
        );
    }).ready(function () {

        $('*[href]:not(a), *[src]:not(img, iframe)', this.body).not(_Link_)
            .each(Load_Module);
    });

});