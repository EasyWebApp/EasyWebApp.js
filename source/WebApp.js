define([
    'jquery', 'Observer', 'View', 'HTMLView', 'ListView', 'InnerLink'
],  function ($, Observer, View, HTMLView, ListView, InnerLink) {

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

        this.listenDOM().listenBOM().boot();
    }

    return  $.inherit(Observer, WebApp, {
        View:        View,
        HTMLView:    HTMLView,
        ListView:    ListView
    }, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!'  +  self.btoa( iLink.getURI() )
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
        loadView:     function (iLink, iHTML) {

            var $_Target = iLink.$_View;

            if (iLink.target == 'page') {

                var iPrev = View.instanceOf(this.$_Page, false);

                if ( iPrev )  iPrev.detach();

                if (this.indexOf( iLink )  ==  -1)  this.setRoute( iLink );

                $_Target = this.$_Page;
            }

            iHTML = this.emit(
                $.extend(iLink.valueOf(),  {type: 'template'}),  iHTML
            );

            var iView = View.getSub( $_Target[0] );

            if (! $_Target.children()[0]) {

                $_Target[0].innerHTML = iHTML;

                iHTML = '';
            }
            if ( iView.parse )
                iView.parse($.filePath(iLink.href) + '/',  iHTML);

            if (! $_Target.find('script[src]:not(head > *)')[0])
                iLink.emit('load');

            iView.__data__.extend( iLink.data );

            return iView;
        },
        loadComponent:    function (iLink, iHTML, iData) {

            this.loading[ iLink.href ] = iLink;

            var JS_Load = iLink.one('load');

            var iView = this.loadView(iLink, iHTML),  _This_ = this;

            return  JS_Load.then(function (iFactory) {

                delete _This_.loading[ iLink.href ];

                if ( iFactory )
                    iData = iFactory.call(iView, iData)  ||  iData;

                return iView.render(
                    ((typeof iData == 'object') && iData)  ||  { }
                );
            });
        },
        load:         function (iLink) {

            if (iLink instanceof Element)
                iLink = new InnerLink(iLink, this.apiRoot);

            if ((! iLink.href)  &&  (iLink.target != 'view'))
                return  this.loadData( iLink );

            var _This_ = this,  iView;

            return  iLink.load(function () {

                _This_.emit($.extend(iLink.valueOf(), {type: 'request'}),  {
                    option:       this,
                    transport:    arguments[0]
                });
            }).then(function () {

                var iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit(
                        $.extend(iLink.valueOf(), {type: 'data'}),  iData
                    );

                return  _This_.loadComponent(iLink, arguments[0][0], iData);

            }).then(function () {

                iView = arguments[0];

                return Promise.all($.map(
                    iView.__child__,  $.proxy(_This_.load, _This_)
                ));
            }).then(function () {

                _This_.emit(
                    $.extend(iLink.valueOf(), {type: 'ready'}),  iView
                );
            });
        },
        listenDOM:    function () {
            var _This_ = this;

            $('html').on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        $(this).value('name')
                    );
            })).on('click submit',  InnerLink.HTML_Link,  function (iEvent) {
                if (
                    ((this.tagName == 'FORM')  &&  (iEvent.type != 'submit'))  ||
                    (this.target  &&  (this.target != '_self'))
                )
                    return;

                var CID = (this.href || this.action).match(_This_.pageRoot);

                if ((CID || '').index === 0) {

                    iEvent.preventDefault();

                    _This_.load( this );
                }
            });

            return this;
        },
        listenBOM:    function () {
            var _This_ = this;

            $(self).on('popstate',  function () {

                var Index = (arguments[0].originalEvent.state || '').index;

                if (_This_[Index]  &&  (_This_.lastPage != Index))
                    _This_.load(_This_[Index]).then(function () {

                        _This_.lastPage = Index;

                        document.title = _This_[Index].title;
                    });
            });

            return this;
        },
        boot:         function () {

            var $_Init = $('[data-href]').not( this.$_Page.find('[data-href]') ),
                _This_ = this;

            return  ($_Init[0]  ?  this.load( $_Init[0] )  :  Promise.resolve(''))
                .then(function () {

                    var Init = _This_.getRoute();

                    if ( Init )
                        return  _This_.load( $('<a />',  {href: Init})[0] );

                    $('a[href][data-autofocus="true"]').eq(0).click();
                });
        }
    });
});