define([
    'jquery', 'Observer', 'View', 'HTMLView', 'ListView', 'InnerLink', 'TreeBuilder'
],  function ($, Observer, View, HTMLView, ListView, InnerLink, TreeBuilder) {

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
                '#!' + self.btoa(
                    iLink.href  +  (iLink.src  ?  ('?data=' + iLink.src)  :  '')
                )
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

            var $_Target;

            switch ( iLink.target ) {
                case '_blank':    return;
                case '_self':     {
                    var iPrev = View.instanceOf(this.$_Page, false);

                    if ( iPrev )  iPrev.destructor();

                    if (this.indexOf( iLink )  ==  -1)  this.setRoute( iLink );

                    $_Target = this.$_Page;    break;
                }
                default:          $_Target = iLink.$_View;
            }

            return HTMLView.build(
                $_Target,
                iHTML && this.emit(
                    $.extend(iLink.valueOf(), {type: 'template'}),  iHTML
                )
            ).then(function ($_Content) {

                if (! $_Target.find('script[src]:not(head > *)')[0])
                    iLink.emit('load');

                var iView = TreeBuilder( $_Target );

                if ( $_Content ) {
                    iView.root.parseSlot( $_Content );

                    $.merge(iView.sub, iView.root.$_View.find('[data-href]'));
                }

                if ( iView.root.parse )  iView.root.parse( iView.sub );

                iView.root.scope( iView.scope );

                return iView;
            });
        },
        loadComponent:    function (iLink, iHTML, iData) {

            this.loading[ iLink.href ] = iLink;

            var iView,  JS_Load = iLink.one('load'),  _This_ = this;

            return  this.loadView(iLink, iHTML).then(function () {

                iView = arguments[0];

                return JS_Load;

            }).then(function (iFactory) {

                delete _This_.loading[ iLink.href ];

                if ( iFactory )
                    iData = iFactory.call(iView.root, iData)  ||  iData;

                iView.root.render(((typeof iData == 'object') && iData)  ||  { });

                return iView;
            });
        },
        loadData:     function (iLink) {
            var _This_ = this;

            return  iLink.loadData().then(function (iData) {

                if (iData != null)
                    iData = _This_.emit(
                        $.extend(iLink.valueOf(), {type: 'data'}),  iData
                    );

                return iData;
            });
        },
        load:         function (iLink) {

            if (iLink instanceof Element)
                iLink = new InnerLink(iLink, this.apiRoot);

            if ((! iLink.href)  &&  iLink.target)
                return  this.loadData( iLink );

            var _This_ = this,  iView;

            return  Promise.all([
                iLink.href  &&  $.get( iLink.href ),
                iLink.src  &&  this.loadData( iLink )
            ]).then(function () {

                return  _This_.loadComponent(
                    iLink,  arguments[0][0],  arguments[0][1]
                );
            }).then(function () {

                iView = arguments[0];

                return Promise.all($.map(
                    iView.sub,  $.proxy(_This_.load, _This_)
                ));
            }).then(function () {

                _This_.emit(
                    $.extend(iLink.valueOf(), {type: 'ready'}),  iView.root
                );
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
            })).on('click submit',  InnerLink.HTML_Link,  function (iEvent) {

                if ((this.tagName == 'FORM')  &&  (iEvent.type != 'submit'))
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

                    $('a[href][data-autofocus]').eq(0).click();
                });
        }
    });
});