define(['jquery', 'UI_Module', 'InnerLink'],  function ($, UI_Module, InnerLink) {

    var BOM = self,  DOM = self.document;

    var $_BOM = $(BOM);

    function WebApp(Page_Box, API_Path, Cache_Minute, showLocation) {
        var _Self_ = arguments.callee;

        if (this instanceof $)
            return  new _Self_(this[0], Page_Box, API_Path, Cache_Minute);

        var iApp = $('*:data("_EWA_")').data('_EWA_') || this;

        if (iApp !== this)  return iApp;

        $.Observer.call(this, 1);

        this.$_Root = $(Page_Box).data('_EWA_', this);

        var iArgs = $.makeArray(arguments).slice(1);

        this.apiPath = String( iArgs[0] ).match(/^(\w+:)?\/\//)  ?
            iArgs.shift()  :  '';
        this.cacheMinute = $.isNumeric( iArgs[0] )  ?  iArgs.shift()  :  3;
        this.needLocation = iArgs[0];

        this.length = 0;
        this.lastPage = -1;

        $_BOM.on('popstate',  function () {

            var Index = (arguments[0].originalEvent.state || '').index;

            if (typeof Index != 'number')
                return;
            else if (iApp.lastPage == Index)
                return  this.setTimeout(function () {
                    this.history.back();
                });

            iApp[iApp.lastPage].detach();
            iApp[iApp.lastPage = Index].attach();

        }).on('hashchange',  function () {

            if (iApp.hashChange === false)
                return  iApp.hashChange = null;

            var iHash = _Self_.getRoute();

            if (iHash  &&  (!  $('*[href="' + iHash + '"]').eq(0).click()[0]))
                iApp.load(iHash);
        });

        this.init();
    }

    WebApp.getRoute = function () {
        var iHash = BOM.location.hash.match(/^#!([^#!]+)/);
        return  iHash && iHash[1];
    };

    function First_Page() {
        var iHash = WebApp.getRoute();

        if (! iHash)
            $('body *[autofocus]:not(:input)').eq(0).click();
        else
            this.ownerApp.load(iHash);
    }

    WebApp.fn = WebApp.prototype = $.extend(new $.Observer(),  {
        constructor:     WebApp,
        push:            Array.prototype.push,
        splice:          Array.prototype.splice,
        load:            function (HTML_URL) {
            $('<span />',  $.extend(
                {style: 'display: none'},
                (typeof HTML_URL == 'object')  ?  HTML_URL  :  {
                    target:    '_self',
                    href:      HTML_URL
                }
            )).appendTo('body').click();

            return this;
        },
        init:            function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source,  iApp = this;

            $.extend(iModule.data, $.paramJSON());

            if (iLink.href || iLink.src || iLink.action)
                iModule.load(First_Page);
            else
                First_Page.call( iModule.render().loadModule() );

            if (! this.needLocation)  return;

            $_BOM.on('blur',  function () {

                iApp.showLocation();

            }).on('focus',  function () {

                this.history.replaceState(
                    {index:  iApp.lastPage},
                    iApp[iApp.lastPage].source.title || DOM.title,
                    this.location.href.split(/\?|#/)[0]
                );

                this.location.hash = '';
            });
        },
        register:        function (iPage) {
            if (this.$_Root[0] !== iPage.$_View[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            BOM.history.pushState(
                {index: this.length},  iPage.source.title || DOM.title,  DOM.URL
            );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  (i + 2) < this.length;  i++)
                if ((this[i].lastLoad < iTimeOut)  &&  this[i].$_Content) {
                    this[i].$_Content.remove();
                    this[i].$_Content = null;
                }
        },
        showLocation:    function () {
            var iPage = this[this.lastPage];

            var iLink = iPage.source,  iArgs = { };

            (iLink.src || iLink.action || '').replace(/\{(.+?)\}/g,  function () {
                iArgs[ arguments[1] ] = iPage.data[ arguments[1] ];
            });

            if (! $.isEmptyObject(iArgs))
                BOM.history.replaceState(
                    {index: this.lastPage},
                    iLink.title || DOM.title,
                    $.extendURL(DOM.URL, iArgs)
                );

            this.hashChange = false;
            BOM.location.hash = '!' + iLink.href;

            return BOM.location.href;
        },
        getModule:       function () {
            return  UI_Module.instanceOf( arguments[0] );
        }
    });

    return  $.fn.iWebApp = WebApp;

});
