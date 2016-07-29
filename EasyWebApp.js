(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+'], arguments[0]);

})(function () {


var UI_Module = (function (BOM, DOM, $) {

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

            return this;
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

})(self, self.document, self.jQuery);



var WebApp = (function (BOM, DOM, $, UI_Module) {

    function WebApp() {
        var iApp = $('#EWA_ViewPort').data('_EWA_');

        if (iApp instanceof arguments.callee)  return iApp;

        this.$_Root = $( arguments[0] ).data('_EWA_', this)
            .prop('id', 'EWA_ViewPort');

        this.apiPath = arguments[1];

        this.length = 0;
        this.lastPage = -1;

        this.boot();
    }

    WebApp.$_Link = '*[target]:not(a)';

    $.extend(WebApp.prototype, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        boot:        function () {
            var iApp = this;

            $(BOM).on('popstate',  function () {
                var Index = arguments[0].originalEvent.state.index;

                iApp[iApp.lastPage].detach();
                iApp[iApp.lastPage = Index].attach();
            });

            var $_Module = $('body').find('*[href]:not(a), *[src]:not(img, iframe)')
                    .not( this.constructor.$_Link );

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this, $_Module[i])).load();
        },
        register:    function (iPage) {
            if (this.$_Root[0] !== iPage.$_Root[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            BOM.history.pushState(
                {index: this.length},  iPage.title || DOM.title,  DOM.URL
            );
            this.push( iPage );
        }
    });

    return WebApp;

})(self, self.document, self.jQuery, UI_Module);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.0  (2016-07-29)  Alpha
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

    $(document).on('click change submit',  WebApp.$_Link,  function (iEvent) {

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

        (new UI_Module(new WebApp(),  this)).load();
    });

})(self, self.document, self.jQuery, WebApp, UI_Module);


});
