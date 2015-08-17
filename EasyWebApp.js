//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]     v1.5  (2015-8-17)  Stable
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
            var $_Page = this.root.children().not('[rel="nofollow"]:hidden').detach();

            if ((! iState)  ||  ((iState.DOM_Index + 2) == this.length))
                this[this.length - 1].$_Page = $_Page;
        },
        write:     function (iTitle, iURL, URL_HTML, URL_JSON) {
            if (this.length)  this.move();

            this.splice(++this.lastIndex,  this.length);

            var iNew ={
                    title:    iTitle || DOM.title,
                    URL:      iURL || BOM.location.href,
                    HTML:     URL_HTML || DOM.URL,
                    JSON:     URL_JSON,
                    time:     $.now()
                };

            this.push(iNew);

            BOM.history.pushState(
                {DOM_Index:  this.lastIndex},
                iNew.title,
                iNew.URL
            );

            for (var i = 0;  i < this.lastIndex;  i++)
                if (
                    ((iNew.time - this[i].time) < 60000) &&
                    (iNew.title == this[i].title) &&
                    (iNew.URL == this[i].URL) &&
                    (iNew.HTML == this[i].HTML) &&
                    (iNew.JSON == this[i].JSON)
                )
                    return  this[i].$_Page;
        }
    });

