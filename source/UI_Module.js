define([
    'jquery', 'DS_Inherit', 'HTML_Template', 'ViewDataIO'
],  function ($, DS_Inherit, HTML_Template) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        this.data = DS_Inherit(this.getScope(), this.getEnv());

        this.$_View = iLink.getTarget();
        this.$_View = this.$_View[0] ? this.$_View : iLink.$_DOM;
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
            var iLV = $.ListView.instanceOf( this.source.$_DOM ),  iData;

            if (iLV  &&  (iLV.$_View[0] !== this.source.$_DOM[0])) {

                var $_Item = this.source.$_DOM.parentsUntil( iLV.$_View );

                iData = ($_Item[0] ? $_Item.slice(-1) : this.source.$_DOM)
                    .data('EWA_DS');
            }
            iData = iData  ||  (this.source.ownerView || '').data;

            return  $.likeArray(iData) ? { } : iData;
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
            return  this.source.loadData( this.data );
        },
        loadHTML:      function () {
            this.template = new HTML_Template( this.source.href );

            var _This_ = this;

            return  this.template.loadTo( this.$_View ).then(function () {
                var iLink = _This_.prefetch().source;

                var $_Target = iLink.getTarget();

                var $_Link = $_Target.children('link[target="_blank"]')
                        .attr('href', iLink.href);

                var _Link_ = $_Link[0] && (
                        new iLink.constructor(iLink.ownerApp, $_Link[0])
                    ).register(iLink.ownerApp.length - 1);

                if (
                    ((! iLink.href)  ||  iLink.src  ||  iLink.action)  ||
                    ($_Target[0] != _This_.ownerApp.$_Root[0])  ||
                    (! _Link_)
                )
                    return;

                iLink.method = _Link_.method || iLink.method;
                iLink.src = _Link_.src;
                iLink.data = _Link_.data;

                _This_.data.extend( _This_.getEnv() );

                return _This_.loadJSON();
            });
        },
        render:        function (iData) {
            this.data.extend(this.trigger('data', [iData])  ||  iData);

            if (! this.data.isNoValue()) {
                this.$_View.dataRender( this.data );

                if (this.template instanceof HTML_Template)
                    this.template.render( this.data );
            }

            var _This_ = this;

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
            var _This_ = this,
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            this.lastLoad = 0;

            return  this.domReady = Promise.all([
                iJSON  &&  this.loadJSON(),
                this.source.href  &&  this.loadHTML()
            ]).then(function (_Data_) {
                _Data_ = _Data_[0] || _Data_[1];

                return  _This_.$_View.children('script')[0] ?
                    _Data_ : _This_.render(_Data_);
            });
        }
    });

    return UI_Module;

});
