define(['jquery', 'DS_Inherit', 'ViewDataIO'],  function ($, DS_Inherit) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        var iScope = iLink.ownerView && iLink.ownerView.getData();
        iScope = $.likeArray(iScope)  ?  { }  :  iScope;

        this.data = DS_Inherit(iScope || { },  this.getEnv());

        var $_View = iLink.target || iLink.$_DOM;

        if ($_View == '_self')
            $_View = this.ownerApp.$_Root;
        else if (typeof $_View == 'string')
            $_View = '*[name="' + $_View + '"]';

        this.$_View = $($_View);
        this.attach();

        this.lastLoad = 0;

        this.ownerApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf,
        $_Template:    { }
    });

    $.extend(UI_Module.prototype, {
        toString:      $.CommonView.prototype.toString,
        detach:        function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        attach:        function () {
            this.$_View.append( this.$_Content )
                .data(this.constructor.getClass(), this);

            return this;
        },
        getData:       function () {
            var iLV = $.ListView.instanceOf( this.source.$_DOM );

            if ((! iLV)  ||  (iLV.$_View[0] === this.source.$_DOM[0]))
                return this.data;

            var $_Item = this.source.$_DOM.parentsUntil( iLV.$_View );

            return  ($_Item[0] ? $_Item.slice(-1) : this.source.$_DOM)
                .data('EWA_DS');
        },
        getEnv:        function () {
            var iData = $.paramJSON( this.source.href ),
                iHTML = this.source.getURL('href'),
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            if (iHTML) {
                var iFileName = $.fileName(iHTML).split('.');

                $.extend(iData, {
                    _File_Path_:    $.filePath(iHTML),
                    _File_Name_:    iFileName[0],
                    _File_Ext_:     iFileName[1]
                });
            }

            if (iJSON)
                $.extend(iData, {
                    _Data_Path_:    $.filePath(iJSON),
                    _Data_Name_:    $.fileName(iJSON)
                });

            return iData;
        },
        loadModule:    function (SyncBack) {
            var InnerLink = this.source.constructor;

            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(InnerLink.selector + ', *[href]:parent'),
                iReady;

            if (typeof SyncBack == 'function') {
                $_Module = $_Module.filter(function () {
                    return  (this.getAttribute('async') == 'false');
                });
                iReady = $_Module.length;
            }

            function Module_Ready() {
                if (! --iReady)  SyncBack.call(this);
            }

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(
                    new InnerLink(this.ownerApp, $_Module[i])
                )).load(SyncBack && Module_Ready);

            if ((! i)  &&  SyncBack)  SyncBack.call(this);
        },
        loadHTML:      function (HTML_Ready) {
            var iTemplate = this.constructor.$_Template,
                iHTML = this.source.href.split('?')[0];

            HTML_Ready = $.proxy(this.loadModule, this, HTML_Ready);

            if (iTemplate[iHTML]) {
                this.$_View.append( iTemplate[iHTML].clone(true) );

                return HTML_Ready();
            }

            this.$_View.load(this.source.getURL('href'),  function () {
                iTemplate[iHTML] = $(this.children).not('script').clone(true);

                HTML_Ready();
            });
        },
        render:        function (iData) {
            iData = iData || this.data;

            if (! $.isEmptyObject(iData))  this.$_View.dataRender(iData);

            this.loadModule();

            return this;
        },
        trigger:       function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        load:          function (iCallback) {
            var iThis = this,  iJSON = this.source.src || this.source.action;

            var iReady = (this.source.href && iJSON)  ?  2  :  1;

            function Load_Back() {
                if (--iReady)  return;

                if (! $.isEmptyObject(iThis.data))  iThis.render();

                iThis.lastLoad = $.now();

                if (typeof iCallback == 'function')
                    iCallback.call(iThis);

                this.trigger('ready');
            }

            if (this.source.href)  this.loadHTML(Load_Back);

            if (iJSON)
                this.source.loadData(this.getData(),  function (_JSON_) {
                    _JSON_ = iThis.trigger('data', [_JSON_])  ||  _JSON_;

                    $.extend(iThis.data, _JSON_);

                    if (_JSON_ instanceof Array)
                        iThis.data.length = _JSON_.length;

                    Load_Back.call(iThis);
                });

            return this;
        }
    });

    return UI_Module;

});
