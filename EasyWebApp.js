(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+'], arguments[0]);

})(function () {


var DS_Inherit = (function (BOM, DOM, $) {

    function DataScope(iData) {
        if (! $.isEmptyObject(iData))  $.extend(this, iData);
    }

    var iPrototype = {
            constructor:    DataScope,
            toString:       function () {
                return  '[object DataScope]';
            },
            valueOf:        function () {
                if (this.hasOwnProperty('length'))  return $.makeArray(this);

                var iValue = { };

                for (var iKey in this)
                    if (! iKey.match(/^(\d+|length)$/))
                        iValue[iKey] = this[iKey];

                return iValue;
            }
        };

    return  function (iSup, iSub) {
        DataScope.prototype = $.isEmptyObject(iSup) ? iPrototype : iSup;

        var iData = new DataScope(iSub);

        DataScope.prototype = null;

        return iData;
    };

})(self, self.document, self.jQuery);



var UI_Module = (function (BOM, DOM, $, DS_Inherit) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        var iScope = iLink.ownerView && iLink.ownerView.getData();
        iScope = $.likeArray(iScope)  ?  { }  :  iScope;

        this.data = DS_Inherit(iScope || { },  { });

        var $_View = iLink.target || iLink.$_DOM;

        if ($_View == '_self')
            $_View = this.ownerApp.$_Root;
        else if (typeof $_View == 'string')
            $_View = '*[name="' + $_View + '"]';

        this.$_View = $($_View).data(this.constructor.getClass(), this);

        this.lastLoad = 0;

        this.ownerApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf,
        $_Template:    { }
    });

    $.extend(UI_Module.prototype, {
        toString:    $.CommonView.prototype.toString,
        getData:     function () {
            var iLV = $.ListView.instanceOf( this.source.$_DOM );

            if (! iLV)  return this.data;

            var $_Item = this.source.$_DOM.parentsUntil( iLV.$_View );

            return  ($_Item[0] ? $_Item.slice(-1) : this.source.$_DOM)
                .data('EWA_DS');
        },
        findView:    function () {
            var InnerLink = this.source.constructor;

            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(InnerLink.selector + ', *[href]:parent');

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(
                    new InnerLink(this.ownerApp, $_Module[i])
                )).load();
        },
        render:      function (iData) {
            this.lastLoad = $.now();

            iData = iData || this.data;

            var iView;

            if ($.likeArray( iData )) {
                iView = $.ListView.getInstance( this.$_View );
                if (! iView) {
                    iView = $.ListView.findView( this.$_View )[0];
                    iView = iView  &&  $.ListView( iView );
                }
            } else
                iView = $.CommonView(this.$_View).on('render',  function () {
                    this.$_View.find('*').value('name', arguments[0]);
                });

            if (iView)
                iView.on('insert',  function ($_Item, iValue) {
                    $_Item.data('EWA_DS',  DS_Inherit(iData, iValue))
                        .value('name', iValue);
                }).render(iData);

            this.findView();

            return this;
        },
        trigger:     function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        loadHTML:    function (HTML_Ready) {
            var iTemplate = this.constructor.$_Template,
                iHTML = this.source.href.split('?')[0];

            if (iTemplate[iHTML]) {
                this.$_View.append( iTemplate[iHTML].clone(true) );

                return  HTML_Ready.call( this.$_View[0] );
            }

            this.$_View.load(this.source.getURL('href'),  function () {
                iTemplate[iHTML] = $(this.children).not('script').clone(true);

                HTML_Ready.apply(this, arguments);
            });
        },
        load:        function () {
            var iThis = this,  iJSON = this.source.src || this.source.action;

            var iReady = (this.source.href && iJSON)  ?  2  :  1;

            if (this.source.href)
                this.loadHTML(function () {
                    if (--iReady)  return;

                    if (! $.isEmptyObject(iThis.data))  iThis.render();

                    iThis.trigger('ready');
                });

            if (iJSON)
                this.source.loadData(this.getData(),  function (_JSON_) {
                    _JSON_ = iThis.trigger('data', [_JSON_])  ||  _JSON_;

                    $.extend(iThis.data, _JSON_);

                    if (_JSON_ instanceof Array)
                        iThis.data.length = _JSON_.length;

                    if (--iReady)  return;

                    iThis.render();

                    iThis.trigger('ready');
                });

            return this;
        },
        detach:      function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        attach:      function () {
            this.$_View.append( this.$_Content );

            return this;
        }
    });

    return UI_Module;

})(self, self.document, self.jQuery, DS_Inherit);



