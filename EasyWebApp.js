//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]     v1.7  (2015-9-11)  Stable
//
//      [Based on]    iQuery  |  jQuery with jQuery+,
//
//                    [ marked.js ]  (for MarkDown rendering)
//
//      [Usage]       A Light-weight WebApp Framework
//                    jQuery Compatible API.
//
//
//              (C)2015    shiy2008@gmail.com
//


(function (BOM, DOM, $) {

/* ----------  History Wrapper  ---------- */
    function xHistory($_Root) {
        this.length = 0;
        this.root = $_Root;
        this.lastIndex = -1;

        var _This_ = this,  $_Window = $(BOM);

        $_Window.on('popstate',  function () {
            var iState = arguments[0].state;

            if ((! iState) || $.isEmptyObject(iState))
                return false;

            _This_.move(iState);
            _This_[iState.DOM_Index].$_Page.appendTo($_Root).fadeIn();

            $_Window.trigger('pageChange',  [iState.DOM_Index - _This_.lastIndex]);
            _This_.prevIndex = _This_.lastIndex;
            _This_.lastIndex = iState.DOM_Index;
        });
    }
    $.extend(xHistory.prototype, {
        splice:    Array.prototype.splice,
        push:      Array.prototype.push,
        slice:     Array.prototype.slice,
        move:      function (iState) {
            var $_Page = this.root.children().detach();

            if ((! iState)  ||  ((iState.DOM_Index + 2) == this.length))
                this[this.length - 1].$_Page = $_Page;
        },
        write:     function (iTitle, iURL, URL_HTML, URL_JSON, API_Method) {
            if (this.length)  this.move();

            this.prevIndex = this.lastIndex++ ;
            this.splice(this.lastIndex,  this.length);

            var iNew ={
                    title:     iTitle || DOM.title,
                    URL:       iURL || BOM.location.href,
                    HTML:      URL_HTML || DOM.URL,
                    JSON:      URL_JSON,
                    method:    API_Method || 'Get',
                    time:      $.now()
                };

            this.push(iNew);

            BOM.history.pushState(
                {DOM_Index:  this.lastIndex},
                iNew.title,
                iNew.URL
            );

            for (var i = 0;  i < this.lastIndex;  i++)
                if (
                    ((iNew.time - this[i].time) < 60000)  &&
                    (! (iNew.method + this[i].method).match(/Post|Put/i))  &&
                    (iNew.title == this[i].title)  &&
                    (iNew.URL == this[i].URL)  &&
                    (iNew.HTML == this[i].HTML)  &&
                    (iNew.JSON == this[i].JSON)
                )
                    return  this[i].$_Page;
        }
    });

/* ---------- Data Stack ---------- */
    function DataStack() {
        this.history = arguments[0];

        var iStack = this.stack = [ ];

        $(BOM).on('pageChange',  function () {
            iStack.length += arguments[1];
        });
    }
    $.extend(DataStack.prototype, {
        pushStack:    function (iData) {
            if (this.stack.length < this.history.length)
                this.stack.push(null);

            var Old_Sum = this.stack.length - 1 - this.history.lastIndex;
            if (Old_Sum > 0)  this.stack.length -= Old_Sum;

            this.stack.push(iData);
            return iData;
        },
        value:        function (iName, Need_Array) {
            for (var i = this.history.lastIndex + 1, iObject, iData;  i > -1;  i--) {
                iObject = this.stack[i];
                if (! iObject)  continue;

                if (Need_Array && (iObject instanceof Array))
                    return iObject;

                iData = iObject[iName];
                if (Need_Array) {
                    if (iData instanceof Array)
                        return iData;
                } else if ( $.isData(iData) )
                    return iData;
            }
        },
        flush:        function () {
            var _Data_ = arguments[0].serializeArray(),  iData = { };

            for (var i = 0;  i < _Data_.length;  i++)
                iData[_Data_[i].name] = _Data_[i].value;

            _Data_ = this.stack;
            if (! _Data_[_Data_.length - 1])
                _Data_[_Data_.length - 1] = { };
            $.extend(_Data_[_Data_.length - 1],  iData);

            return arguments[0];
        }
    });

/* ---------- WebApp Constructor ---------- */
    function WebApp($_Root, Init_Data, API_Root, URL_Change) {
        if (! ($_Root instanceof $))
            $_Root = $($_Root);

        var Split_Index = API_Root  &&  (API_Root.match(/(\w+:)?\/\//) || [ ]).index;
        API_Root = Split_Index ? [
            API_Root.slice(Split_Index),
            API_Root.slice(0, Split_Index)
        ] : [API_Root];

        $.extend(this, {
            domRoot:      $_Root,
            apiRoot:      API_Root[0] || '',
            urlChange:    URL_Change,
            history:      new xHistory($_Root),
            loading:      false,
            proxy:        API_Root[1] || ''
        });
        this.dataStack = new DataStack(this.history);
        this.dataStack.pushStack(Init_Data);
    };

    /* ----- Manual Navigation ----- */
    var $_Body = $(DOM.body);

    function Proxy_Trigger(iType, iAttribute, iArgument) {
        if (typeof iAttribute == 'string')
            iAttribute = (iType == '_blank') ? {
                src:    iAttribute
            } : {
                href:    iAttribute
            }
        else if ( $.isPlainObject(iAttribute.src) ) {
            var iJSON = iAttribute.src;
            delete iAttribute.src;
        }

        var $_Trigger = $('<button />', $.extend({
                target:    iType,
                style:     'display: none',
                rel:       'nofollow'
            }, iAttribute));

        if ( $.isPlainObject(iArgument) ) {
            for (var iName in iArgument) {
                iArgument['data-' + iName] = iArgument[iName];
                delete iArgument[iName];
            }
            $_Trigger.attr(iArgument);
        }
        if (iJSON)  $_Trigger.data('EWA_Model', iJSON);

        this.loading = false;
        $_Trigger.appendTo($_Body).click();

        return this;
    }

    var _Concat_ = Array.prototype.concat;

    $.extend(WebApp.prototype, {
        loadTemplate:    function () {
            return  Proxy_Trigger.apply(this,  _Concat_.apply(['_self'], arguments));
        },
        loadJSON:        function () {
            return  Proxy_Trigger.apply(this,  _Concat_.apply(['_blank'], arguments));
        },
        loadPage:        function () {
            return  Proxy_Trigger.apply(this,  _Concat_.apply(['_top'], arguments));
        }
    });

    /* ----- Auto Navigation ----- */
    function URL_Args(iLink) {
        var This_App = this,  iData = $(iLink).data('EWA_Model');

        return  $.map(iLink.dataset,  function (iName) {
            var _Arg_ = iData[iName] || This_App.dataStack.value(iName);

            return  (_Arg_ !== undefined)  ?  _Arg_  :  iName;
        });
    }
    var RE_Str_Var = /\{(.+?)\}/g;

    function URL_Merge(iURL, $_Link) {
        iURL = $.split(iURL, '?', 2);
        $_Link = $($_Link);

        var This_App = this,
            iMethod = ($_Link.attr('method') || 'Get').toLowerCase(),
            iData = $_Link.data('EWA_Model') || { };

        iURL = [
            BOM.decodeURIComponent(iURL[0]).replace(RE_Str_Var,  function () {
                return  iData[arguments[1]] || This_App.dataStack.value(arguments[1]);
            }),
            $.param($.extend(
                $.paramJSON(iURL[1]),
                iMethod.match(/get|delete/)  &&  URL_Args.call(this, $_Link[0])
            ))
        ].join('?');

        iURL = (
            iURL.match(/^(\w+:)?\/\/[\w\d]+/) ? '' : this.apiRoot
        ) + iURL;

        return  this.proxy + (
            this.proxy ? BOM.encodeURIComponent(iURL) : iURL
        );
    }

    function $_List_Value(iValue) {
        var iLimit = parseInt( this.attr('max') )  ||  Infinity;
        iLimit = (iValue.length > iLimit) ? iLimit : iValue.length;

        var $_Template = this.children().detach().eq(0);

        for (var i = 0, $_Clone;  i < iLimit;  i++) {
            $_Clone = $_Template.clone(true).appendTo(this);

            $_Clone.data('EWA_Model', iValue[i])
                .find('*').add($_Clone)
                .filter('*[name]').value(function () {
                    return iValue[i][arguments[0]];
                });
        }
    }

    var Prefetch_Tag = $.browser.modern ? 'prefetch' : 'next';

    function Page_Render($_Source, iData) {
        /* ----- HTML Prefetch ----- */
        $('head link[rel="' + Prefetch_Tag + '"]').remove();

        var This_App = this;

        (this.history.lastIndex ? this.domRoot : $_Body).find('*[target][href]')
            .each(function () {
                var iPage = $(this).attr(['target', 'href', 'method', 'src']);

                if ((iPage.target != '_self')  ||  (! iPage.href))
                    return;

                var $_Prefetch = $('<link />', {
                        rel:     Prefetch_Tag,
                        href:    iPage.href
                    });

                if (
                    ((! iPage.method)  ||  (iPage.method == 'GET'))  &&
                    (iPage.src  &&  (! iPage.src.match(RE_Str_Var)))  &&
                    $.isEmptyObject(this.dataset)
                )
                    $_Prefetch.add(
                        $('<link />', {
                            rel:     Prefetch_Tag,
                            href:    URL_Merge.call(This_App, iPage.src, this)
                        })
                    );

                $_Prefetch.appendTo(DOM.head);
            });

        /* ----- Data Stack Change ----- */
        iData = $.extend(true,  $_Source && $_Source.data('EWA_Model'),  iData);

        var iReturn = this.domRoot.triggerHandler('pageRender', [
                this.history[this.history.lastIndex],
                this.history[this.history.prevIndex],
                iData
            ]);
        iData = this.dataStack.pushStack(iReturn || iData);

        if (iReturn === false)  return;

        /* ----- Data Render ----- */
        var This_App = this,
            $_List = this.domRoot.find('ul, ol, dl, tbody, *[multiple]').not('input');

        if (iData instanceof Array)
            $_List_Value.call($_List, iData);
        else
            $_Body.find('*[name]').value(function (iName) {
                var $_This = $(this);
                var iValue = This_App.dataStack.value(iName, $_This.is($_List));

                if (iValue instanceof Array)
                    $_List_Value.call($_This, iValue);
                else if ( $.isPlainObject(iValue) )
                    $_This.data('EWA_Model', iValue).value(iValue);
                else
                    return iValue;
            });
    };

    function Page_Ready() {
        $_Body.find('button[target]:hidden').remove();

        this.loading = false;
        this.domRoot.trigger('pageReady', [
            this,  this.history[this.history.lastIndex],  this.history[this.history.prevIndex]
        ]);

        return this;
    }

    function API_Call($_This, Data_Ready) {
        var API_URL = URL_Merge.call(this,  $_This.attr('src'),  $_This[0]),
            This_App = this;

        function AJAX_Ready() {
            Data_Ready([
                This_App,
                This_App.history[This_App.history.lastIndex].HTML,
                This_App.proxy  ?
                    BOM.decodeURIComponent( API_URL.slice(This_App.proxy.length) )  :
                    API_URL,
                arguments[0]
            ]);
        }
        var iMethod = ($_This.attr('method') || 'Get').toLowerCase();

        switch (iMethod) {
            case 'get':       ;
            case 'delete':
                $[iMethod](API_URL, AJAX_Ready);    break;
            case 'post':      ;
            case 'put':
                $[iMethod](
                    API_URL,  URL_Args.call(this, $_This[0]),  AJAX_Ready
                );
        }
    }
    var Response_Event = ($.browser.mobile ? 'tap' : 'click') + ' change';

    function Event_Filter() {
        var iTagName = this.tagName.toLowerCase(),
            iEvent = arguments.callee.caller.arguments[0];

        switch (iEvent.type) {
            case 'click':     ;
            case 'tap':       return  iTagName.match(/form|input|textarea|select/);
            case 'change':    return  (this !== iEvent.target);
        }
        if (iTagName != 'a')  iEvent.preventDefault();
            
        return This_App.loading;
    }

    function User_Listener() {
        var This_App = this;

        $_Body.on(Response_Event,  '[target="_self"][href]',  function () {

            if ( Event_Filter.call(this) )  return;

            var $_This = $(this);
            var iPage = $_This.attr(['title', 'href', 'method', 'src']);

            This_App.loading = true;

        /* ----- Load DOM  from  Cache ----- */
            var $_Cached = This_App.history.write(
                    iPage.title,  null,  iPage.href,  iPage.src,  iPage.method
                );
            if ($_Cached) {
                $_Cached.appendTo(This_App.domRoot).fadeIn();
                return Page_Ready.call(This_App);
            }

        /* ----- Load DOM  from  Network ----- */
            var iData,  Load_Stage = iPage.src ? 2 : 1;

            function Page_Load() {
                iData = (arguments[0] instanceof Array)  &&  arguments[0][3];

                if (--Load_Stage != 0)  return;

                Page_Render.call(This_App, $_This, iData);
                Page_Ready.call(This_App);
            }
            // --- Load Data from API --- //
            if (iPage.src)
                API_Call.call(This_App, $_This, Page_Load);

            // --- Load DOM from HTML|MarkDown --- //
            var MarkDown_File = /\.(md|markdown)$/i;

            if (! iPage.href.match(MarkDown_File)) {
                This_App.domRoot.load(
                    iPage.href + (This_App.domRoot.selector ? (' ' + This_App.domRoot.selector) : ''),
                    Page_Load
                );
                return;
            }
            $.get(iPage.href,  function (iMarkDown) {
                if (BOM.marked)
                    $( BOM.marked(iMarkDown) )
                        .appendTo( This_App.domRoot.empty() ).fadeIn()
                        .find('a[href]').each(function () {
                            this.setAttribute(
                                'target',  this.href.match(MarkDown_File) ? '_self' : '_top'
                            );
                        });
                else
                    This_App.domRoot.text(iMarkDown);

                Page_Load.call(This_App.domRoot[0], iMarkDown);
            });
        }).on(Response_Event,  '[target="_blank"][src]',  function () {

            if ( Event_Filter.call(this) )  return;

            var $_This = $(this);
            var $_Form = $_This.parents('form').eq(0);

            if ($_Form.length)  This_App.dataStack.flush($_Form);

            API_Call.call(This_App,  $_This,  function () {
                $_This.trigger('apiCall', arguments[0]);
            });
        }).on(Response_Event,  '[target="_top"][href]',  function () {

            if ( Event_Filter.call(this) )  return;

            var $_This = $(this);
            var toURL = $_This.attr('href'),  iData = $_This.data('EWA_Model');

            var iReturn = This_App.domRoot.triggerHandler('appExit', [
                    This_App.history[This_App.history.lastIndex].HTML,
                    toURL,
                    iData
                ]);

            if (iReturn === false)  return;

            This_App.history.move();
            BOM.sessionStorage.EWA_Model = $.isPlainObject(iReturn) ? iReturn : iData;
            BOM.location.href = toURL  +  '?'  +  $.param( URL_Args.call(This_App, this) );
        });

        $_Body.on('submit',  'form[target]',  function () {

            if (This_App.loading)  return false;

            var $_Form = This_App.dataStack.flush( $(this) );

            $_Form.attr('action',  function () {

                return  URL_Merge.call(This_App, arguments[1], this);

            }).ajaxSubmit(function (iData) {
                var iAttr = $_Form.attr(['action', 'title', 'href', 'method', 'src']);

                iData = This_App.domRoot.triggerHandler('formSubmit', [
                    This_App.history[This_App.history.lastIndex].HTML,
                    iAttr.action,
                    iData,
                    iAttr.href
                ]) || iData;

                if (iData === false)  return;

                iData = {src:  iAttr.src || iData};

                switch (this.target) {
                    case '_top':      return  This_App.loadPage(iAttr.href);
                    case '_blank':    return  This_App.loadJSON(iData);
                    case '_self':     This_App.loadTemplate( $.extend(iAttr, iData) );
                }
            }).trigger('submit');

            return false;
        });
    }

    function FrontPage_Init() {
        Page_Render.call(this, null, arguments[0]);

        /* ----- URL Hash Navigation ----- */
        var iHash = BOM.location.hash.slice(1);

        if (iHash) {
            var iHash_RE = RegExp('\\/?' + iHash + '\\.\\w+$', 'i');

            $_Body.find('*[target][href]').each(function () {
                var $_This = $(this);

                if ( $_This.attr('href').match(iHash_RE) ) {
                    $_This[(this.tagName.toLowerCase() != 'form') ? 'click' : 'submit']();
                    return false;
                }
            });
        }
        return Page_Ready.call(this);
    }

    WebApp.prototype.boot = function () {
        if (this.history.length)  throw 'This WebApp has been booted !';

        this.loading = true;
        this.history.write();
        User_Listener.call(this);

        var $_Link = $('head link[src]');

        //  No Content Data in First Page
        if (! $_Link.length)
            return FrontPage_Init.call(this);

        //  Loading Content Data before First Page rendering
        var This_App = this,  iData = { },  Data_Ready = $_Link.length;

        for (var i = 0;  i < $_Link.length;  i++)
            API_Call.call(This_App,  $($_Link[i]),  function () {
                var _Data_ = This_App.domRoot.triggerHandler('apiCall', arguments[0]);

                if (_Data_)  $.extend(iData, _Data_);

                if (--Data_Ready == 0)  FrontPage_Init.call(This_App, iData);
            });

        return this;
    };

/* ----------  jQuery Wrapper  ---------- */
    $.fn.WebApp = function () {
        var iArgs = $.makeArray(arguments);

        var Init_Data = $.extend(
                BOM.sessionStorage.EWA_Model,
                $.paramJSON(),
                $.isPlainObject(iArgs[0])  &&  iArgs.shift()
            );
        var API_Root = (typeof iArgs[0] == 'string') && iArgs.shift();
        var URL_Change = (typeof iArgs[0] == 'boolean') && iArgs[0];

        (new WebApp(
            this,  Init_Data,  API_Root,  URL_Change
        )).boot();

        return this;
    };

    $.fn.onPageRender = function () {
        var iArgs = $.makeArray(arguments);

        var iHTML = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iJSON = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iCallback = (typeof iArgs[0] == 'function') && iArgs[0];

        if (iCallback  &&  (iHTML || iJSON))
            this.on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {
                var Page_Match = (iHTML && iJSON) ? 2 : 1;

                if (This_Page.HTML && This_Page.HTML.match(iHTML))
                    Page_Match-- ;
                if (This_Page.JSON && This_Page.JSON.match(iJSON))
                    Page_Match-- ;

                if (Page_Match === 0)
                    return  iCallback.call(this, iData, Prev_Page);
            });

        return this;
    };

    $.fn.onPageReady = function () {
        var iArgs = $.makeArray(arguments);

        var iHTML = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iJSON = $.type(iArgs[0]).match(/String|RegExp/i) && iArgs.shift();
        var iCallback = (typeof iArgs[0] == 'function') && iArgs[0];

        if (iCallback  &&  (iHTML || iJSON))
            this.on('pageReady',  function (iEvent, iApp, This_Page, Prev_Page) {
                var Page_Match = (iHTML && iJSON) ? 2 : 1;

                if (This_Page.HTML && This_Page.HTML.match(iHTML))
                    Page_Match-- ;
                if (This_Page.JSON && This_Page.JSON.match(iJSON))
                    Page_Match-- ;

                if (Page_Match === 0)
                    iCallback.call(this, iApp, Prev_Page);
            });

        return this;
    };

})(self, self.document, self.jQuery);