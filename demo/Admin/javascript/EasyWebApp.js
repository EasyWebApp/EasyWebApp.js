(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+'], arguments[0]);

})(function () {

    var WebApp;


var ViewDataIO = (function (BOM, DOM, $) {

    function ArrayRender(iArray, ValueRender) {
        $.ListView(this,  function () {
            ValueRender.call(arguments[0], arguments[1]);
        }).clear().render( iArray );
    }

    function ObjectRender(iData) {
        var _Self_ = arguments.callee;

        if (iData instanceof Array)
            return  ArrayRender.call(this[0], iData, _Self_);

        var iView = $.CommonView.getInstance(this);

        if (iView)  return iView.render(iData);

        this.value('name',  function (iName) {

            if (iData[iName] instanceof Array)
                ArrayRender.call(this, iData[iName], _Self_);
            else if ($.isPlainObject( iData[iName] ))
                _Self_.call($(this), iData[iName]);
            else
                return iData[iName];
        });
    }

    $.fn.extend({
        dataRender:    function (iData) {
            if (iData instanceof Array)
                ArrayRender.call(
                    $.ListView.findView(this, true)[0],  iData,  ObjectRender
                );
            else
                ObjectRender.call(this, iData);

            return this;
        },
        dataReader:    function () {
            var $_Key = $('[name]', this[0]).not( $('[name] [name]', this[0]) ),
                iData = { };

            if (! $_Key[0])  return this.value();

            for (var i = 0, iName, iLV;  i < $_Key.length;  i++) {
                iName = $_Key[i].getAttribute('name');
                iLV = $.ListView.getInstance( $_Key[i] );

                if (! iLV)
                    iData[iName] = arguments.callee.call( $( $_Key[i] ) );
                else {
                    iData[iName] = [ ];

                    for (var j = 0;  j < iLV.length;  j++)
                        iData[iName][j] = $.extend(
                            iLV.valueOf(j),  arguments.callee.call( iLV[j] )
                        );
                }
            }
            return iData;
        }
    });

})(self, self.document, self.jQuery);



var PageLink = (function (BOM, DOM, $) {

/* ---------- [object PageLink] ---------- */

    function PageLink(This_App, Link_DOM, iArgument, iData) {
        this.ownApp = This_App;
        this.$_DOM = $.isPlainObject(Link_DOM) ?
            this.createDOM(Link_DOM, iArgument, iData)  :
            $(Link_DOM);

        var _Self_ = arguments.callee,  iLink = this.$_DOM.data('EWA_PageLink');

        if (iLink instanceof _Self_)  return iLink;

        this.$_DOM.data('EWA_PageLink', this).css('cursor', 'pointer');

        $.extend(this, _Self_.getAttr(this.$_DOM));

        switch (this.target) {
            case '_top':      this.type = 'Outer';  break;
            case '_blank':    this.type = 'Data';   break;
            case '_self':     ;
            default:          if (this.href)  this.type = 'Inner';
        }
        this.method = (this.method || 'Get').toLowerCase();
        this.data = { };
        this.href = this.href || this.ownApp.history.last().HTML;
        this.href = this.getURL('href');

        var iFileName = $.fileName( this.href ).split('.');

        $.extend(this.data, {
            _File_Path_:    $.filePath( this.href ),
            _File_Name_:    iFileName[0],
            _Ext_Name_:     iFileName[1]
        });

        if (this.src)
            $.extend(this.data, {
                _Data_Path_:    $.filePath(this.src),
                _Data_Name_:    $.fileName(this.src)
            });

        if ((this.href || '').indexOf('?')  >  -1)
            this.data = $.extend($.paramJSON(this.href), this.data);
    }

    $.extend(PageLink, {
        getAttr:          function () {
            return arguments[0].attr([
                'target', 'title', 'alt', 'href', 'method', 'src', 'action'
            ]);
        },
        prefetchRel:      $.browser.modern ? 'prefetch' : 'next',
        prefetchClear:    function () {
            $('head link[rel="' + this.prefetchRel + '"]').remove();
        }
    });

    $.extend(PageLink.prototype, {
        createDOM:    function (iAttribute, iArgument, iData) {
            var _Argument_ = { };

            if ( $.isPlainObject(iArgument) )
                for (var iName in iArgument)
                    _Argument_['data-' + iName] = iArgument[iName];

            var $_Link = $('<button />', $.extend({
                    rel:    'nofollow',
                    css:    {display:  'none'}
                }, iAttribute, _Argument_)).appendTo(DOM.body);

            if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                $_Link.data('EWA_Model', iData);

            return $_Link;
        },
        getData:      function () {
            var iData = this.$_DOM.data('EWA_Model');

            if (! iData) {
                var $_Item = this.$_DOM.hasClass('ListView_Item') ?
                        this.$_DOM : this.$_DOM.parents('.ListView_Item');

                if ( $_Item[0] )
                    iData = $.ListView.getInstance( $_Item[0].parentNode )
                        .valueOf( $_Item );
            }
            return  this.data = $.extend(iData || { },  this.data);
        },
        getArgs:      function () {
            var iData = $.extend(this.ownApp.history.getData(), this.getData());

            return  $.map(this.$_DOM[0].dataset,  function (iName) {
                if (
                    ((Number(iName) % 1)  !==  0)  &&
                    (iData[iName] !== undefined)
                )
                    return iData[iName];

                return iName;
            });
        },
        getURL:       function (iKey) {
            if (! this[iKey])  return '';

            if ((iKey != 'href')  ||  (this[iKey][0] != '#')) {
                this[iKey] = this.ownApp.makeURL(
                    this[iKey] || '',
                    this.getData(),
                    ((iKey == 'href')  ?  (! this.src)  :  (
                        this.method.toUpperCase() == 'GET'
                    )) && this.getArgs()
                );
                if ((iKey == 'href')  &&  (this[iKey].slice(-1) == '?'))
                    this[iKey] = this[iKey].slice(0, -1);
            }
            return this[iKey];
        },
        valueOf:      function () {
            var iValue = { };

            for (var iKey in this)
                if (! (typeof this[iKey]).match(/object|function/))
                    iValue[iKey] = this[iKey];

            return iValue;
        }
    });

    return PageLink;

})(self, self.document, self.jQuery);



var InnerPage = (function (BOM, DOM, $, PageLink) {

/* ---------- [object InnerPage] ---------- */

    function InnerPage(App_Instance, iLink) {
        $.extend(this, {
            ownerApp:      App_Instance,
            sourceLink:    iLink,
            title:         iLink.title || DOM.title,
            URL:           iLink.alt || BOM.location.href,
            HTML:          iLink.href || DOM.URL,
            method:        iLink.method,
            JSON:          iLink.src || iLink.action,
            time:          $.now(),
            innerLink:     [ ]
        });
    }

    $.extend(InnerPage.prototype, {
        show:       function ($_Page) {
            $_Page = $_Page ? $($_Page) : this.$_Page;

            var iHistory = this.ownerApp.history;
            var iForward = iHistory.isForward(this);

            if (! $_Page) {
                if (this.sourceLink.type != 'Inner')
                    BOM.setTimeout(function () {
                        BOM.history[iForward ? 'forward' : 'back']();
                    });
                else {
                    this.sourceLink = new PageLink(
                        this.ownerApp,  this.sourceLink.valueOf()
                    );
                    this.sourceLink.$_DOM[0].click();
                }
                return this;
            }

            var $_Target = this.sourceLink.getTarget();

            if (iHistory.length || iForward)  iHistory.move( $_Target );

            this.$_Page = $_Page.appendTo( $_Target ).fadeIn();

            if (! arguments.length) {
                var Link_DOM = iHistory.last(true).sourceLink.$_DOM[0];
                var iListView = $.ListView.getInstance( Link_DOM.parentElement );

                if (iListView)
                    iListView.focus(Link_DOM);
                else
                    Link_DOM.scrollIntoView();
            }

            return this;
        },
        valueOf:    PageLink.prototype.valueOf
    });

    return InnerPage;

})(self, self.document, self.jQuery, PageLink);



var InnerHistory = (function (BOM, DOM, $, InnerPage) {

/* ---------- [object InnerHistory] ---------- */

    function InnerHistory() {
        var _This_ = $.extend(this, {
                length:       0,
                ownerApp:     arguments[0],
                root:         arguments[1],
                lastIndex:    -1
            });

        $(BOM).on('popstate',  function () {
            var iState = arguments[0].state;
            var _Index_ = (iState || { }).DOM_Index;
            var iHistory = _This_[_Index_];

            if (! iHistory)
                return  BOM.history.go(_This_[_Index_ - 1]  ?  -1  :  1);

            _This_.move(iState);
            iHistory.show().onReady();

            _This_.prevIndex = _This_.lastIndex;
            _This_.lastIndex = iState.DOM_Index;
        });
    }

    $.extend(InnerHistory.prototype, {
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        slice:        Array.prototype.slice,
        indexOf:      Array.prototype.indexOf,
        move:         function () {
            if ($.isPlainObject( arguments[0] ))
                var iState = arguments[0];
            else {
                var $_Target = arguments[0];
                $.ListView.findView(this.root, true);
            }
            var $_Page = ($_Target || this.root).children().detach();

            if ((! iState)  ||  ((iState.DOM_Index + 2) == this.length))
                this[this.length - 1].$_Page =
                    this[this.length - 1].$_Page  ||  $_Page;

            return $_Page;
        },
        write:        function () {
            this.prevIndex = this.lastIndex++ ;
            this.splice(this.lastIndex,  this.length);

            var iNew = new InnerPage(this.ownerApp,  arguments[0] || { });
            this.push(iNew);
            iNew.$_Page = (this.cache() || { }).$_Page;

            BOM.history.pushState(
                {DOM_Index:  this.lastIndex},
                iNew.title,
                iNew.URL
            );
            return iNew;
        },
        cache:        function () {
            var iNew = this[this.lastIndex];

            for (var i = 0;  i < this.lastIndex;  i++)
                if ((iNew.time - this[i].time)  >  (this.ownerApp.cache * 1000)) {
                    if (! this[i].sourceLink.action)  this[i].$_Page = null;
                } else if (
                    (! iNew.JSON)  &&
                    $.isEqual(iNew.sourceLink, this[i].sourceLink)
                )
                    return this[i];
        },
        last:         function () {
            var iPage = this[this.lastIndex] || { };
            return  arguments[0] ? iPage : iPage.valueOf();
        },
        prev:         function () {
            var iPage = this[this.prevIndex] || { };
            return  arguments[0] ? iPage : iPage.valueOf();
        },
        isForward:    function () {
            return (
                this.indexOf( arguments[0] )  >  this.indexOf( this.last(true) )
            );
        },
        mergeData:    function (iSource, Index) {
            var iPage = this.slice(Index,  (Index + 1) || undefined)[0];

            iPage.data = $.extend(
                iPage.data || { },
                (iSource instanceof $)  ?
                    $.paramJSON('?' + iSource.serialize())  :  iSource
            );
            return iSource;
        }
    });

    return InnerHistory;

})(self, self.document, self.jQuery, InnerPage);



var WebApp = (function (BOM, DOM, $, PageLink, InnerPage, InnerHistory) {

    function Data_Merge(iOld, iNew) {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift(true);

        if (iArgs.slice(-1)[0] instanceof Array)  iArgs.splice(1, 0, [ ]);

        return  $.extend.apply($, iArgs);
    }

    InnerHistory.prototype.getData = function () {
        var iData = $.map(this,  function (iPage) {
                var _Data_ = iPage.data || iPage.sourceLink.data;

                return  _Data_ && [_Data_];
            });
        return  (iData.length < 2)  ?
            (iData[0] || { })  :  Data_Merge.apply(null, iData);
    };

/* ---------->> WebApp Constructor <<---------- */

    function WebApp($_Root, API_Root, Cache_Second, URL_Change) {
        $.Observer.apply(this);

        $.extend(this, {
            domRoot:          $($_Root),
            apiRoot:          API_Root || '',
            cache:
                (Cache_Second || (Cache_Second == 0))  ?
                    Cache_Second  :  Infinity,
            urlChange:        URL_Change,
            history:          new InnerHistory(this, $_Root),
            loading:          false,
            innerTemplate:    { }
        });
    }

    WebApp.prototype = new $.Observer();
    WebApp.prototype.constructor = WebApp;

    var RE_Str_Var = /\{(.+?)\}/g;

    $.extend(WebApp.prototype, {
        makeURL:        function (iURL, iData, iArgs) {
            iURL = $.split(iURL, '?', 2);
            iData = $.extend(this.history.getData(),  iData || { });

            var iJSONP = ('&' + iURL[1]).match(/&([^=]+)=\?/);
            iJSONP = iJSONP && iJSONP[1];

            var URL_Param = $.param(
                    $.extend(
                        $.paramJSON('?'  +  iURL[1].replace(iJSONP + '=?',  '')),
                        iArgs || { }
                    )
                );
            iURL = [
                BOM.decodeURIComponent(iURL[0]).replace(RE_Str_Var,  function () {
                    return iData[arguments[1]];
                }),
                (! iJSONP)  ?  URL_Param  :  [
                    URL_Param,  URL_Param ? '&' : '',  iJSONP,  '=?'
                ].join('')
            ].join('?');

            if (! (
                iURL.match(/^(\w+:)?\/\/[\w\d]+/) ||
                $.fileName(iURL).match(/\.(htm|html|md|markdown)$/)
            ))
                iURL = this.apiRoot + iURL;

            return iURL;
        },
        getTemplate:    function (DOM_ID) {
            if (DOM_ID)
                return this.innerTemplate[DOM_ID].children().clone(true);

            var $_Link = $('body *[target="_self"][href^="#"]');

            for (var i = 0;  $_Link[i];  i++) {
                DOM_ID = $_Link[i].getAttribute('href').slice(1);

                if (this.innerTemplate[DOM_ID])  continue;

                this.innerTemplate[DOM_ID] =
                    $(DOM.getElementById(DOM_ID)).detach();
                $.ListView.findView(this.innerTemplate[DOM_ID], false);
            }

            return this;
        }
    });

    function Trig_Event() {
        var This_Page = this.history.last();

        return this.trigger(
            arguments[0], This_Page.HTML, This_Page.JSON, arguments[1]
        ).slice(-1)[0];
    }

/* ---------- Auto Navigation ---------- */

    $.extend(PageLink.prototype, {
        getTarget:    function () {
            return  this.target.match(/^_(self|blank)$/) ?
                this.ownApp.domRoot  :  $('[name="' + this.target + '"]');
        },
        prefetch:     function () {
            var iHTML = (this.href || '').split('?');

            if (
                (this.target == '_self')  &&
                ((iHTML[1] || '').indexOf('=') == -1)
            ) {
                var $_Prefetch = $('<link />', {
                        rel:     this.constructor.prefetchRel,
                        href:    this.href
                    });

                if (
                    this.method.match(/Get/i)  &&
                    (this.src  &&  (! this.src.match(RE_Str_Var)))  &&
                    $.isEmptyObject( this.$_DOM[0].dataset )
                )
                    $_Prefetch.add(
                        $('<link />', {
                            rel:     this.constructor.prefetchRel,
                            href:    this.getURL('src')
                        })
                    );

                $_Prefetch.appendTo(DOM.head);
            }
            return this;
        },
        loadData:        function (Data_Ready) {
            var $_Form = $(this.$_DOM).parents('form').eq(0);
            if ($_Form.length)
                this.ownApp.history.mergeData($_Form, -1);

            var iLink = this,  This_App = this.ownApp,
                API_URL = this.getURL('src');

            function AJAX_Ready(iData) {
                iData = Trig_Event.call(This_App, 'apiCall', [
                    {
                        method:    iLink.method,
                        URL:       API_URL || iLink.getURL('action'),
                        data:      iData
                    },
                    This_App.history.last().HTML,
                    This_App
                ]) || iData;

                if (typeof Data_Ready == 'function')
                    Data_Ready.call(iLink, iData);
                else
                    This_App.history.mergeData(iData, -1);
            }

            if (! API_URL)  return  AJAX_Ready.call(this, this.getData());

            switch (this.method) {
                case 'get':       $[this.method](API_URL, AJAX_Ready);    break;
                case 'post':      ;
                case 'put':       ;
                case 'delete':
                    $[this.method](API_URL, this.getArgs(), AJAX_Ready);
            }
        }
    });

    $.extend(InnerPage.prototype, {
        boot:    function (iRender) {
            var This_Page = this,
                $_Page = $('head link[target][href]'),
                $_API = $('head link[src]');

            this.ownerApp.getTemplate();

            if ( $_Page.length )
                this.ownerApp.one('pageReady',  function () {
                    return  arguments[2].loadLink(
                        $_Page.remove().attr(['target', 'href']),
                        null,
                        This_Page.sourceLink.getData()
                    );
                });
            if (! $_API.length)  return iRender.call(this);

            var iData = { },  Data_Ready = $_API.length;

            function API_Load(_Data_) {
                iData = Data_Merge(iData, _Data_);

                if (--Data_Ready > 0)  return;

                iRender.call(This_Page, iData);
                $_API.remove();
            }

            for (var i = 0;  i < $_API.length;  i++)
                (new PageLink(this.ownerApp, $_API[i])).loadData(API_Load);
        },
        load:    function (iLink, Page_Load) {
            var MarkDown_File = /\.(md|markdown)\??/i,
                This_Page = this,  This_App = this.ownerApp;

            if (iLink.href[0] == '#')
                return Page_Load.call(
                    this.show(This_App.getTemplate( iLink.href.slice(1) )).ownerApp
                );

            $.get(iLink.getURL('href'),  (! iLink.href.match(MarkDown_File)) ?
                function (iHTML) {
                    iHTML = (arguments[2] || '').responseText  ||  iHTML;

                    if (! (
                        iHTML.match(/<\s*(html|head|body)(\s|>)/i)  ||
                        iHTML.match(/<\s*(link|script)(\s|>)/i)
                    ))
                        return This_Page.show(iHTML).boot(Page_Load);

                    var $_Content = $(iHTML.children || iHTML),  $_Page = [ ];

                    for (var i = 0, j = 0;  $_Content[i];  i++)
                        switch ( $_Content[i].tagName.toLowerCase() ) {
                            case 'link':      {
                                if ($_Content[i].rel == 'stylesheet')
                                    $('<link rel="stylesheet" />')
                                        .attr('href', $_Content[i].href)
                                        .appendTo( DOM.head );
                                else if ($_Content[i].getAttribute('target'))
                                    DOM.head.appendChild( $_Content[i] );

                                break;
                            }
                            case 'script':    {
                                if ( $_Content[i].text.trim() )
                                    $.globalEval( $_Content[i].text );
                                break;
                            }
                            default:          $_Page[j++] = $_Content[i];
                        }

                    This_Page.show($_Page).boot(Page_Load);
                } :
                function (iMarkDown) {
                    iMarkDown = (arguments[2] || '').responseText  ||  iMarkDown;

                    if (typeof BOM.marked == 'function')
                        This_Page.show( BOM.marked(iMarkDown) ).$_Page
                            .find('a[href]').attr('target',  function () {
                                if (! (
                                    this.href.indexOf('#!') ||
                                    this.matches('a[rel*="nofollow"]')
                                )) {
                                    this.setAttribute('rel', 'nofollow');
                                    return arguments[1];
                                }

                                return  this.href.match(MarkDown_File) ?
                                    '_self' : '_top';
                            });
                    else
                        This_App.domRoot.text(iMarkDown);

                    Page_Load.call(This_App);
                }
            );
        }
    });

    $.extend(PageLink.prototype, {
        loadTemplate:    function () {
            var iReturn = Trig_Event.call(this.ownApp, 'pageLoad', [
                    this.ownApp.history.last(),
                    this.ownApp.history.prev()
                ]);
            if (iReturn === false)  return;

            this.ownApp.loading = true;

        /* ----- Load DOM  from  Cache ----- */
            var This_Page = this.ownApp.history.write(this);

            if (this.ownApp.cache && This_Page.$_Page)
                return This_Page.show().onReady();

        /* ----- Load DOM  from  Network ----- */
            var iData,  Need_HTML = (this.type == 'Inner');

            var Load_Stage = Need_HTML ? 2 : 1,  This_Link = this;

            function Page_Load() {
                if (arguments[0])  iData = arguments[0];

                if (--Load_Stage != 0)  return;

                This_Page.render(This_Link, iData).onReady();
            }

            this.loadData(Page_Load);

            if (Need_HTML)  This_Page.load(this, Page_Load);
        },
        loadPage:        function () {
            var iReturn = Trig_Event.call(this.ownApp, 'appExit', [
                    this.ownApp.history.last().HTML,
                    this.href,
                    this.getData()
                ]);
            if (iReturn === false)  return;

            this.ownApp.history.move();
            BOM.sessionStorage.EWA_Model = BOM.JSON.stringify(
                $.isPlainObject(iReturn) ? iReturn : this.getData()
            );
            BOM.location.href = this.href  +  '?'  +  $.param( this.getArgs() );
        }
    });

    $.extend(InnerPage.prototype,{
        render:      function (Source_Link, iData) {
            var This_App = this.ownerApp;

            iData = Data_Merge(Source_Link && Source_Link.getData(),  iData);

            var iReturn = Trig_Event.call(This_App, 'pageRender', [
                    This_App.history.last(),
                    This_App.history.prev(),
                    iData
                ]);
            this.data = iData = iReturn || iData;

            if (iReturn !== false) {
                var $_Render = This_App.domRoot;

                if (! (iData instanceof Array))
                    $_Render = $(DOM.body);
                else if (Source_Link  &&  (Source_Link.target != '_self'))
                    $_Render = Source_Link.getTarget().parent();

                $_Render.dataRender(iData);
            }

            return this;
        },
        findLink:    function (iPrefetch) {
            var $_Root = this.ownerApp.history.lastIndex ?
                    this.ownerApp.domRoot : $(DOM.body);

            var $_Link = $_Root.find('*[target]').not(
                    $.ListView.findView($_Root).find('*[target]')
                );

            for (var i = 0, iLink;  i < $_Link.length;  i++) {
                iLink = new PageLink(this.ownerApp, $_Link[i]);
                this.innerLink.push(iLink);
                if (iPrefetch)  iLink.prefetch();
            }
            return $_Link;
        },
        onReady:     function () {
            $('button[target]:hidden', DOM.body).remove();

            var This_App = this.ownerApp;

            PageLink.prefetchClear();

            This_App.loading = false;

            Trig_Event.call(This_App, 'pageReady', [
                This_App.history.last(),
                This_App.history.prev(),
                This_App
            ]);
            this.findLink(true);
            This_App.domRoot.focus();

            $(DOM.body).trigger({
                type:      'loading',
                detail:    1
            });

            return this;
        }
    });

/* ---------- Manual Navigation ---------- */

    WebApp.prototype.loadLink = function (iAttribute, iArgument, iData) {
        if (typeof iAttribute == 'string') {
            iAttribute = {
                target:    '_self',
                href:      iAttribute,
                src:       iArgument,
            };
            iArgument = iData;
            iData = arguments[3];
        }

        this.loading = false;
        (
            (iAttribute instanceof PageLink)  ?  iAttribute  :  (
                new PageLink(this, iAttribute, iArgument, iData)
            )
        ).$_DOM.click();

        return this;
    };

    function Hash_Path_Load() {
        var iHash = $.split(BOM.location.hash, '!', 2);

        if ((iHash[0] != '#')  ||  (! iHash[1]))  return;

        this.findLink();

        var $_Link = $('*[target="_self"][href="' + iHash[1] + '"]');

        if ($_Link[0])
            $_Link[0][
                ($_Link[0].tagName.toLowerCase() != 'form')  ?
                    'click'  :  'submit'
            ]();
        else
            this.ownerApp.loadLink(iHash[1]);

        return iHash[1];
    }

    WebApp.prototype.boot = function () {
        if (this.history.length)  throw 'This WebApp has been booted !';

        this.loading = true;

        var This_Link = new PageLink(this,  {target: ''},  null,  arguments[0]);

        var This_Page = this.history.write(This_Link, This_Link.getTarget()),
            This_App = this;

        $(DOM.body).on('submit',  'form:visible',  function () {
            if (This_App.loading)  return false;

            var iLink = $(this).data('EWA_PageLink') ||
                    (new PageLink(This_App, this));

            This_App.history.mergeData(iLink.$_DOM, -1).attr(
                'action',  iLink.getURL('action')
            );
        }).ajaxSubmit(function (iData) {

            var iReturn = Trig_Event.call(This_App, 'formSubmit', [
                    This_App.history.last().HTML,
                    arguments[2].url,
                    iData,
                    $(this).attr('href')
                ]);

            if ((iReturn !== false)  &&  this.target)
                This_App.loadLink(
                    $.extend(PageLink.getAttr( $(this) ),  {
                        action:    arguments[2].url
                    }),
                    null,
                    iReturn || iData
                );
        });

        if (! Hash_Path_Load.call(This_Page))
            This_Page.boot(function () {
                this.render(null, arguments[0]).onReady();
            });

        $(BOM).on('hashchange',  $.proxy(Hash_Path_Load, This_Page));

        return this;
    };

    return WebApp;

})(self, self.document, self.jQuery, PageLink, InnerPage, InnerHistory);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v2.6  (2016-07-27)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+,
//
//                   [ marked.js ]  (for MarkDown rendering)
//
//      [Usage]      A Light-weight WebApp Framework
//                   jQuery Compatible API.
//
//
//              (C)2015-2016    shiy2008@gmail.com
//



var EasyWebApp = (function (BOM, DOM, $, WebApp, PageLink) {

/* ---------->> jQuery Wrapper <<---------- */

    $.fn.WebApp = function () {
        if (! this[0])  return;

        var iWebApp = $(this[0]).data('_EWAI_');

        if (iWebApp instanceof WebApp)  return iWebApp;

        var iArgs = $.makeArray(arguments);

        var Init_Data = $.extend(
                $.parseJSON(BOM.sessionStorage.EWA_Model || '{ }'),
                $.paramJSON(),
                $.isPlainObject(iArgs[0])  &&  iArgs.shift()
            );
        var API_Root = (typeof iArgs[0] == 'string') && iArgs.shift();
        var Cache_Second = (typeof iArgs[0] == 'number') && iArgs.shift();
        var URL_Change = (typeof iArgs[0] == 'boolean') && iArgs[0];

        iWebApp = (new WebApp(
            this,  API_Root,  Cache_Second,  URL_Change
        )).boot(Init_Data);

        $(this[0]).data('_EWAI_', iWebApp).addClass('EWA_Container');

        return iWebApp;
    };

/* ---------- User Event Switcher ---------- */

    var No_Hook = $.makeSet('form', 'input', 'textarea', 'select');

    function Event_Filter() {
        var iTagName = this.tagName.toLowerCase(),
            iEvent = arguments.callee.caller.arguments[0];

        switch (iEvent.type) {
            case 'click':     ;
            case 'tap':       {
                if (iTagName == 'a') {
                    if (this.matches('a[rel*="nofollow"]'))  return true;

                    iEvent.preventDefault();
                }
                return  (iTagName in No_Hook);
            }
            case 'change':    return  (this !== iEvent.target);
        }
    }

    $(DOM).on(
        ($.browser.mobile ? 'tap' : 'click') + ' change',
        '*[target]',
        function () {
            if ( Event_Filter.call(this) )  return;

            var iLink = new PageLink($('.EWA_Container').WebApp(), this);

            switch (iLink.target) {
                case '_self':     {
                    if (iLink.href)  iLink.loadTemplate();
                    break;
                }
                case '_blank':    {
                    if (iLink.src)  iLink.loadData();
                    break;
                }
                case '_top':      {
                    if (iLink.href)  iLink.loadPage();
                    break;
                }
                default:          iLink.loadTemplate();
            }
        }
    );
})(self, self.document, self.jQuery, WebApp, PageLink);


});
