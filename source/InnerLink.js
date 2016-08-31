define(['jquery', 'UI_Module'],  function ($, UI_Module) {

    var BOM = self,  DOM = self.document;

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

        this.data = iLink.dataset;
    }

    $.extend(InnerLink, {
        selector:       [
            '*[target]:not(a)',
            'a[target="_self"]',
            'a[target="_blank"][rel="nofollow"]'
        ].join(', '),
        reURLVar:       /\{(.+?)\}/g,
        prefetchRel:    $.browser.modern ? 'prefetch' : 'next'
    });

    var $_Prefetch = $('<link rel="' + InnerLink.prefetchRel + '" />')
            .on('load error',  function () {
                $(this).remove();
            });

    $.extend(InnerLink.prototype, {
        valueOf:      function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        getTarget:    function () {
            switch (this.target) {
                case '_self':      return this.ownerApp.$_Root;
                case '_blank':     ;
                case '_parent':    ;
                case '_top':       return $();
            }

            return  this.target  ?  $('*[name="' + this.target + '"]')  :  $();
        },
        getArgs:      function () {
            var iArgs = { },  iData = this.ownerView.getData();

            (this.src || this.action || '').replace(
                InnerLink.reURLVar,
                function () {
                    iArgs[ arguments[1] ] = iData[ arguments[1] ];
                }
            );
            for (var iKey in this.data)
                iArgs[ this.data[iKey] ] = iData[ this.data[iKey] ];

            return iArgs;
        },
        getURL:       function (iName, iScope) {
            var iURL = this[iName] =
                    this.$_DOM[0].getAttribute(iName) || this[iName];

            iScope = iScope  ||  (this.ownerView || '').data;

            if (! iURL)  return;

            if (! $.isEmptyObject(iScope)) {
                var _Args_ = { },  _Data_;

                for (var iKey in this.data) {
                    _Data_ = iScope[ this.data[iKey] ];

                    if ($.isData(_Data_))  _Args_[iKey] = _Data_;
                }

                iURL = $.extendURL(
                    iURL.replace(InnerLink.reURLVar,  function () {
                        return  iScope[arguments[1]] || '';
                    }),
                    _Args_
                );
            }

            if ((iName != 'href')  &&  (! $.urlDomain(iURL || ' ')))
                iURL = this.ownerApp.apiPath + iURL;

            return iURL;
        },
        register:     function (Index) {
            DOM.title = this.title || DOM.title;

            BOM.history[
                (this.$_DOM[0].tagName != 'LINK')  ?
                    'pushState'  :  'replaceState'
            ](
                {index: Index},
                DOM.title,
                '#!'  +  $.extendURL(this.href, this.getArgs())
            );

            return this;
        },
        loadData:     function (iScope) {
            var iOption = {type:  this.method};

            if (! this.$_DOM.find('input[type="file"]')[0])
                iOption.data = this.$_DOM.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_DOM[0] );
                iOption.contentType = iOption.processData = false;
            }

            return $.ajax(
                this.getURL('src', iScope)  ||  this.getURL('action', iScope),
                iOption
            );
        },
        prefetch:     function () {
            var iHTML = (this.href || '').split('?')[0],
                iJSON = this.src || this.action || '';

            if (iHTML)
                $_Prefetch.clone(true).attr('href', iHTML).appendTo('head');

            if (
                (this.method == 'get')  &&
                (! iJSON.match(this.constructor.reURLVar))  &&
                $.isEmptyObject( this.data )
            )
                $_Prefetch.clone(true).attr(
                    'href',  this.getURL('src') || this.getURL('action')
                ).appendTo('head');
        }
    });

    return InnerLink;

});
