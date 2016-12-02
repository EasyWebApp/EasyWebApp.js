define(['jquery', 'HTML_Template'],  function ($, HTML_Template) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        this.$_View = iLink.getTarget();
        this.$_View = this.$_View[0] ? this.$_View : iLink.$_DOM;

        this.template = new HTML_Template(
            this.$_View,  this.getScope(),  iLink.getURL('href')
        );
        this.template.scope.extend( this.getEnv() );

        this.attach();

        this.lastLoad = 0;

        this.ownerApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf
    });

    $.extend(UI_Module.prototype, {
        toString:      $.CommonView.prototype.toString,
        trigger:       function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        detach:        function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        attach:        function () {
            this.$_View.data(this.constructor.getClass(), this);

            if (this.$_Content) {
                this.$_View.append( this.$_Content );
                this.trigger('ready');
            } else if (this.lastLoad)
                this.load();

            return this;
        },
        getScope:      function () {
            return  (HTML_Template.instanceOf( this.source.$_DOM ) || '').scope;
        },
        getEnv:        function () {
            var iData = { },
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

            if (iJSON) {
                iJSON = iJSON.slice( this.ownerApp.apiPath.length );

                $.extend(iData, {
                    _Data_Path_:    $.filePath(iJSON),
                    _Data_Name_:    $.fileName(iJSON)
                });
            }

            return  $.extend(iData, $.paramJSON(this.source.href));
        },
        prefetch:      function () {
            var InnerLink = this.source.constructor;

            var $_Link = this.$_View.find( InnerLink.selector ).not('link');

            for (var i = 0;  $_Link[i];  i++)
                (new InnerLink(this.ownerApp, $_Link[i])).prefetch();

            return this;
        },
        loadModule:    function () {
            var _This_ = this,  InnerLink = this.source.constructor;

            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(InnerLink.selector + ', *[href]:parent');

            return Promise.all($.map(
                $_Module[this.lastLoad ? 'not' : 'filter'](function () {

                //  About this --- https://github.com/jquery/jquery/issues/3270

                    return  (this.getAttribute('async') == 'false');
                }),
                function () {
                    return  (new UI_Module(
                        new InnerLink(_This_.ownerApp, arguments[0])
                    )).load();
                }
            ));
        },
        loadJSON:      function () {
            return  (this.source.getURL('src') || this.source.getURL('action'))  ?
                this.source.loadData( this.template.scope )  :
                Promise.resolve('');
        },
        loadHTML:      function () {
            var _This_ = this;

            return  this.template.load().then(function () {
                var iLink = _This_.source;

                var $_Link = _This_.$_View.children('link[target="_blank"]');

                if (
                    ((! iLink.href)  ||  iLink.src  ||  iLink.action)  ||
                    (_This_.$_View[0] != _This_.ownerApp.$_Root[0])  ||
                    (! $_Link[0])
                )
                    return;

                _This_.template.render();
                _This_.template.lastRender = 0;

                var iAttr = $_Link[0].attributes;

                for (var i = 0;  iAttr[i];  i++)
                    if (iAttr[i].nodeName != 'target')
                        iLink.$_DOM[0].setAttribute(
                            iAttr[i].nodeName,  iAttr[i].nodeValue
                        );

                _This_.template.scope.extend( _This_.getEnv() );

                iLink.register(iLink.ownerApp.length - 1);

                return _This_.loadJSON();
            });
        },
        render:        function (iData) {
            iData = this.trigger('data', [iData])  ||  iData;

            this.template.render( iData );

            var _This_ = this.prefetch();

            return  this.loadModule().then(function () {

                _This_.lastLoad = $.now();
                _This_.domReady = null;

                _This_.trigger('ready');

                return _This_.loadModule();

            },  function () {

                _This_.domReady = null;
            });
        },
        load:          function () {
            this.lastLoad = 0;

            var _This_ = this;

            return  this.domReady = Promise.all([
                this.loadJSON(),  this.loadHTML()
            ]).then(function (_Data_) {
                _Data_ = _Data_[0] || _Data_[1];

                return  _This_.$_View.children('script')[0] ?
                    _Data_ : _This_.render(_Data_);
            });
        }
    });

    return UI_Module;

});
