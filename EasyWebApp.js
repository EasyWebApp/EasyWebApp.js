//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v1.1  (2015-7-22)  Beta
//
//      [Usage]      A Light-weight WebApp Framework
//                   based on iQuery (A jQuery Compatible API).
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

        $.extend(this, {
            domRoot:      $_Root,
            dataStack:    [ Init_Data ],
            apiRoot:      API_Root || '',
            urlChange:    URL_Change,
            history:      new xHistory($_Root),
            loading:      false
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
                title:     iTitle,
                style:     'display: none',
                rel:       'nofollow'
            });

        if (iHTML)  $_Trigger.attr('href', iHTML);

        if (typeof iJSON == 'string')
            $_Trigger.attr('src', iJSON);
        else
            $_Trigger.data('json', iJSON);

        $_Trigger.appendTo(this.domRoot).click().remove();

        return this;
    }

    _Proto_.loadTemplate = function () {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift('_self');

        return  Proxy_Trigger.apply(this, iArgs);
    };

    _Proto_.loadPage = function () {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift('_top');

        return  Proxy_Trigger.apply(this, iArgs);
    };

    _Proto_.loadJSON = function () {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift('_blank');

        return  Proxy_Trigger.apply(this, iArgs);
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

    function List_Value(iValue, iLimit) {
        iLimit = iLimit || Infinity;
        iLimit = (iValue.length > iLimit) ? iLimit : iValue.length;

        var $_Template = $(this).children().detach().eq(0);

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

        this.domRoot.trigger('pageIn', [
            this,  iData,  this.history[this.history.lastIndex],  this.history[this.history.prevIndex]
        ]);
    }

    _Proto_.render = function (Page_Data, List_Limit) {
        var _This_ = this,
            iData = Page_Data || arguments.callee.caller.arguments[0];

        this.dataStack.push(iData);

        if (iData instanceof Array)
            List_Value.call($('.List')[0], iData);
        else
            $('body *[name]').value(function (iName) {
                var iValue = Data_Value.call(
                        _This_,  iName,  $(this).hasClass('List')
                    );

                if (iValue instanceof Array)
                    List_Value.call(this, iValue, List_Limit);
                else
                    return iValue;
            });

        this.loading = false;

        return this;
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

    _Proto_.pageBoot = function (ExitBack) {
        var _This_ = this,
            iHash = BOM.location.hash.slice(1);

        this.loading = true;
        this.history.write();
        Page_Show.call(this, DOM.URL, null);
        this.loading = false;

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
                iData = _This_.domRoot.triggerHandler('formSubmit', [iData]);
                if (iData === false)  return;

                var iAttr = $_Form.attr(['title', 'href', 'src']);

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
                var $_Cached = _This_.history.write(
                        $_This.attr('title'),  null,  iHTML,  iJSON
                    );

                if ($_Cached) {
                    $_Cached.appendTo(_This_.domRoot).fadeIn();
                    _This_.loading = false;
                    return false;
                }

                var DOM_Ready = iJSON ? 2 : 1;

                function Page_Ready() {
                    if ( $.isPlainObject(arguments[0]) )
                        iData = arguments[0];
                    if (--DOM_Ready == 0) {
                        Page_Show.call(_This_, iHTML, iData);
                        _This_.loading = false;
                    }
                }

                if (iJSON)
                    $.getJSON(
                        URL_Merge.call(
                            _This_,
                            _This_.apiRoot + iJSON,
                            URL_Args.call(_This_, this)
                        ),
                        Page_Ready
                    );
                _This_.domRoot.load(
                    iHTML + (_This_.domRoot.selector ? (' ' + _This_.domRoot.selector) : ''),
                    Page_Ready
                );

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
                        _This_,
                        $_This.data('json'),
                        toURL,
                        _This_.history[_This_.history.lastIndex].URL
                    ]);
                if (iReturn !== false) {
                    _This_.history.move();
                    BOM.location.href = URL_Merge.call(
                        _This_,  toURL,  URL_Args.call(_This_, this)
                    );
                }
                return false;
            }
        ).on(
            $.browser.mobile ? 'tap' : 'click',
            '[target="_blank"][src]',
            function () {
                if (_This_.loading)  return false;

                var $_This = $(this);
                var $_Form = $_This.parents('form').eq(0);

                if ($_Form.length)  Input_Flush.call(_This_, $_Form);

                $.getJSON(
                    URL_Merge.call(
                        _This_,
                        _This_.apiRoot + $_This.attr('src'),
                        URL_Args.call(_This_, this, true)
                    ),
                    $_This[0].dataset.event  &&  function () {
                        $_This.trigger( $_This[0].dataset.event );
                    }
                );
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
        )).pageBoot();

        return this;
    };

    $.fn.onPageIn = function () {
        var iArgs = $.makeArray(arguments);

        var iHTML = $.type(iArgs[0]).match(/String|RegExp/) && iArgs.shift();
        var iJSON = $.type(iArgs[0]).match(/String|RegExp/) && iArgs.shift();
        var iCallback = (typeof iArgs[0] == 'function') && iArgs[0];

        if (iCallback  &&  (iHTML || iJSON))
            this.on('pageIn',  function (iEvent, iApp, iData, This_Page, Prev_Page) {
                var Page_Match = (iHTML && iJSON) ? 2 : 1;

                if (This_Page.HTML && This_Page.HTML.match(iHTML))
                    Page_Match-- ;
                if (This_Page.JSON && This_Page.JSON.match(iJSON))
                    Page_Match-- ;

                if (Page_Match === 0)
                    iCallback.call(this, iApp, iData);
            });

        return this;
    };

})(self, self.document, self.jQuery);