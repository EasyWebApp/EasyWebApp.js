//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v2.4  (2016-04-26)  Stable
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


(function (BOM, DOM, $) {

/* ---------- [object PageLink] ---------- */

    function PageLink(This_App, Link_DOM, iArgument, iData) {
        this.app = This_App;
        this.$_DOM = $.isPlainObject(Link_DOM) ?
            this.createDOM(Link_DOM, iArgument, iData)  :
            $(Link_DOM);
        this.$_DOM.data('EWA_PageLink', this);

        $.extend(this, arguments.callee.getAttr(this.$_DOM));

        switch (this.target) {
            case '_top':      this.type = 'Outer';  break;
            case '_blank':    this.type = 'Data';   break;
            case '_self':     ;
            default:          if (this.href)  this.type = 'Inner';
        }
        this.method = (this.method || 'Get').toLowerCase();
        this.data = { };
        this.href = this.href || this.app.history.last().HTML;
        this.href = this.getURL('href');

        var iFileName = $.fileName( this.href ).split('.');

        $.extend(this.data, {
            _File_Path_:    $.filePath( this.href ),
            _File_Name_:    iFileName[0],
            _Ext_Name_:     iFileName[1]
        });

        if ((this.href || '').indexOf('?')  >  -1)
            this.data = $.extend($.paramJSON(this.href), this.data);
    }

    PageLink.getAttr = function () {
        return arguments[0].attr([
            'target', 'title', 'alt', 'href', 'method', 'src', 'action'
        ]);
    };

    var Prefetch_Tag = $.browser.modern ? 'prefetch' : 'next',
        $_Body = $(DOM.body);

    PageLink.prefetchClear = function () {
        $('head link[rel="' + Prefetch_Tag + '"]').remove();
    };

    $.extend(PageLink.prototype, {
        createDOM:    function (iAttribute, iArgument, iData) {
            var _Argument_ = { };

            if ( $.isPlainObject(iArgument) )
                for (var iName in iArgument)
                    _Argument_['data-' + iName] = iArgument[iName];

            var $_Link = $('<button />', $.extend({
                    style:    'display: none',
                    rel:      'nofollow'
                }, iAttribute, _Argument_)).appendTo($_Body);

            if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                $_Link.data('EWA_Model', iData);

            return $_Link;
        },
        getData:      function () {
            var iData = this.$_DOM.data('EWA_Model');

            if (! iData) {
                iData = this.$_DOM.hasClass('ListView_Item') ?
                    this.$_DOM : this.$_DOM.parents('.ListView_Item');

                if ( iData[0] ) {
                    iData = $.ListView.getInstance(iData[0].parentNode);

                    iData = iData && iData.valueOf( this.$_DOM.index() );
                }
            }
            return  this.data = $.extend(iData || { },  this.data);
        },
        getArgs:      function () {
            var iData = $.extend(this.app.history.getData(), this.getData());

            return  $.map(this.$_DOM[0].dataset,  function (iName) {
                return  (iData[iName] !== undefined)  ?  iData[iName]  :  iName;
            });
        },
        getURL:       function (iKey) {
            if (! this[iKey])  return '';

            if ((iKey != 'href')  ||  (this[iKey][0] != '#')) {
                this[iKey] = this.app.makeURL(
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
            return {
                target:    this.target,
                title:     this.title,
                alt:       this.alt,
                href:      this.href,
                method:    this.method,
                src:       this.src,
                action:    this.action
            };
        }
    });

/* ---------- [object InnerPage] ---------- */

    function InnerPage(App_Instance, iLink) {
        $.extend(this, {
            ownerApp:         App_Instance,
            sourceLink:       iLink,
            title:            iLink.title || DOM.title,
            URL:              iLink.alt || BOM.location.href,
            HTML:             iLink.href || DOM.URL,
            method:           iLink.method,
            JSON:             iLink.src,
            time:             $.now(),
            innerLink:        [ ],
            innerTemplate:    [ ]
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
        valueOf:    function () {
            return {
                title:     this.title,
                URL:       this.URL,
                HTML:      this.HTML,
                method:    this.method,
                JSON:      this.JSON
            };
        }
    });

/* ---------- [object InnerHistory] ---------- */

    var $_BOM = $(BOM);

    function InnerHistory() {
        var _This_ = $.extend(this, {
                length:       0,
                ownerApp:     arguments[0],
                root:         arguments[1],
                lastIndex:    -1
            });

        $_BOM.on('popstate',  function () {
            var iState = arguments[0].state;
            var iHistory = _This_[ (iState || { }).DOM_Index ];

            if (! iHistory)  return;

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
        write:        function (iLink) {
            this.prevIndex = this.lastIndex++ ;
            this.splice(this.lastIndex,  this.length);

            iLink = iLink || { };

            var iNew = new InnerPage(this.ownerApp, iLink);
            this.push(iNew);

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
                if ((iNew.time - this[i].time) > 60000) {
                    if (! this[i].sourceLink.action)  this[i].$_Page = null;
                } else if (
                    (! (iNew.method + this[i].method).match(/Post|Put/i))  &&
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
        },
        getData:      function () {
            var iData = $.map(this,  function () {
                    return arguments[0].data;
                });
            return  (iData.length < 2)  ?
                (iData[0] || { })  :  $.extend.apply($, iData);
        },
    });

/* ---------->> WebApp Constructor <<---------- */

    function WebApp($_Root, API_Root, URL_Change) {
        $.extend(this, {
            domRoot:      $($_Root),
            apiRoot:      API_Root || '',
            urlChange:    URL_Change,
            history:      new InnerHistory(this, $_Root),
            loading:      false
        });
    }

    var RE_Str_Var = /\{(.+?)\}/g;

    WebApp.prototype.makeURL = function (iURL, iData, iArgs) {
        iURL = $.split(iURL, '?', 2);
        iData = $.extend(this.history.getData(),  iData || { });

        var iJSONP = ('&' + iURL[1]).match(/&([^=]+)=\?/);
        iJSONP = iJSONP && iJSONP[1];

        var URL_Param = $.param(
                $.extend(iArgs || { },  $.paramJSON(
                    '?'  +  iURL[1].replace(iJSONP + '=?',  '')
                ))
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
    };

/* ---------- Auto Navigation ---------- */

    $.extend(PageLink.prototype, {
        getTarget:    function () {
            return  this.target.match(/^_(self|blank)$/) ?
                this.app.domRoot  :  $('[name="' + this.target + '"]');
        },
        prefetch:     function () {
            if ((this.target == '_self')  &&  this.href) {
                var $_Prefetch = $('<link />', {
                        rel:     Prefetch_Tag,
                        href:    this.href
                    });

                if (
                    this.method.match(/Get/i)  &&
                    (this.src  &&  (! this.src.match(RE_Str_Var)))  &&
                    $.isEmptyObject( this.$_DOM[0].dataset )
                )
                    $_Prefetch.add(
                        $('<link />', {
                            rel:     Prefetch_Tag,
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
                this.app.history.mergeData($_Form, -1);

            var iLink = this,  This_App = this.app,
                API_URL = this.getURL('src');

            function AJAX_Ready(iData) {
                iData = This_App.domRoot.triggerHandler('apiCall', [
                    This_App,
                    {
                        method:    iLink.method,
                        URL:       API_URL || iLink.getURL('action'),
                        data:      iData
                    },
                    This_App.history.last().HTML
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

    function Original_Link() {
        return ($.inArray(
            'nofollow',  (this.getAttribute('rel') || '').split(/\s+/)
        ) > -1);
    }

    function Data_Merge(iOld, iNew) {
        var iArgs = [true, iOld, iNew];

        if (iNew instanceof Array)  iArgs.splice(1, 0, [ ]);

        return  $.extend.apply($, iArgs);
    }

    $.extend(InnerPage.prototype, {
        boot:    function (iRender) {
            var This_Page = this,
                $_Page = $('head link[target][href]'),
                $_API = $('head link[src]');

            if ( $_Page.length )
                this.ownerApp.domRoot.one('pageReady',  function () {
                    return  arguments[1].loadLink(
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
        getTemplate:    function (DOM_ID) {
            if (! this.innerTemplate[DOM_ID]) {
                this.innerTemplate[DOM_ID] = $('*[id="' + DOM_ID + '"]').remove();
                $.ListView.findView(this.innerTemplate[DOM_ID], false);
            }
            return this.innerTemplate[DOM_ID].children().clone(true);
        },
        load:    function (iLink, Page_Load) {
            var MarkDown_File = /\.(md|markdown)\??/i,
                This_Page = this,  This_App = this.ownerApp;

            if (iLink.href[0] == '#')
                return Page_Load.call(
                    this.show(this.getTemplate( iLink.href.slice(1) )).ownerApp
                );

            $.get(iLink.href,  (! iLink.href.match(MarkDown_File)) ?
                function (iHTML) {
                    if (typeof iHTML != 'string')  return;

                    var not_Fragment = iHTML.match(/<\s*(html|head|body)(\s|>)/i),
                        no_Link = (! iHTML.match(/<\s*link(\s|>)/i)),
                        iSelector = This_App.domRoot.selector;

                    if ((! not_Fragment)  &&  no_Link)
                        return This_Page.show(iHTML).boot(Page_Load);

                    $_Body.sandBox(iHTML,  (
                        ((iSelector && no_Link) ? iSelector : 'body > *')  +
                            ', head link[target]'
                    ),  function ($_Content) {
                        $_Content.filter('link').appendTo('head');

                        This_Page.show( $_Content.not('link') ).boot(Page_Load);

                        return false;
                    });
                } :
                function (iMarkDown) {
                    if (typeof BOM.marked == 'function')
                        This_Page.show( BOM.marked(iMarkDown) ).$_Page
                            .find('a[href]').attr('target',  function () {
                                if (! (
                                    this.href.indexOf('#!') ||
                                    Original_Link.call(this)
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
            var iReturn = this.app.domRoot.triggerHandler('pageLoad', [
                    this.app.history.last(),
                    this.app.history.prev()
                ]);
            if (iReturn === false)  return;

            this.app.loading = true;

            var $_Target = this.getTarget();
            var This_Page = this.app.history.write(this, $_Target);

        /* ----- Load DOM  from  Cache ----- */
            var iCache = this.app.history.cache();

            if (iCache)  return iCache.show().onReady();

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
            var iReturn = this.app.domRoot.triggerHandler('appExit', [
                    this.app.history.last().HTML,  this.href,  this.getData()
                ]);
            if (iReturn === false)  return;

            this.app.history.move();
            BOM.sessionStorage.EWA_Model = BOM.JSON.stringify(
                $.isPlainObject(iReturn) ? iReturn : this.getData()
            );
            BOM.location.href = this.href  +  '?'  +  $.param( this.getArgs() );
        }
    });

    function ArrayRender(iArray, ValueRender) {
        $.ListView(this,  function () {
            ValueRender.call(arguments[0], arguments[1]);
        }).clear().render( iArray );
    }

    function ObjectRender(iData) {
        var _Self_ = arguments.callee;

        if (iData instanceof Array)
            return  ArrayRender.call(this[0], iData, _Self_);

        this.value('name',  function (iName) {
            if (iData[iName] instanceof Array)
                ArrayRender.call(this, iData[iName], _Self_);
            else
                return iData[iName];
        });
    }

    $.extend(InnerPage.prototype,{
        render:      function (Source_Link, iData) {
            var This_App = this.ownerApp;

            /* ----- Data Stack Change ----- */
            iData = Data_Merge(Source_Link && Source_Link.getData(),  iData);

            var iReturn = This_App.domRoot.triggerHandler('pageRender', [
                    This_App.history.last(),
                    This_App.history.prev(),
                    iData
                ]);
            this.data = iData = iReturn || iData;

            if (iReturn === false)  return this;

            /* ----- View Init ----- */
            var $_List = This_App.domRoot;

            if (Source_Link  &&  (Source_Link.target != '_self'))
                $_List = Source_Link.getTarget().parent();
            $_List = $.ListView.findView($_List, true);


            /* ----- Data Render ----- */
            if (iData instanceof Array)
                ArrayRender.call($_List[0], iData, ObjectRender);
            else
                ObjectRender.call($_Body, iData);

            return this;
        },
        findLink:    function (iPrefetch) {
            var $_Link = (
                    this.ownerApp.history.lastIndex ?
                        this.ownerApp.domRoot : $_Body
                ).find('*[target]');

            for (var i = 0, iLink;  i < $_Link.length;  i++) {
                iLink = new PageLink(this.ownerApp, $_Link[i]);
                this.innerLink.push(iLink);
                if (iPrefetch)  iLink.prefetch();
            }
            return $_Link;
        },
        onReady:     function () {
            $_Body.find('button[target]:hidden').remove();

            var This_App = this.ownerApp;

            PageLink.prefetchClear();
            this.findLink(true);

            This_App.loading = false;

            This_App.domRoot.trigger('pageReady', [
                This_App,
                This_App.history.last(),
                This_App.history.prev()
            ]).focus();

            $_Body.trigger({
                type:      'loading',
                detail:    1
            });

            return this;
        }
    });

/* ---------- User Event Switcher ---------- */

    var No_Hook = $.makeSet('form', 'input', 'textarea', 'select');

    function Event_Filter() {
        var iTagName = this.tagName.toLowerCase(),
            iEvent = arguments.callee.caller.arguments[0];

        switch (iEvent.type) {
            case 'click':     ;
            case 'tap':       {
                if (iTagName == 'a') {
                    if ( Original_Link.call(this) )  return true;

                    iEvent.preventDefault();
                }
                return  (iTagName in No_Hook);
            }
            case 'change':    return  (this !== iEvent.target);
        }
    }

    $_Body.on(
        ($.browser.mobile ? 'tap' : 'click') + ' change',
        '*[target]',
        function () {
            if ( Event_Filter.call(this) )  return;

            var iLink = $(this).data('EWA_PageLink');

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

        $_Body.on('submit',  'form:visible',  function () {
            if (This_App.loading)  return false;

            var iLink = $(this).data('EWA_PageLink') ||
                    (new PageLink(This_App, this));

            This_App.history.mergeData(iLink.$_DOM, -1).attr(
                'action',  iLink.getURL('action')
            );
        }).ajaxSubmit(function (iData) {

            var iReturn = This_App.domRoot.triggerHandler('formSubmit', [
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

        $_BOM.on('hashchange',  $.proxy(Hash_Path_Load, This_Page));

        return this;
    };

/* ---------->> jQuery Wrapper <<---------- */

    $.fn.WebApp = function () {
        var iArgs = $.makeArray(arguments);

        var Init_Data = $.extend(
                $.parseJSON(BOM.sessionStorage.EWA_Model || '{ }'),
                $.paramJSON(),
                $.isPlainObject(iArgs[0])  &&  iArgs.shift()
            );
        var API_Root = (typeof iArgs[0] == 'string') && iArgs.shift();
        var URL_Change = (typeof iArgs[0] == 'boolean') && iArgs[0];

        (new WebApp(this, API_Root, URL_Change)).boot(Init_Data);

        return this.addClass('EWA_Container');
    };

    function RouterBack(iHTML, iJSON) {
        var Page_Match = (iHTML && iJSON)  ?  2  :  1,
            iArgs = $.makeArray( arguments ).slice(4);

        var iApp = (iArgs[0] instanceof WebApp)  &&  iArgs.shift();
        var This_Page = iArgs[0],  iData = iArgs[2];

        if (This_Page.HTML && This_Page.HTML.match(iHTML))
            Page_Match-- ;
        if (This_Page.JSON && This_Page.JSON.match(iJSON))
            Page_Match-- ;

        if (Page_Match === 0)
            iData = arguments[2].apply(this,  iApp ? [
                iApp, This_Page, iArgs[1], iData
            ] : [
                iData, This_Page, iArgs[1]
            ]) || iData;

        return iData;
    }

    $.fn.onPageRender = function () {
        var iArgs = $.makeArray(arguments);

        var iHTML = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iJSON = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();

        if ((iHTML || iJSON)  &&  (typeof iArgs[0] == 'function'))
            this.on('pageRender', $.proxy(
                RouterBack,  null,  iHTML,  iJSON,  iArgs[0]
            ));

        return this;
    };

    $.fn.onPageReady = function () {
        var iArgs = $.makeArray(arguments);

        var iHTML = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iJSON = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();

        if ((iHTML || iJSON)  &&  (typeof iArgs[0] == 'function'))
            this.on('pageReady', $.proxy(
                RouterBack,  null,  iHTML,  iJSON,  iArgs[0]
            ));

        return this;
    };

})(self, self.document, self.jQuery);