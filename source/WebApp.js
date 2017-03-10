define([
    'jquery', 'InnerLink', 'TreeBuilder', 'HTMLView', 'jQuery+'
],  function ($, InnerLink, TreeBuilder, HTMLView) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Root);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        this.$_Page = $( Page_Box ).data('_EWA_', this);

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;

        this.listenDOM().listenBOM();

        var Init = this.getRoute();

        if ( Init )
            this.load( $('<a />',  {href: Init})[0] );
        else
            $('body a[href][autofocus]').eq(0).click();
    }

    $.extend(WebApp.prototype, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!'  +  self.btoa(iLink.href + '?for=' + iLink.src)
            );

            this.push( iLink );
        },
        getRoute:     function () {
            return self.atob(
                (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
            );
        },
        getCID:       function () {
            return  arguments[0].replace(this.pageRoot, '')
                .replace(/\.\w+(\?.*)?/i, '.html');
        },
        load:         function (iLink) {

            if (iLink instanceof Element) {

                var iName = iLink.href ? 'href' : 'action';

                iLink.setAttribute(iName, iLink[iName].replace(this.pageRoot, ''));

                iLink = new InnerLink(iLink, {
                    target:      {_self:  this.$_Page},
                    dataBase:    this.apiRoot
                });
            }

            return  iLink.load().then($.proxy(function () {
                if (
                    (this.$_Page[0] == iLink.$_Target[0])  &&
                    (this.indexOf( iLink )  ==  -1)
                )
                    this.setRoute( iLink );

                var iPromise = (this[iLink.href] instanceof Array)  ?
                        this[iLink.href]  :  '';

                this[iLink.href] = TreeBuilder( iLink.$_Target );

                if ( iPromise )  iPromise[0]( arguments[0] );

            }, this));
        },
        listenDOM:    function () {
            var _This_ = this;

            $(document).on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        $(this).value('name')
                    );
            })).on('click submit',  'a[href], form[action]',  function () {

                var CID = (this.href || this.action).match(_This_.pageRoot);

                if ((CID || '').index === 0) {

                    arguments[0].preventDefault();

                    _This_.load( this );
                }
            });

            return this;
        },
        listenBOM:    function () {
            var _This_ = this;

            $(self).on('popstate',  function () {

                var Index = (arguments[0].originalEvent.state || '').index;

                if ((! _This_[Index])  ||  (_This_.lastPage == Index))  return;

                _This_.$_Page.empty();

                _This_.load(_This_[Index]).then(function () {

                    _This_.lastPage = Index;

                    document.title = _This_[Index].title;
                });
            });
        },
        define:       function (iSuper, iFactory) {

            if (! document.currentScript)
                throw SyntaxError(
                    'WebApp.prototype.define() can only be executed synchronously in script tags, not a callback function.'
                );

            var CID = this.getCID( document.currentScript.src ),  _This_ = this;

            return Promise.all([
                new Promise(function (iResolve) {

                    self.require(iSuper,  function () {

                        iResolve( arguments );
                    });
                }),
                new Promise(function () {

                    _This_[CID] = $.makeArray( arguments );
                })
            ]).then(function () {

                iSuper = $.makeArray( arguments[0][0] );

                var iData = arguments[0][1];

                iSuper.push( iData );

                _This_[CID].render(iFactory.apply(_This_[CID], iSuper)  ||  iData);
            });
        }
    });

    return  $.fn.iWebApp = WebApp;

});