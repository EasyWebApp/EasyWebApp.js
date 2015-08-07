//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]     v1.3.5  (2015-8-7)  Stable
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
        if (Split_Index)
            API_Root = API_Root.slice(0, Split_Index)  +
                BOM.encodeURIComponent( API_Root.slice(Split_Index) );

        $.extend(this, {
            domRoot:      $_Root,
            dataStack:    [ Init_Data ],
            apiRoot:      API_Root || '',
            urlChange:    URL_Change,
            history:      new xHistory($_Root),
            loading:      false,
            proxy:        !! Split_Index
        });

        var Data_Stack = this.dataStack;

        $(BOM).on('pageChange',  function () {
            Data_Stack.length += arguments[1];
        });
    };

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

    var _Proto_ = WebApp.prototype;

    /* ----- Manual Navigating ----- */
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

    _Proto_.loadTemplate = function () {
        return  Proxy_Trigger.apply(
                this,  Array.prototype.concat.apply(['_self'], arguments)
            );
    };

    _Proto_.loadJSON = function () {
        return  Proxy_Trigger.call(this, '_blank', null, null, arguments[0]);
    };

    _Proto_.loadPage = function () {
        return  Proxy_Trigger.apply(this, '_top', null, arguments[0]);
    };

    /* ----- Auto Navigating ----- */
    function URL_Args(DOM_Link, Need_Event) {
        var iArgs = { };

        for (var iName in DOM_Link.dataset)
            if ((! Need_Event) || (iName != 'event'))
                iArgs[iName] = Data_Value.call(this, DOM_Link.dataset[iName]);

        return iArgs;
    }

    function URL_Merge(iURL, iArgs) {
        var _This_ = this;
        iURL = iURL.split('?');

        iURL[0] = decodeURIComponent(iURL[0]).replace(
            /\{([^\}]+)\}/g,
            function () {
                return  Data_Value.call(_This_, arguments[1]);
            }
        );
        iURL[1] = $.param($.extend(
            $.paramJSON( iURL.slice(1).join('?') ),  iArgs
        ));

        return iURL.join('?');
    }

    function List_Value(iValue) {
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

    function Page_Show(iURL, iData) {
        if (this.dataStack.length < this.history.length)
            this.dataStack.push(null);

        var Old_Sum = this.dataStack.length - 1 - this.history.lastIndex;

        if (Old_Sum > 0)
            this.dataStack.length -= Old_Sum;

        iData = this.domRoot.triggerHandler('pageRender', [
            this.history[this.history.lastIndex],  this.history[this.history.prevIndex],  iData || { }
        ]) || iData;

        this.dataStack.push(iData);

        var _This_ = this,
            $_List = $('ul, ol, dl, *[multiple]').not('input');

        if (iData instanceof Array)
            List_Value.call($_List, iData);
        else
            $('body *[name]').value(function (iName) {
                var $_This = $(this);
                var iValue = Data_Value.call(_This_,  iName,  $_This.is($_List));

                if (iValue instanceof Array)
                    List_Value.call($_This, iValue);
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

    _Proto_.boot = function () {
        if (this.history.length)
            throw 'This WebApp has been booted !';

        var _This_ = this,
            iHash = BOM.location.hash.slice(1);

        this.loading = true;
        this.history.write();
        Page_Show.call(this, DOM.URL, null);

        $(DOM.body).on('submit',  'form[target][href]',  function (iEvent) {
            if (_This_.loading)  return false;

            iEvent.preventDefault();
            iEvent.stopPropagation();

            var $_Form = $(this);
            var iTarget = $_Form.attr('target');

            Input_Flush.call(_This_, $_Form);

            $_Form.attr('action',  function () {
                return  URL_Merge.call(
                        _This_,  arguments[1],  URL_Args.call(_This_, this)
                    );
            }).post(function (iData) {
                var iAttr = $_Form.attr(['action', 'title', 'href', 'src']);

                iData = _This_.domRoot.triggerHandler('formSubmit', [
                    _This_.history[_This_.history.lastIndex].HTML,
                    iAttr.action,
                    iData,
                    iAttr.href,
                    iAttr.src
                ]);
                if (iData === false)  return;

                if (iAttr.src)
                    $.extend(_This_.dataStack[_This_.history.lastIndex + 1], iData);

                _This_['load' + _Method_[iTarget]](
                    iAttr.title,  iAttr.href,  iAttr.src || iData
                );
            }).trigger('submit');
        }).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_self"][href]',
            function () {
                if (
                    _This_.loading ||
                    ((this.tagName.toLowerCase() == 'form')  &&  (! arguments[1]))
                )
                    return;

                var $_This = $(this);
                var iData = $_This.data('json'),
                    iHTML = $_This.attr('href'),
                    iJSON = $_This.attr('src');

                _This_.loading = true;

            /* ----- Load DOM  form  Cache ----- */
                var $_Cached = _This_.history.write(
                        $_This.attr('title'),  null,  iHTML,  iJSON
                    );
                if ($_Cached) {
                    $_Cached.appendTo(_This_.domRoot).fadeIn();
                    _This_.loading = false;
                    _This_.domRoot.trigger('pageReady', [
                        _This_,
                        _This_.history[_This_.history.lastIndex],
                        _This_.history[_This_.history.prevIndex]
                    ]);
                    return false;
                }

            /* ----- Load DOM  from  Network ----- */
                var DOM_Ready = iJSON ? 2 : 1;

                function Page_Ready() {
                    if ( $.isPlainObject(arguments[0]) )
                        iData = arguments[0];
                    if (--DOM_Ready == 0) {
                        Page_Show.call(_This_, iHTML, iData);
                        _This_.loading = false;
                        _This_.domRoot.trigger('pageReady', [
                            _This_,
                            _This_.history[_This_.history.lastIndex],
                            _This_.history[_This_.history.prevIndex]
                        ]);
                    }
                }
                // --- Load Data from API --- //
                if (iJSON)
                    $.getJSON(
                        URL_Merge.call(
                            _This_,
                            _This_.apiRoot + (
                                _This_.proxy ? BOM.encodeURIComponent(iJSON) : iJSON
                            ),
                            URL_Args.call(_This_, this)
                        ),
                        Page_Ready
                    );

                // --- Load DOM from HTML|MarkDown --- //
                var MarkDown_File = /\.(md|markdown)$/i;

                if (! iHTML.match(MarkDown_File))
                    _This_.domRoot.load(
                        iHTML + (_This_.domRoot.selector ? (' ' + _This_.domRoot.selector) : ''),
                        Page_Ready
                    );
                else
                    $.get(iHTML,  function (iMarkDown) {
                        if (BOM.marked)
                            $( BOM.marked(iMarkDown) )
                                .appendTo( _This_.domRoot.empty() ).fadeIn()
                                .find('a[href]').each(function () {
                                    this.setAttribute(
                                        'target',  this.href.match(MarkDown_File) ? '_self' : '_top'
                                    );
                                });
                        else
                            _This_.domRoot.text(iMarkDown);

                        Page_Ready.call(_This_.domRoot[0], iMarkDown);
                    });

                return false;
            }
        ).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_blank"][src]',
            function () {
                if (_This_.loading)  return false;

                var $_This = $(this);
                var $_Form = $_This.parents('form').eq(0),
                    iJSON = $_This.attr('src');

                if ($_Form.length)  Input_Flush.call(_This_, $_Form);

                var API_URL = URL_Merge.call(
                        _This_,
                        _This_.apiRoot + (
                            _This_.proxy ? BOM.encodeURIComponent(iJSON) : iJSON
                        ),
                        URL_Args.call(_This_, this, true)
                    );
                $.getJSON(API_URL,  function () {
                    $_This.trigger('apiCall', [
                        _This_,  _This_.history[_This_.history.lastIndex].HTML,  API_URL,  arguments[0]
                    ]);
                });
                return false;
            }
        ).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_top"][href]',
            function () {
                if (
                    _This_.loading ||
                    ((this.tagName.toLowerCase() == 'form')  &&  (! arguments[1]))
                )
                    return;

                var $_This = $(this);
                var toURL = $_This.attr('href');

                var iReturn = _This_.domRoot.triggerHandler('appExit', [
                        _This_.history[_This_.history.lastIndex].HTML,
                        toURL,
                        $_This.data('json')
                    ]);

                if (iReturn !== false) {
                    var iArgs = URL_Args.call(_This_, this);

                    if ( $.isPlainObject(iReturn) )  $.extend(iArgs, iReturn);

                    _This_.history.move();
                    BOM.location.href = URL_Merge.call(_This_, toURL, iArgs);
                }
                return false;
            }
        );

        if (iHash) {
            var iHash_RE = RegExp('\\/?' + iHash + '\\.\\w+$', 'i');

            $('body [target][href]').each(function () {
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