var InnerLink = (function (BOM, DOM, $, UI_Module) {

    function InnerLink(iApp, iLink) {
        this.ownerApp = iApp;
        this.ownerView = UI_Module.instanceOf(iLink);

        this.$_DOM = $(iLink);

        this.title = iLink.title;
        this.target = iLink.getAttribute('target');
        this.href = iLink.getAttribute('href');
        this.method = (iLink.getAttribute('method') || 'GET').toLowerCase();
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');
    }

    InnerLink.selector = '*[target]:not(a)';

    $.extend(InnerLink.prototype, {
        valueOf:     function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        getURL:      function (iName, iScope) {
            if ((! this[iName])  ||  $.isEmptyObject(iScope))
                return this[iName];

            var iArgs = this.$_DOM[0].dataset,  _Args_ = { },  _Data_;

            for (var iKey in iArgs) {
                _Data_ = iScope[ iArgs[iKey] ];

                if ($.isData(_Data_))  _Args_[iKey] = _Data_;
            }

            return $.extendURL(
                this[iName].replace(/\{(.+?)\}/,  function () {
                    return  iScope[arguments[1]] || '';
                }),
                _Args_
            );
        },
        loadData:    function (iScope, Data_Ready) {
            $[this.method](
                this.ownerApp.apiPath + (
                    this.getURL('src', iScope)  ||  this.getURL('action', iScope)
                ),
                this.$_DOM.serialize(),
                Data_Ready,
                'jsonp'
            );
        }
    });

    return InnerLink;

})(self, self.document, self.jQuery, UI_Module);



var WebApp = (function (BOM, DOM, $, UI_Module, InnerLink) {

    function WebApp() {
        var iApp = $('*:data("_EWA_")').data('_EWA_') || this;

        if (iApp !== this)  return iApp;

        $.Observer.call(this, 1);

        this.$_Root = $( arguments[0] ).data('_EWA_', this);

        this.apiPath = arguments[1];

        this.length = 0;
        this.lastPage = -1;

        $(BOM).on('popstate',  function () {
            var Index = (arguments[0].originalEvent.state || '').index;

            if (typeof Index != 'number')  return;

            iApp[iApp.lastPage].detach();
            iApp[iApp.lastPage = Index].attach();
        });

        (new UI_Module(new InnerLink(this, DOM.body)))
            .load().render( $.paramJSON() );
    }

    WebApp.prototype = $.extend(new $.Observer(),  {
        constructor:    WebApp,
        push:           Array.prototype.push,
        splice:         Array.prototype.splice,
        register:       function (iPage) {
            if (this.$_Root[0] !== iPage.$_View[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            BOM.history.pushState(
                {index: this.length},  iPage.source.title || DOM.title,  DOM.URL
            );
            this.push( iPage );

            return this;
        }
    });

    return WebApp;

})(self, self.document, self.jQuery, UI_Module, InnerLink);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-08-04)  Alpha
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+,
//
//                   [ marked.js ]  (for MarkDown rendering)
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2016    shiy2008@gmail.com
//



var EasyWebApp = (function (BOM, DOM, $, WebApp, InnerLink, UI_Module) {

    $.fn.iWebApp = function () {
        return  this[0]  &&  (new WebApp(this[0], arguments[0]));
    };

    $(document).on('click change submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')
                return;
            else
                iEvent.preventDefault();
        } else if (
            (this !== iEvent.target)  &&
            $(iEvent.target).parentsUntil(this).addBack().filter('a')[0]
        )
            return;

        iEvent.stopPropagation();

        var iWebApp = new WebApp();

        var iLink = new InnerLink(iWebApp, this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                iLink.loadData(
                    UI_Module.prototype.getData.call({source: iLink}),
                    function () {
                        iWebApp.trigger('data',  '',  iLink.src || iLink.action,  [
                            iLink.valueOf(),  arguments[0]
                        ]);
                    }
                );
                break;
            case '_self':     ;
            default:          (new UI_Module(iLink)).load();
        }
    });
})(self, self.document, self.jQuery, WebApp, InnerLink, UI_Module);


});
