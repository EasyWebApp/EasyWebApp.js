define([
    'jquery', 'Observer', 'InnerLink', 'TreeBuilder', 'HTMLView', 'View'
],  function ($, Observer, InnerLink, TreeBuilder, HTMLView, View) {

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

    return  $.inherit(Observer, WebApp, null, {
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
                    iLink.href  +  (iLink.src  ?  ('?for=' + iLink.src)  :  '')
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
        resolve:      function (CID) {

            this.loading[CID].resolve( arguments[1] );

            delete this.loading[CID];

            return this;
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

            this.loading[ iLink.href ] = iLink;

            var iData,  iEvent = iLink.valueOf(),  _This_ = this,  JS_Load,  iView;

            return  iLink.load().then(function () {

                iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit($.extend(iEvent, {type: 'data'}),  iData);

                var iPrev = View.instanceOf(iLink.$_Target, false);

                if ( iPrev )  iPrev.destructor();

                JS_Load = iLink.promise();

                return iLink.$_Target.htmlExec(
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

                if ( iFactory )  iData = iFactory.call(iView, iData)  ||  iData;

                _This_.emit(
                    $.extend(iEvent,  {type: 'ready'}),
                    (typeof iData == 'object')  ?  iView.render(iData)  :  iView
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

                if (_This_[Index]  &&  (_This_.lastPage != Index))
                    _This_.load(_This_[Index]).then(function () {

                        _This_.lastPage = Index;

                        document.title = _This_[Index].title;
                    });
            });
        }
    });
});