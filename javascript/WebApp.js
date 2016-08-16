define(['jquery', 'UI_Module', 'InnerLink'],  function ($, UI_Module, InnerLink) {

    var BOM = self,  DOM = self.document;

    function WebApp(Page_Box, API_Path, Cache_Minute) {
        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Path);

        var iApp = $('*:data("_EWA_")').data('_EWA_') || this;

        if (iApp !== this)  return iApp;

        $.Observer.call(this, 1);

        this.$_Root = $(Page_Box).data('_EWA_', this);

        this.apiPath = API_Path;
        this.cacheMinute = Cache_Minute || 3;

        this.length = 0;
        this.lastPage = -1;

        $(BOM).on('popstate',  function () {

            var Index = (arguments[0].originalEvent.state || '').index;

            if ((typeof Index != 'number')  ||  (iApp.lastPage == Index))
                return;

            iApp[iApp.lastPage].detach();
            iApp[iApp.lastPage = Index].attach();

        }).on('blur',  function () {

            iApp.showLocation();

        }).on('focus',  function () {

            this.history.replaceState(
                {index:  iApp.lastPage},
                iApp[iApp.lastPage].source.title || DOM.title,
                this.location.href.split(/\?|#/)[0]
            );

            this.location.hash = '';
        });

        this.init();
    }

    function First_Page() {
        var iHash = BOM.location.hash.match(/^#!([^#!]+)/);
        iHash = iHash && iHash[1];

        if (! iHash)
            return  $('body *[autofocus]:not(:input)').eq(0).click();

        if (!  $('*[href="' + iHash + '"]').eq(0).click()[0])
            this.ownerApp.load(iHash);
    }

    WebApp.fn = WebApp.prototype = $.extend(new $.Observer(),  {
        constructor:     WebApp,
        push:            Array.prototype.push,
        splice:          Array.prototype.splice,
        load:            function (HTML_URL) {
            $('<span />', {
                style:     'display: none',
                target:    '_self',
                href:      HTML_URL
            }).appendTo('body').click();

            return this;
        },
        init:            function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source;

            $.extend(iModule.data, $.paramJSON());

            if (iLink.href || iLink.src || iLink.action)
                iModule.load(First_Page);
            else
                First_Page.call( iModule.render() );
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

            (iLink.src || iLink.action).replace(/\{(.+?)\}/g,  function () {
                iArgs[ arguments[1] ] = iPage.data[ arguments[1] ];
            });

            if (! $.isEmptyObject(iArgs))
                BOM.history.replaceState(
                    {index: this.lastPage},
                    iLink.title || DOM.title,
                    $.extendURL(DOM.URL, iArgs)
                );
            BOM.location.hash = '!' + iLink.href;

            return BOM.location.href;
        },
        getModule:       function () {
            return  UI_Module.instanceOf( arguments[0] );
        }
    });

    return  $.fn.iWebApp = WebApp;

});
