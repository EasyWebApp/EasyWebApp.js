define([
    'jquery', './base/Observer',
    './view/View', './view/HTMLView', './view/ListView', './view/TreeView',
    './view/DOMkit', './InnerLink'
],  function ($, Observer, View, HTMLView, ListView, TreeView, DOMkit, InnerLink) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new WebApp(this[0], Page_Box, API_Root);

        var _This_ = WebApp.instanceOf( $('*:webapp') )  ||  this;

        if (_This_ !== this)  return _This_;

        Observer.call(this, Page_Box).pageRoot = new URL($.filePath() + '/');

        this.apiRoot = new URL(API_Root || '',  this.pageRoot);

        this.length = 0;

        this.lastPage = -1;

        self.setTimeout( this.listen().boot.bind( this ) );
    }

    function linkOf(URL, part) {

        return this.filter(
            '[href'  +  (part ? '^' : '')  +  '="'  +  URL  +  '"]'
        );
    }

    return  Observer.extend(WebApp, {
        View:        View,
        HTMLView:    HTMLView,
        ListView:    ListView,
        TreeView:    TreeView
    }, {
        splice:           Array.prototype.splice,
        getCID:           function () {

            return  (arguments[0] + '').replace(this.pageRoot, '').split('#')[0];
        },
        getRoute:         function () {
            try {
                return self.atob(
                    (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
                );
            } catch (error) { }
        },
        _emit:            function (iType, iLink, iData) {

            var $_Target = ((iLink.target === 'page')  ?  this  :  iLink).$_View;

            var observer = (iType in iLink.__handle__)  ?
                    iLink  :  View.instanceOf($_Target, false);

            iLink = $.extend(iLink.valueOf(), {
                type:      iType,
                target:    $_Target[0]
            });

            iData = this.emit(iLink, iData)  ||  iData;

            return  observer  ?  (observer.emit(iLink, iData)  ||  iData)  :  iData;
        },
        emitRoute:        function (link) {

            var $_Nav = $('a[href], area[href]').not(
                    this.$_View.find('a, area').addBack()
                ),
                route = this.getRoute();

            var page = route.split('?')[0];

            var path = $.filePath( page )  ||  page,  $_Item;

            if (
                ($_Item = linkOf.call($_Nav, route))[0]  ||
                ($_Item = linkOf.call($_Nav, page))[0]  ||
                ($_Item = linkOf.call($_Nav, path, true))[0]
            )
                this._emit('route', link, $_Item);
        },
        switchTo:         function (Index) {

            if (this.lastPage == Index)  return;

            var iPage = View.instanceOf(this.$_View, false);

            if ( iPage )  iPage.detach();

            if (this.lastPage > -1)  this[ this.lastPage ].view = iPage;

            if (iPage = (this[ Index ]  ||  '').view) {

                iPage.attach();

                this.emitRoute( this[ Index ] );

                return iPage;
            }
        },
        setRoute:         function (iLink) {

            this.switchTo();

            if (this[ this.lastPage ]  !=  (iLink + '')) {

                if (++this.lastPage != this.length)
                    this.splice(this.lastPage, Infinity);

                self.history[
                    ((this.getRoute() == iLink) ? 'replace' : 'push')  +  'State'
                ](
                    {index: this.length},
                    document.title = iLink.title,
                    '#!'  +  self.btoa( this.getCID( iLink ) )
                );

                this.emitRoute( this[ this.length++ ] = iLink );
            }

            return this;
        },
        loadView:         function (iLink, iHTML) {

            var iTarget = (
                    (iLink.target === 'page')  ?  this.setRoute( iLink )  :  iLink
                ).$_View[0];

            if (iHTML = this._emit('template', iLink, iHTML))
                DOMkit.build(iTarget, iLink, iHTML);

            var iView = View.getSub( iTarget );

            if ( iView.parse )  iView.parse();

            if (! $('script:not(head > *)', iTarget)[0])
                iLink.emit('load');

            return iView;
        },
        loadComponent:    function (iLink, iHTML, iData) {

            var JS_Load = iLink.one('load');

            var iView = this.loadView(iLink, iHTML),  _This_ = this;

            return  JS_Load.then(function (iFactory) {

                iData = $.extend(
                    iData,  iLink.data,  iLink.$_View[0].dataset,  iData
                );

                iView.render(
                    iFactory  ?  (iFactory.call(iView, iData)  ||  iData)  :  iData
                );
            }).then(function () {

                return Promise.all($.map(
                    iView.childOf(':visible'),  _This_.load.bind(_This_)
                ));
            }).then(function () {  return iView;  });
        },
        load:             function (iLink) {

            if (! (iLink instanceof InnerLink))
                iLink = new InnerLink(
                    (iLink instanceof Observer)  ?  iLink.$_View[0]  :  iLink
                );

            var _This_ = this;

            return  iLink.load(function () {

                if ((this.dataType || '').slice(0, 4)  ===  'json')
                    this.url = (new URL(this.url, _This_.apiRoot))  +  '';

                _This_._emit('request', iLink, {
                    option:       this,
                    transport:    arguments[0]
                });

                this.crossDomain = $.isXDomain( this.url );

            }).then(function () {

                var iData = arguments[0][1];

                if (iData != null) {

                    iLink.header = iData.head;

                    iData = _This_._emit('data', iLink, iData.body);
                }

                if (iLink.target !== 'data')
                    return  _This_.loadComponent(iLink, arguments[0][0], iData);

            }).then(function (iView) {

                if (iView instanceof View)  _This_._emit('ready', iLink, iView);
            });
        },
        loadPage:         function (iURI) {

            iURI = iURI || 0;

            if (isNaN( iURI ))
                return  this.load( $('<a href="' + iURI + '" />')[0] );

            var link = this[this.lastPage + iURI];

            if ( link )  delete link.view;

            self.history.go( iURI );

            return  this.one({type: 'ready',  target: this.$_View[0]});
        },
        listen:           function () {

            var _This_ = this;

            $('html').on('click submit',  InnerLink.HTML_Link,  function (iEvent) {
                if (
                    ((this.tagName !== 'FORM')  ||  (iEvent.type === 'submit'))  &&
                    ((this.target || '_self')  ===  '_self')  &&
                    _This_.getCID(this.href || this.action)
                ) {
                    iEvent.preventDefault();

                    _This_.load( this );
                }
            });

            $( self ).on('popstate',  function () {

                var state = this.history.state || '',  route = _This_.getRoute();

                var link = _This_[ state.index ];

            //  To reload history pages after the Web App reloading

                if ((! link)  ||  (
                    route  &&  (! state.data)  &&  (route != _This_.getCID( link ))
                ))
                    return  route  &&  _This_.loadPage( route );

                if (_This_.lastPage !== state.index)
                    Promise.resolve(
                        _This_.switchTo( state.index )  ||  _This_.load( link )
                    ).then(function () {

                        _This_.lastPage = state.index;

                        document.title = link.title;
                    });
                else if ( state.data )
                    View.instanceOf(_This_.$_View, false).render( state.data );
            });

            return this;
        },
        boot:             function () {

            var $_View = $('[data-href]:not([data-href] *)').not(
                    this.$_View.find('[data-href]')
                ),
                _This_ = this;

            DOMkit.build($_View.sameParents()[0], '');

            return  Promise.all($.map($_View,  function () {

                return  _This_.load( arguments[0] );

            })).then(function () {

                var Init = _This_.getRoute();

                if ( Init )  return  _This_.loadPage( Init );

                $('a[href][data-autofocus="true"]').eq(0).click();
            });
        }
    });
});