/* ---------- WebApp Constructor ---------- */
    function WebApp($_Root, Init_Data, API_Root, URL_Change) {
        if (! ($_Root instanceof $))
            $_Root = $($_Root);

        var Split_Index = API_Root  &&  (API_Root.match(/(\w+:)?\/\//) || [ ]).index;
        if (Split_Index) {
            var Proxy_URL = API_Root.slice(0, Split_Index);
            API_Root = Proxy_URL + BOM.encodeURIComponent( API_Root.slice(Split_Index) );
        }

        $.extend(this, {
            domRoot:      $_Root,
            dataStack:    [ Init_Data ],
            apiRoot:      API_Root || '',
            urlChange:    URL_Change,
            history:      new xHistory($_Root),
            loading:      false,
            proxy:        Proxy_URL
        });

        var Data_Stack = this.dataStack;

        $(BOM).on('pageChange',  function () {
            Data_Stack.length += arguments[1];
        });
    };

    /* ----- Manual Navigation ----- */
    function Proxy_Trigger(iType, iTitle, iHTML, iJSON) {
        var $_Trigger = $('<button />', {
                target:    iType,
                style:     'display: none',
                rel:       'nofollow'
            });

        if (iTitle)  $_Trigger.attr('title', iTitle);
        if (iHTML)  $_Trigger.attr('href', iHTML);

        if (typeof iJSON == 'string')
            $_Trigger.attr('src', iJSON);
        else
            $_Trigger.data('json', iJSON);

        $_Trigger.appendTo(this.domRoot).click().remove();

        return this;
    }

    $.extend(WebApp.prototype, {
        loadTemplate:    function () {
            return  Proxy_Trigger.apply(
                    this,  Array.prototype.concat.apply(['_self'], arguments)
                );
        },
        loadJSON:        function () {
            return  Proxy_Trigger.call(this, '_blank', null, null, arguments[0]);
        },
        loadPage:        function () {
            return  Proxy_Trigger.apply(this, '_top', null, arguments[0]);
        }
    });

    /* ----- Auto Navigation ----- */
    function Data_Value(iName, Need_Array) {
        for (var i = this.history.lastIndex + 1, iObject, iData;  i > -1;  i--) {
            iObject = this.dataStack[i];
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
    }

    function URL_Args(DOM_Link) {
        var iArgs = { };

        for (var iName in DOM_Link.dataset)
            iArgs[iName] = Data_Value.call(this, DOM_Link.dataset[iName]);

        return iArgs;
    }

    var RE_Str_Var = /\{([^\}]+)\}/g;

    function URL_Merge(iURL, iArgs, iData) {
        var This_App = this;

        iURL = this.apiRoot + (
            this.proxy ? BOM.encodeURIComponent(iURL) : iURL
        );
        iURL = iURL.split('?');

        iURL[0] = BOM.decodeURIComponent(iURL[0]).replace(
            RE_Str_Var,
            function () {
                return  iData[arguments[1]] || Data_Value.call(This_App, arguments[1]);
            }
        );
        iURL[1] = $.param($.extend(
            $.paramJSON( iURL.slice(1).join('?') ),  iArgs
        ));

        return iURL.join('?');
    }

    function $_List_Value(iValue) {
        var iLimit = parseInt( this.attr('max') )  ||  Infinity;
        iLimit = (iValue.length > iLimit) ? iLimit : iValue.length;

        var $_Template = this.children().detach().eq(0);

        for (var i = 0, $_Clone;  i < iLimit;  i++) {
            $_Clone = $_Template.clone(true).appendTo(this);

            $_Clone.data('json', iValue[i])
                .find('*').add($_Clone)
                .filter('*[name]').value(function () {
                    return iValue[i][arguments[0]];
                });
        }
    }

    var $_Body = $(DOM.body),
        Prefetch_Tag = $.browser.modern ? 'prefetch' : 'next';

    function Page_Render(iURL, iData) {
        /* ----- HTML Prefetch ----- */
        $('head link[rel="' + Prefetch_Tag + '"]').remove();

        var This_App = this;

        (this.history.lastIndex ? this.domRoot : $_Body).find('*[target][href]')
            .each(function () {
                var iPage = $(this).attr(['target', 'href', 'method', 'src']);

                if (
                    (iPage.target != '_self')  ||
                    (! iPage.href)
                )
                    return;

                var $_Prefetch = $('<link />', {
                        rel:     Prefetch_Tag,
                        href:    iPage.href
                    });

                if (
                    ((! iPage.method)  ||  (iPage.method == 'GET'))  &&
                    (!  (iPage.src || '').match(RE_Str_Var))  &&
                    $.isEmptyObject(this.dataset)
                )
                    $_Prefetch.add(
                        $('<link />', {
                            rel:     Prefetch_Tag,
                            href:    URL_Merge.call(This_App, iPage.src)
                        })
                    );

                $_Prefetch.appendTo(DOM.head);
            });

        /* ----- Data Stack Change ----- */
        if (this.dataStack.length < this.history.length)
            this.dataStack.push(null);

        var Old_Sum = this.dataStack.length - 1 - this.history.lastIndex;
        if (Old_Sum > 0)  this.dataStack.length -= Old_Sum;

        iData = this.domRoot.triggerHandler('pageRender', [
            this.history[this.history.lastIndex],  this.history[this.history.prevIndex],  iData || { }
        ]) || iData;

        this.dataStack.push(iData);

        /* ----- Data Render ----- */
        var This_App = this,
            $_List = this.domRoot.find('ul, ol, dl, tbody, *[multiple]').not('input');

        if (iData instanceof Array)
            $_List_Value.call($_List, iData);
        else
            $_Body.find('*[name]').value(function (iName) {
                var $_This = $(this);
                var iValue = Data_Value.call(This_App,  iName,  $_This.is($_List));

                if (iValue instanceof Array)
                    $_List_Value.call($_This, iValue);
                else if ( $.isPlainObject(iValue) )
                    $_This.data('json', iValue).value(iValue);
                else
                    return iValue;
            });
    };

    var _Method_ = {
            _self:     'Template',
            _top:      'Page',
            _blank:    'JSON'
        };

    function Input_Flush($_Form) {
        var _Data_ = $_Form.serializeArray(),  iData = { };

        for (var i = 0;  i < _Data_.length;  i++)
            iData[_Data_[i].name] = _Data_[i].value;

        _Data_ = this.dataStack;
        if (! _Data_[_Data_.length - 1])
            _Data_[_Data_.length - 1] = { };
        $.extend(_Data_[_Data_.length - 1],  iData);
    }

    function User_Listener() {
        var This_App = this;

        $_Body.on('submit',  'form[target][href]',  function (iEvent) {
            if (This_App.loading)  return false;

            iEvent.preventDefault();
            iEvent.stopPropagation();

            var $_Form = $(this);
            var iTarget = $_Form.attr('target');

            Input_Flush.call(This_App, $_Form);

            $_Form.attr('action',  function () {
                return  URL_Merge.call(
                        This_App,  arguments[1],  URL_Args.call(This_App, this)
                    );
            }).post(function (iData) {
                var iAttr = $_Form.attr(['action', 'title', 'href', 'src']);

                iData = This_App.domRoot.triggerHandler('formSubmit', [
                    This_App.history[This_App.history.lastIndex].HTML,
                    iAttr.action,
                    iData,
                    iAttr.href,
                    iAttr.src
                ]);
                if (iData === false)  return;

                if (iAttr.src)
                    $.extend(This_App.dataStack[This_App.history.lastIndex + 1], iData);

                This_App['load' + _Method_[iTarget]](
                    iAttr.title,  iAttr.href,  iAttr.src || iData
                );
            }).trigger('submit');
        }).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_self"][href]',
            function () {
                if (
                    This_App.loading ||
                    ((this.tagName.toLowerCase() == 'form')  &&  (! arguments[1]))
                )
                    return;

                var $_This = $(this);
                var iData = $_This.data('json'),
                    iPage = $_This.attr(['title', 'href', 'src']);

                This_App.loading = true;

            /* ----- Load DOM  form  Cache ----- */
                var $_Cached = This_App.history.write(
                        iPage.title,  null,  iPage.href,  iPage.src
                    );
                if ($_Cached) {
                    $_Cached.appendTo(This_App.domRoot).fadeIn();
                    This_App.loading = false;
                    This_App.domRoot.trigger('pageReady', [
                        This_App,
                        This_App.history[This_App.history.lastIndex],
                        This_App.history[This_App.history.prevIndex]
                    ]);
                    return false;
                }

            /* ----- Load DOM  from  Network ----- */
                var DOM_Ready = iPage.src ? 2 : 1;

                function Page_Ready(_Data_) {
                    if (
                        $.isPlainObject(_Data_)  ||
                        (_Data_ instanceof Array)  ||
                        ($.trim(_Data_)[0] != '<')
                    )
                        iData = _Data_;

                    if (--DOM_Ready != 0)  return;

                    Page_Render.call(This_App, iPage.href, iData);
                    This_App.loading = false;
                    This_App.domRoot.trigger('pageReady', [
                        This_App,
                        This_App.history[This_App.history.lastIndex],
                        This_App.history[This_App.history.prevIndex]
                    ]);
                }
                // --- Load Data from API --- //
                if (iPage.src)
                    $.getJSON(
                        URL_Merge.call(This_App,  iPage.src,  URL_Args.call(This_App, this),  iData),
                        Page_Ready
                    );

                // --- Load DOM from HTML|MarkDown --- //
                var MarkDown_File = /\.(md|markdown)$/i;

                if (! iPage.href.match(MarkDown_File))
                    This_App.domRoot.load(
                        iPage.href + (This_App.domRoot.selector ? (' ' + This_App.domRoot.selector) : ''),
                        Page_Ready
                    );
                else
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

                        Page_Ready.call(This_App.domRoot[0], iMarkDown);
                    });

                return false;
            }
        ).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_blank"][src]',
            function () {
                if (This_App.loading)  return false;

                var $_This = $(this);
                var $_Form = $_This.parents('form').eq(0),
                    iData = $_This.data('json'),
                    iJSON = $_This.attr('src'),
                    iMethod = ($_This.attr('method') || 'Get').toLowerCase();

                if ($_Form.length)  Input_Flush.call(This_App, $_Form);

                var API_URL = URL_Merge.call(
                        This_App,
                        iJSON,
                        iMethod.match(/get|delete/)  &&  URL_Args.call(This_App, this, true),
                        iData
                    );
                function Data_Ready() {
                    $_This.trigger('apiCall', [
                        This_App,
                        This_App.history[This_App.history.lastIndex].HTML,
                        This_App.proxy  ?  BOM.decodeURI( API_URL.slice(This_App.proxy.length) )  :  API_URL,
                        arguments[0]
                    ]);
                }
                switch (iMethod) {
                    case 'get':       ;
                    case 'delete':
                        $[iMethod](API_URL, Data_Ready);    break;
                    case 'post':      ;
                    case 'put':
                        $[iMethod](
                            API_URL,  URL_Args.call(This_App, this),  Data_Ready
                        );
                }

                return false;
            }
        ).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_top"][href]',
            function () {
                if (
                    This_App.loading ||
                    ((this.tagName.toLowerCase() == 'form')  &&  (! arguments[1]))
                )
                    return;

                var $_This = $(this);
                var toURL = $_This.attr('href'),
                    iData = $_This.data('json');

                var iReturn = This_App.domRoot.triggerHandler('appExit', [
                        This_App.history[This_App.history.lastIndex].HTML,
                        toURL,
                        $_This.data('json')
                    ]);

                if (iReturn !== false) {
                    var iArgs = URL_Args.call(This_App, this);

                    if ( $.isPlainObject(iReturn) )  $.extend(iArgs, iReturn);

                    This_App.history.move();
                    BOM.location.href = URL_Merge.call(This_App, toURL, iArgs, iData);
                }
                return false;
            }
        );
    }

    function FontPage_Init() {
        Page_Render.call(this, DOM.URL, arguments[0]);

        /* ----- URL Hash Navigation ----- */
        var iHash = BOM.location.hash.slice(1);

        if (iHash) {
            var iHash_RE = RegExp('\\/?' + iHash + '\\.\\w+$', 'i');

            $_Body.find('*[target][href]').each(function () {
                var $_This = $(this);

                if ( $_This.attr('href').match(iHash_RE) ) {
                    $_This.trigger('click', [true]);
                    return false;
                }
            });
        }
        this.loading = false;
        this.domRoot.trigger('pageReady', [
            this,  this.history[this.history.lastIndex],  this.history[this.history.prevIndex]
        ]);

        return this;
    }

    WebApp.prototype.boot = function () {
        if (this.history.length)  throw 'This WebApp has been booted !';

        this.loading = true;
        this.history.write();
        User_Listener.call(this);

        var $_Link = $('head link[src]');

        //  No Content Data in First Page
        if (! $_Link.length)
            return FontPage_Init.call(this);

        //  Loading Content Data before First Page rendering
        var This_App = this,  Data_Ready = $_Link.length;

        $_Link.each(function () {
            var iData = { };

            This_App.domRoot.on('apiCall',  function () {
                var iArgs = $.makeArray(arguments);
                iArgs.shift();

                var _Data_ = This_App.domRoot.triggerHandler('apiCall', iArgs);
                if (_Data_)  $.extend(iData, _Data_);

                if (--Data_Ready == 0)  FontPage_Init.call(This_App, iData);
            });
            This_App.loadJSON( $(this).attr('src') );
        });

        return this;
    };

/* ----------  jQuery Wrapper  ---------- */
    $.fn.WebApp = function () {
        var iArgs = $.makeArray(arguments);

        var Init_Data = $.isPlainObject(iArgs[0]) && iArgs.shift();
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