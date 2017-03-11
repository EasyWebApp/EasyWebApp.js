//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.8  (2017-03-11)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
//


define([
    'jquery', 'Observer', 'InnerLink', 'TreeBuilder', 'HTMLView'
],  function ($, Observer, InnerLink, TreeBuilder, HTMLView) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Root);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        Observer.call( this ).$_Page = $( Page_Box ).data('_EWA_', this);

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;
        this.loading = { };

        this.listenDOM().listenBOM();

        var Init = this.getRoute();

        if ( Init )
            this.load( $('<a />',  {href: Init})[0] );
        else
            $('body a[href][autofocus]').eq(0).click();
    }

    $.fn.iWebApp = $.inherit(Observer, WebApp, null, {
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
        promise:      function (CID) {
            var _This_ = this;

            this.loading[CID] = [ ];

            var iPromise = new Promise(function () {

                    _This_.loading[CID].push(arguments[0], arguments[1]);
                });

            this.loading[CID].push( iPromise );

            return iPromise;
        },
        resolve:      function (CID, iValue) {

            this.loading[CID][0]( iValue );

            delete this.loading[CID];

            return iValue;
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

            var iData,  _This_ = this,  JS_Load,  iView;

            return  iLink.load().then(function () {

                var iEvent = iLink.valueOf();  iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit($.extend(iEvent, {type: 'data'}),  iData);

                JS_Load = _This_.promise( iLink.href );

                return iLink.$_Target.empty().htmlExec(
                    _This_.emit(
                        $.extend(iEvent, {type: 'template'}),  arguments[0][0]
                    )
                );
            }).then(function () {

                iView = TreeBuilder( iLink.$_Target );

                if (
                    (_This_.$_Page[0] == iLink.$_Target[0])  &&
                    (_This_.indexOf( iLink )  ==  -1)
                )
                    _This_.setRoute( iLink );

                if (! iLink.$_Target.find('script[src]')[0])
                    _This_.resolve( iLink.href );

                return JS_Load;

            }).then(function (iFactory) {

                if ( iFactory ) {
                    iFactory.push( iData );

                    iData = iFactory.shift().apply(iView, iFactory)  ||  iData;
                }

                if (typeof iData == 'object')  iView.render( iData );
            });
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

            var _This_ = this,  CID = this.getCID( document.currentScript.src );

            return  new Promise(function (iResolve) {

                self.require(iSuper,  function () {

                    iResolve(_This_.resolve(
                        CID,  Array.prototype.concat.apply([iFactory], arguments)
                    ));
                });
            });
        }
    });

    WebApp.fn = WebApp.prototype;

    return WebApp;

});