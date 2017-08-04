define([
    'jquery', './base/Observer',
    './view/View', './view/HTMLView', './view/ListView', './view/DOMkit',
    './InnerLink'
],  function ($, Observer, View, HTMLView, ListView, DOMkit, InnerLink) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Root);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        Observer.call(this, Page_Box).destructor().$_View.data('_EWA_', this);

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;
        this.loading = { };

        self.setTimeout( this.listenDOM().listenBOM().boot.bind( this ) );
    }

    return  $.inherit(Observer, WebApp, {
        View:        View,
        HTMLView:    HTMLView,
        ListView:    ListView
    }, {
        splice:           Array.prototype.splice,
        switchTo:         function (Index) {

            if (this.lastPage == Index)  return;

            var iPage = View.instanceOf(this.$_View, false);

            if ( iPage )  iPage.detach();

            if (this.lastPage > -1)  this[ this.lastPage ].view = iPage;

            iPage = (this[ Index ]  ||  '').view;

            return  iPage && iPage.attach();
        },
        setRoute:         function (iLink) {

            this.switchTo();

            var iLast = this[ this.lastPage ],  iURI = iLink + '';

            if (iLast  &&  (iLast == iURI))  return;

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!'  +  self.btoa( iURI )
            );
            this[ this.length++ ] = iLink;
        },
        getRoute:         function () {
            return self.atob(
                (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
            );
        },
        _emit:            function (iType, iLink, iData) {

            return this.emit(
                $.extend(iLink.valueOf(), {
                    type:      iType,
                    target:
                        (iLink.target == 'page')  ?  this.$_View[0]  :  undefined
                }),
                iData
            );
        },
        getCID:           function () {

            return  arguments[0].replace(this.pageRoot, '')
                .replace(/\.\w+(\?.*)?$/, '.html');
        },
        loadView:         function (iLink, iHTML) {

            var $_Target = iLink.$_View;

            if (iLink.target == 'page') {

                this.setRoute( iLink );

                $_Target = this.$_View;
            }

            var iView = View.getSub(
                    DOMkit.build(
                        $_Target[0],  iLink,  this._emit('template', iLink, iHTML)
                    )
                );

            if ( iView.parse )  iView.parse();

            if (! $_Target.find('script[src]:not(head > *)')[0])
                iLink.emit('load');

            return iView;
        },
        loadComponent:    function (iLink, iHTML, iData) {

            var CID = this.getCID(
                    InnerLink.parsePath(this.pageRoot + iLink.href)
                );
            this.loading[ CID ] = iLink;

            var JS_Load = iLink.one('load');

            var iView = this.loadView(iLink, iHTML),  _This_ = this;

            return  JS_Load.then(function (iFactory) {

                delete _This_.loading[ CID ];

                var _Data_ = (iData instanceof Array)  ?  [ ]  :  { };

                iData = $.extend(
                    _Data_,  iLink.data,  iLink.$_View[0].dataset,  iData
                );

                if ( iFactory )
                    iData = $.extend(_Data_,  iData,  iFactory.call(iView, iData));

                iView.render( iData );

            }).then(function () {

                return Promise.all($.map(
                    iView.childOf(),  _This_.load.bind(_This_)
                ));
            }).then(function () {  return iView;  });
        },
        load:             function (iLink) {

            if (iLink instanceof Element)
                iLink = new InnerLink( iLink );

            var _This_ = this;

            return  iLink.load(function () {
                if (
                    ((this.dataType || '').slice(0, 4) == 'json')  &&
                    (! $.urlDomain( this.url ))
                )
                    this.url = _This_.apiRoot + this.url;

                _This_.emit($.extend(iLink.valueOf(), {type: 'request'}),  {
                    option:       this,
                    transport:    arguments[0]
                });

                this.crossDomain = $.isCrossDomain( this.url );

            }).then(function () {

                var iHTML = arguments[0][0],  iData = arguments[0][1];

                if (iData != null)  iData = _This_._emit('data', iLink, iData);

                if (iLink.target != 'data')
                    return  _This_.loadComponent(iLink, iHTML, iData);

            }).then(function (iView) {

                if (iView instanceof View)  _This_._emit('ready', iLink, iView);
            });
        },
        listenDOM:        function () {
            var _This_ = this;

            $('html').on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        ('value' in this)  ?  this.value  :  this.innerHTML
                    );
            })).on('reset',  'form',  function () {

                var data = $.paramJSON('?'  +  $( this ).serialize());

                for (var key in data)  data[ key ] = '';

                View.instanceOf( this ).render( data );

            }).on('click submit',  InnerLink.HTML_Link,  function (iEvent) {
                if (
                    ((this.tagName == 'FORM')  &&  (iEvent.type != 'submit'))  ||
                    ((this.target || '_self')  !=  '_self')
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
        listenBOM:        function () {

            var _This_ = this;

            $( self ).on('popstate',  function () {

                var state = this.history.state || '';

                if (! _This_[ state.index ])  return;

                if (_This_.lastPage !== state.index)
                    Promise.resolve(
                        _This_.switchTo( state.index )  ||
                        _This_.load( _This_[ state.index ] )
                    ).then(function () {

                        _This_.lastPage = state.index;

                        document.title = _This_[ state.index ].title;
                    });
                else if ( state.data )
                    _This_.$_View.view().render( state.data );
            });

            return this;
        },
        boot:             function () {
            var _This_ = this;

            return Promise.all($.map(
                $('[data-href]:not([data-href] *)').not(
                    this.$_View.find('[data-href]')
                ),
                function () {
                    return  _This_.load( arguments[0] );
                }
            )).then(function () {

                var Init = _This_.getRoute();

                if ( Init )
                    return  _This_.load( $('<a />',  {href: Init})[0] );

                $('a[href][data-autofocus="true"]').eq(0).click();
            });
        }
    });
});