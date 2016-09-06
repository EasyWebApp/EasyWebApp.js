define(['jquery', 'DS_Inherit', 'ViewDataIO'],  function ($, DS_Inherit) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        var iScope = iLink.ownerView && iLink.ownerView.getData();
        iScope = $.likeArray(iScope)  ?  { }  :  iScope;

        this.data = DS_Inherit(iScope || { },  this.getEnv());

        this.$_View = iLink.getTarget();
        this.$_View = this.$_View[0] ? this.$_View : iLink.$_DOM;
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
            this.$_View.data(this.constructor.getClass(), this);

            if (this.$_Content) {
                this.$_View.append( this.$_Content );
                this.ownerApp.trigger('attach');
            } else if (this.lastLoad)
                this.load();

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
            return this.source.loadData(
                UI_Module.prototype.getData.call(this) ||
                    UI_Module.instanceOf('body').data
            );
        },
        loadHTML:      function () {
            var iTemplate = this.constructor.$_Template,
                iHTML = this.source.href.split('?')[0],
                _This_ = this;

            return  new Promise(function (iResolved) {
                if (iTemplate[iHTML])
                    return iResolved(
                        iTemplate[iHTML].clone(true).appendTo(_This_.$_View)
                    );

                _This_.$_View.load(iHTML,  function () {
                    iResolved(
                        iTemplate[iHTML] = $(this.children).not('script').clone(true)
                    );
                });
            }).then(function () {
                _This_.ownerApp.trigger('attach');

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

                $.extend(_This_.data, _This_.getEnv());

                return _This_.loadJSON();
            });
        },
        setData:       function (iData) {
            if (! $.isEmptyObject(iData)) {
                $.extend(this.data, iData);

                if ($.likeArray( iData )) {
                    this.data.length = iData.length;

                    Array.prototype.splice.call(
                        this.data,  iData.length,  iData.length
                    );
                }
            }
            return this.data;
        },
        render:        function (iData) {
            iData = this.setData(iData);

            if (! $.isEmptyObject(iData))  this.$_View.dataRender(iData);

            this.lastLoad = $.now();

            this.trigger('ready');

            return this.loadModule();
        },
        trigger:       function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        load:          function () {
            var _This_ = this,
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            return Promise.all([
                iJSON  &&  this.loadJSON(),
                this.source.href  &&  this.loadHTML()
            ]).then(function (_Data_) {

                _Data_ = _Data_[0] || _Data_[1];

                if ((_Data_ !== undefined)  &&  (_Data_ != null))
                    _This_.setData(_This_.trigger('data', [_Data_])  ||  _Data_);

                return _This_.loadModule();

            }).then(function () {

                _This_.render();
            });
        }
    });

    return UI_Module;

});
