define(['jquery', 'iQuery+'],  function ($) {

    function UI_Module(iApp, iLink) {
        this.ownerApp = iApp;

        this.$_Root = iLink.getAttribute('target') || iLink;

        if (this.$_Root == '_self')
            this.$_Root = this.ownerApp.$_Root;
        else if (typeof this.$_Root == 'string')
            this.$_Root = '*[name="' + this.$_Root + '"]';

        this.$_Root = $(this.$_Root);

        iLink = iLink || this.$_Root[0];
        this.$_Link = $(iLink);

        this.title = iLink.title;
        this.href = iLink.getAttribute('href');
        this.method = iLink.getAttribute('method') || 'get';
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');

        iApp.register(this);
    }

    UI_Module.$_Link = '*[target]:not(a)';

    $.extend(UI_Module.prototype, {
        valueOf:    function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        boot:       function () {
            var $_Module = this.$_Root
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(UI_Module.$_Link + ', *[href]:parent');

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this.ownerApp, $_Module[i])).load();

            return this;
        },
        render:     function (iData) {
            iData = iData || this.data;

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

            this.boot();

            return this;
        },
        trigger:    function () {
            return this.ownerApp.trigger(
                arguments[0],  this.href || '',  this.src || '',  [this.valueOf()]
            ).slice(-1)[0];
        },
        load:       function () {
            var iThis = this,  iJSON = this.src || this.action;

            var iReady = (this.href && iJSON)  ?  2  :  1;

            if (this.href)
                this.$_Root.load(this.href,  function () {
                    if (--iReady)  return;

                    if (iThis.data)  iThis.render();

                    iThis.trigger('ready');
                });

            if (! iJSON)  return;

            $[this.method](
                this.ownerApp.apiPath + iJSON,
                this.$_Link.serialize(),
                function (_JSON_) {
                    iThis.data = $.extend(
                        (_JSON_ instanceof Array)  ?  [ ]  :  { },  _JSON_
                    );

                    iThis.data = iThis.trigger('data') || iThis.data;

                    if (--iReady)  return;

                    iThis.render();

                    iThis.trigger('ready');
                },
                'jsonp'
            );

            return this;
        },
        detach:    function () {
            this.$_Content = this.$_Root.children().detach();

            return this;
        },
        attach:    function () {
            this.$_Root.append( this.$_Content );

            return this;
        }
    });

    return UI_Module;

});
