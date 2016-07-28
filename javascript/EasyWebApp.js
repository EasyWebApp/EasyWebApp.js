define(['jquery', 'jQuery+', 'iQuery+'],  function ($) {

    var _Link_ = '*[target]:not(a)';

    function UI_Module() {
        this.$_DOM = $( arguments[0] );
    }

    $.extend(UI_Module.prototype, {
        render:    function (iData) {
            var iView;

            if (iData instanceof Array) {
                iView = $.ListView.getInstance( this.$_DOM );
                if (! iView) {
                    iView = $.ListView.findView( this.$_DOM )[0];
                    if (iView)
                        iView = $.ListView(iView,  function () {
                            arguments[0].value('name', arguments[1]);
                        });
                }
            } else
                iView = $.CommonView(this.$_DOM).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)  iView.render(iData);
        }
    });

    function Load_Module() {
        var iHTML = this.getAttribute('href'),
            iJSON = this.getAttribute('src') || this.getAttribute('action'),
            iModule = new UI_Module( arguments[1] );

        var $_Module = iModule.$_DOM,
            iReady = (iHTML && iJSON)  ?  2  :  1,
            iData;

        if (iHTML)
            $_Module.load(iHTML,  function () {
                if (--iReady)  return;

                if (iData)  iModule.render(iData);

                $_Module.trigger('ready');
            });

        if (! iJSON)  return;

        $[this.getAttribute('method') || 'get'](
            iJSON,
            $(this).serialize(),
            function (_JSON_) {
                var _Data_ = $.extend(
                        (_JSON_ instanceof Array)  ?  [ ]  :  { },  _JSON_
                    );

                iData = $_Module.triggerHandler('data', [_JSON_, this])  ||  _Data_;

                if (--iReady)  return;

                iModule.render(iData);

                $_Module.trigger('ready');
            },
            'jsonp'
        );
    }

    $(document).on('click change submit',  _Link_,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')
                return;
            else
                iEvent.preventDefault();
        }

        Load_Module.call(
            this,  0,  $('*[name="' + this.getAttribute('target') + '"]')
        );
    }).ready(function () {

        $('*[href]:not(a), *[src]:not(img, iframe)', this.body).not(_Link_)
            .each(Load_Module);
    });

});