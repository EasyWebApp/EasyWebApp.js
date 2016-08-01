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

    return  function () {
        DataScope.prototype = arguments[0];

        var iData = new DataScope( arguments[1] );

        DataScope.prototype = null;

        return iData;
    };

})(self, self.document, self.jQuery);



var UI_Module = (function (BOM, DOM, $, DS_Inherit) {

    function UI_Module(iApp, iScope, iLink) {
        this.ownerApp = iApp;

        this.data = DS_Inherit(iScope,  { });

        var $_View = iLink.getAttribute('target') || iLink;

        if ($_View == '_self')
            $_View = this.ownerApp.$_Root;
        else if (typeof $_View == 'string')
            $_View = '*[name="' + $_View + '"]';

        this.$_View = $($_View).data(this.constructor.getClass(), this);

        iLink = iLink || this.$_View[0];
        this.$_Link = $(iLink);

        this.title = iLink.title;
        this.href = iLink.getAttribute('href');
        this.method = iLink.getAttribute('method') || 'get';
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');

        iApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        $_Link:        '*[target]:not(a)',
        $_Template:    { }
    });

    $.extend(UI_Module.prototype, {
        toString:    $.CommonView.prototype.toString,
        getData:     function () {
            var iLV = $.ListView.instanceOf( this.$_Link );

            if (! iLV)  return this.data;

            var $_Item = this.$_Link.parentsUntil( iLV.$_View );

            return  ($_Item[0] ? $_Item.slice(-1) : this.$_Link)
                .data('EWA_DS');
        },
        getURL:      function (iName) {
            var iArgs = this.$_Link[0].dataset,  _Args_ = { },
                iData = this.getData(),  _Data_;

            for (var iKey in iArgs) {
                _Data_ = iData[ iArgs[iKey] ];

                if ($.isData(_Data_))  _Args_[iKey] = _Data_;
            }

            return $.extendURL(
                this[iName].replace(/\{(.+?)\}/,  function () {
                    return  iData[arguments[1]] || '';
                }),
                _Args_
            );
        },
        valueOf:     function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        boot:        function () {
            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(UI_Module.$_Link + ', *[href]:parent');

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this.ownerApp, this.data, $_Module[i])).load();

            return this;
        },
        render:      function (iData) {
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

            this.boot();

            return this;
        },
        trigger:     function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.href || '',
                this.src || '',
                [ this.valueOf() ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        loadHTML:    function (HTML_Ready) {
            var iTemplate = this.constructor.$_Template,
                iHTML = this.href.split('?')[0];

            if (iTemplate[iHTML]) {
                this.$_View.append( iTemplate[iHTML].clone(true) );

                return  HTML_Ready.call( this.$_View[0] );
            }

            this.$_View.load(this.getURL('href'),  function () {
                iTemplate[iHTML] = $(this.children).not('script').clone(true);

                HTML_Ready.apply(this, arguments);
            });
        },
        load:        function () {
            var iThis = this,  iJSON = this.getURL('src') || this.getURL('action');

            var iReady = (this.href && iJSON)  ?  2  :  1;

            if (this.href)
                this.loadHTML(function () {
                    if (--iReady)  return;

                    if (! $.isEmptyObject(iThis.data))  iThis.render();

                    iThis.trigger('ready');
                });

            if (! iJSON)  return;

            $[this.method](
                this.ownerApp.apiPath + iJSON,
                this.$_Link.serialize(),
                function (_JSON_) {
                    _JSON_ = iThis.trigger('data', [_JSON_])  ||  _JSON_;

                    $.extend(iThis.data, _JSON_);

                    if (_JSON_ instanceof Array)
                        iThis.data.length = _JSON_.length;

                    if (--iReady)  return;

                    iThis.render();

                    iThis.trigger('ready');
                },
                'jsonp'
            );

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



var WebApp = (function (BOM, DOM, $, UI_Module) {

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

        UI_Module.prototype.boot.call({
            ownerApp:    this,
            data:        { },
            $_View:      $(DOM.body)
        });
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
                {index: this.length},  iPage.title || DOM.title,  DOM.URL
            );
            this.push( iPage );

            return this;
        }
    });

    return WebApp;

})(self, self.document, self.jQuery, UI_Module);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-07-31)  Alpha
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



var EasyWebApp = (function (BOM, DOM, $, WebApp, UI_Module) {

    $.fn.iWebApp = function () {
        return  this[0]  &&  (new WebApp(this[0], arguments[0]));
    };

    $(document).on('click change submit',  UI_Module.$_Link,  function (iEvent) {

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

        (new UI_Module(new WebApp(),  { },  this)).load();

        iEvent.stopPropagation();
    });

})(self, self.document, self.jQuery, WebApp, UI_Module);


});
