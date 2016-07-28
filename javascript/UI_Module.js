define(['jquery', 'iQuery+'],  function ($) {

    function UI_Module(iApp, iRoot, iLink) {
        this.ownerApp = iApp;

        this.$_Root = $(iRoot);

        iLink = iLink || this.$_Root[0];
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
                iView = $.ListView.getInstance( this.$_Root );
                if (! iView) {
                    iView = $.ListView.findView( this.$_Root )[0];
                    if (iView)
                        iView = $.ListView(iView,  function () {
                            arguments[0].value('name', arguments[1]);
                        });
                }
            } else
                iView = $.CommonView(this.$_Root).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)  iView.render(iData);
        },
        load:      function () {
            var iThis = this,  iJSON = this.src || this.action;

            var iReady = (this.href && iJSON)  ?  2  :  1,  iData;

            if (this.href)
                this.$_Root.load(this.href,  function () {
                    if (--iReady)  return;

                    if (iData)  iThis.render(iData);

                    iThis.$_Root.trigger('ready');
                });

            if (! iJSON)  return;

            $[this.method](
                this.ownerApp.apiPath + iJSON,
                this.$_Link.serialize(),
                function (_JSON_) {
                    var _Data_ = $.extend(
                            (_JSON_ instanceof Array)  ?  [ ]  :  { },  _JSON_
                        );

                    iData = iThis.$_Root.triggerHandler('data', [_JSON_, this])  ||  _Data_;

                    if (--iReady)  return;

                    iThis.render(iData);

                    iThis.$_Root.trigger('ready');
                },
                'jsonp'
            );
        }
    });

    return UI_Module;

});
