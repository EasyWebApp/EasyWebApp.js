define([
    'jquery', './base/Observer',
    './view/View', './view/HTMLView', './view/ListView', './view/TreeView',
    './view/DOMkit', './InnerLink'
],  function ($, Observer, View, HTMLView, ListView, TreeView, DOMkit, InnerLink) {

    /**
     * Web 应用（单例）构造函数
     *
     * @author  TechQuery
     *
     * @class   WebApp
     * @extends Observer
     *
     * @param   {jQueryAcceptable}  Page_Box    Container DOM for Inner Page
     * @param   {(string|URL)}      [API_Root]  The Root Path of Back-end API
     *                                          formatted as Absolute URL
     */

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new WebApp(this[0], Page_Box, API_Root);

        var _This_ = WebApp.instanceOf( $('*:webapp') )  ||  this;

        if (_This_ !== this)  return _This_;

        Observer.call(this, Page_Box).pageRoot = new URL( $.filePath() );
        /**
         * 后端 API 根路径
         *
         * @name     apiRoot
         * @type     {URL}
         *
         * @memberof WebApp
         * @instance
         *
         * @readonly
         */
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
        /**
         * 明文显示当前 SPA 内页的路由 URI
         *
         * @author    TechQuery
         *
         * @memberof  WebApp.prototype
         *
         * @returns   {string}  The full route URI of current Inner Page
         *                      in plain text
         */
        getRoute:         function () {
            try {
                return self.atob(
                    (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
                );
            } catch (error) { }
        },
        _emit:            function (type, link, data) {

            var $_Target = ((link.target === 'page')  ?  this  :  link).$_View;

            var observer = (type in link.__handle__)  ?
                    link  :  View.instanceOf($_Target, false);

            /**
             * 基于链接路由的事件对象
             *
             * @typedef  {object}      RouterEvent
             *
             * @property {string}      type              Event Name
             * @property {HTMLElement} target            Related Element
             * @property {string}      [href]            HTML URI
             * @property {string}      [src]             JSON URI
             * @property {string}      [method="GET"]    HTTP Method of JSON URI
             * @property {string}      [contentType]     MIME Type of request
             * @property {string}      [charset="UTF-8"] CharSet of request
             */

            link = $.extend(link.valueOf(), {
                type:      type,
                target:    $_Target[0]
            });

            data = this.emit(link, data)  ||  data;

            return  observer  ?  (observer.emit(link, data)  ||  data)  :  data;
        },
        emitRoute:        function (link) {

            var $_Nav = $('a[href], area[href]'),  route = this.getRoute();

            var page = route.split('?')[0];

            var path = $.filePath( page )  ||  page,  $_Item;

            ($_Item = linkOf.call($_Nav, route))[0]  ||
            ($_Item = linkOf.call($_Nav, page))[0]  ||
            ($_Item = linkOf.call($_Nav, path, true));

            /**
             * 路由切换事件
             *
             * @event WebApp#route
             *
             * @type  {RouterEvent}
             */

            this._emit('route', link, $_Item);
        },
        switchTo:         function (Index) {

            if (this.lastPage == Index)  return;

            var page = View.instanceOf(this.$_View, false);

            if ( page )  page.detach();

            if (this.lastPage > -1)  this[ this.lastPage ].view = page;

            if (page = (this[ Index ]  ||  '').view) {

                page.attach();

                this.emitRoute( this[ Index ] );

                return page;
            }
        },
        setRoute:         function (link) {

            this.switchTo();

            if (this[ this.lastPage ]  !=  (link + '')) {

                if (++this.lastPage != this.length)
                    this.splice(this.lastPage, Infinity);

                self.history[
                    ((this.getRoute() == link) ? 'replace' : 'push')  +  'State'
                ](
                    {index: this.length},
                    document.title = link.title,
                    '#!'  +  self.btoa( this.getCID( link ) )
                );

                this.emitRoute( this[ this.length++ ] = link );
            }

            return this;
        },
        loadView:         function (link, HTML) {

            var target = (
                    (link.target === 'page')  ?  this.setRoute( link )  :  link
                ).$_View[0];

            /**
             * 视图模板 加载成功事件
             *
             * @event WebApp#template
             *
             * @type  {RouterEvent}
             */

            HTML = this._emit('template', link, HTML);

            var view = View.getSub(target, link.href);

            if ( view.parse )  view.parse( HTML );

            if (! $('script:not(head > *)', target)[0])
                link.emit('load');

            return view;
        },
        loadChild:        function (view) {

            return Promise.all($.map(
                view.childOf(':visible'),  this.load.bind( this )
            )).then(function () {

                return view;
            });
        },
        loadComponent:    function (link, HTML, data) {

            var JS_Load = link.one('load'),  view = this.loadView(link, HTML);

            return  JS_Load.then(function (factory) {

                data = $.extend(
                    data,  link.data,  link.$_View[0].dataset,  data
                );

                return view.render(
                    factory  ?  (factory.call(view, data)  ||  data)  :  data
                );
            }).then( this.loadChild.bind( this ) );
        },
        autoFocus:        function (global) {

            var target = $(
                    'a[href][data-autofocus="true"]',
                    global ? document : this.$_View[0]
                )[0];

            if ( target ) {

                target.click();

                return  this.one({type: 'ready',  target: this.$_View[0]});
            }
        },
        /**
         * 加载一个链接/视图的 DOM 元素或 SPA 对象
         *
         * @author    TechQuery
         *
         * @memberof  WebApp.prototype
         *
         * @param     {HTMLElement|View}  link - an HTML Element or SPA Object of
         *                                       a Link or View
         * @returns   {Promise}
         *
         * @fires     WebApp#request
         * @fires     WebApp#data
         * @fires     WebApp#ready
         */
        load:             function (link) {

            if (! (link instanceof InnerLink))
                link = new InnerLink(
                    (link instanceof Observer)  ?  link.$_View[0]  :  link
                );

            var _This_ = this;

            return  link.load(function () {

                if ((this.dataType || '').slice(0, 4)  ===  'json')
                    this.url = (new URL(this.url, _This_.apiRoot))  +  '';

                /**
                 * AJAX 请求发起事件
                 *
                 * @event WebApp#request
                 *
                 * @type  {RouterEvent}
                 */

                _This_._emit('request', link, {
                    option:       this,
                    transport:    arguments[0]
                });

                this.crossDomain = $.isXDomain( this.url );

            }).then(function () {

                var data = arguments[0][1];

                if (data != null) {

                    link.header = data.head;

                    /**
                     * 链接 / 视图 数据加载成功事件
                     *
                     * @event WebApp#data
                     *
                     * @type  {RouterEvent}
                     */

                    data = _This_._emit('data', link, data.body);
                }

                if (link.target !== 'data')
                    return  _This_.loadComponent(link, arguments[0][0], data);

            }).then(function (view) {

                if (! (view instanceof View))  return;

                var promise = view.one('ready');

                /**
                 * 视图加载完成事件
                 *
                 * @event WebApp#ready
                 *
                 * @type  {RouterEvent}
                 */

                _This_._emit('ready', link, view);

                if (link.target === 'page')
                    promise = _This_.autoFocus() || promise;

                return promise;
            });
        },
        /**
         * 按 浏览历史索引 或 路由 URI 加载内页
         *
         * @author    TechQuery
         *
         * @memberof  WebApp.prototype
         *
         * @param     {number|string} [URI=0] - a History Index or Route URI
         * @returns   {Promise}
         *
         * @listens   WebApp#ready
         */
        loadPage:         function (URI) {

            URI = URI || 0;

            if (isNaN( URI ))
                return  this.load( $('<a href="' + URI + '" />')[0] );

            var link = this[+URI + this.lastPage];

            if ( link )  delete link.view;

            if (! URI)  return  this.load( link );

            self.history.go( URI );

            return  this.one({type: 'ready',  target: this.$_View[0]});
        },
        listen:           function () {

            var _This_ = this;

            $('html').on('click submit',  InnerLink.HTML_Link,  function (event) {
                if (
                    ((this.tagName !== 'FORM')  ||  (event.type === 'submit'))  &&
                    ((this.target || '_self')  ===  '_self')  &&
                    _This_.getCID(this.href || this.action)
                ) {
                    event.preventDefault();

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

            var root = (new HTMLView('html')).parse().render( $.paramJSON() ),
                _This_ = this;

            return  this[root.$_View[0].dataset.href ? 'load' : 'loadChild'](
                root
            ).then(function () {

                var Init = _This_.getRoute();

                return  Init ?
                    _This_.loadPage( Init )  :  _This_.autoFocus( true );
            });
        }
    });
});
