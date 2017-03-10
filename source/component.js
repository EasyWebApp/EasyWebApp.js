define([
    'jquery', 'TreeBuilder', 'HTMLView', 'iQuery+'
],  function ($, TreeBuilder, HTMLView) {

/* ---------- SPA 链接 ---------- */

    function InnerLink(Link_DOM, Glob_Env) {

        this.$_View = $( Link_DOM );

        this.$_Target = Glob_Env.target[
            this.target = Link_DOM.target || '_self'
        ]  ||  $(
            '[name="' + this.target + '"]'
        );

        this.method = (Link_DOM.getAttribute('method') || 'Get').toUpperCase();

        this.src = $.paramJSON(
            this.href = Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action')
        )['for'];

        if (! $.urlDomain( this.src ))  this.src = Glob_Env.dataBase + this.src;

        this.href = this.href.split('?')[0];

        this.title = Link_DOM.title || document.title;
    }

    $.extend(InnerLink.prototype, {
        loadData:    function () {
            if (! this.src)  return;

            if (this.$_View[0].tagName == 'A')
                return  Promise.resolve($.getJSON( this.src ));

            var iOption = {type: this.method};

            if (! this.$_View.find('input[type="file"]')[0])
                iOption.data = this.$_View.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = iOption.type.toUpperCase() + ' ' + this.src;

            return  Promise.resolve($.ajax(this.src, iOption)).then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
        },
        load:        function () {
            var iData,  _This_ = this;

            return Promise.all([
                $.get( this.href ),  this.loadData()
            ]).then(function () {

                iData = arguments[0][1];

                return  _This_.$_Target.empty().htmlExec( arguments[0][0] );

            }).then(function () {

                return iData;
            });
        },
        valueOf:     function () {
            var _This_ = { };

            for (var iKey in this)
                if (
                    (typeof this[iKey] != 'object')  &&
                    (typeof this[iKey] != 'function')
                )
                    _This_[iKey] = this[iKey];

            return _This_;
        }
    });

/* ---------- SPA 单例 ---------- */

    function WebApp(Page_Box, API_Root) {

        this.$_Page = $( Page_Box );

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;

        var Init = this.getRoute();

        if ( Init )  this.load( $('<a />',  {href: Init})[0] );

        this.listenDOM().listenBOM();
    }

    $.extend(WebApp.prototype, {
        push:         Array.prototype.push,
        splice:       Array.prototype.splice,
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
                .replace(/\.(js|html)(\?.*)?/i, '.html');
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

                if (this.$_Page[0] == iLink.$_Target[0])
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
                throw 'WebApp.prototype.define() can only be executed synchronously in script tags, not a callback function.';

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

    return WebApp;

});