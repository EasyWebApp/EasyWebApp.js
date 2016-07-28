define(['jquery', 'jQuery+', 'iQuery+'],  function ($) {

    var _Link_ = '*[target]:not(a)';

    function UI_Module(iDOM, iLink) {
        this.$_DOM = $(iDOM);

        iLink = iLink || iDOM;
        this.$_Link = $(iLink);

        this.href = iLink.getAttribute('href');
        this.method = iLink.getAttribute('method') || 'get';
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');
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
        },
        load:      function () {
            var iThis = this,  iJSON = this.src || this.action;

            var iReady = (this.href && iJSON)  ?  2  :  1,  iData;

            if (this.href)
                this.$_DOM.load(this.href,  function () {
                    if (--iReady)  return;

                    if (iData)  iThis.render(iData);

                    iThis.$_DOM.trigger('ready');
                });

            if (! iJSON)  return;

            $[this.method](iJSON,  this.$_Link.serialize(),  function (_JSON_) {
                var _Data_ = $.extend(
                        (_JSON_ instanceof Array)  ?  [ ]  :  { },  _JSON_
                    );

                iData = iThis.$_DOM.triggerHandler('data', [_JSON_, this])  ||  _Data_;

                if (--iReady)  return;

                iThis.render(iData);

                iThis.$_DOM.trigger('ready');
            },  'jsonp');
        }
    });

    $(document).on('click change submit',  _Link_,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')
                return;
            else
                iEvent.preventDefault();
        }

        (new UI_Module(
            $('*[name="' + this.getAttribute('target') + '"]'),  this
        )).load();

    }).ready(function () {

        var $_Module = $('*[href]:not(a), *[src]:not(img, iframe)', this.body)
                .not(_Link_);

        for (var i = 0;  $_Module[i];  i++)
            (new UI_Module( $_Module[i] )).load();
    });

});
