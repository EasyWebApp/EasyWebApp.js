//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]     v2.1  (2015-11-6)  Beta
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

    var $_BOM = $(BOM);


/* ---------- [object InnerPage] ---------- */

    function InnerPage(App_Instance, Page_Info) {
        $.extend(this, {
            ownerApp:    App_Instance,
            title:       DOM.title,
            URL:         BOM.location.href,
            HTML:        DOM.URL,
            method:      'Get',
            JSON:        '',
            time:        $.now()
        }, Page_Info);
    }

    InnerPage.prototype.valueOf = function () {
        return {
            title:     this.title,
            URL:       this.URL,
            HTML:      this.HTML,
            method:    this.method,
            JSON:      this.JSON
        };
    };

/* ---------- [object InnerHistory] ---------- */

    function InnerHistory(App_Instance, $_Root) {
        var _This_ = $.extend(this, {
                length:       0,
                ownerApp:     App_Instance,
                root:         $_Root,
                lastIndex:    -1
            });

        $_BOM.on('popstate',  function () {
            var iState = arguments[0].state;
            var iHistory = _This_[ (iState || { }).DOM_Index ];

            if (! iHistory)  return;

            _This_.move(iState);
            iHistory.$_Page.appendTo($_Root).fadeIn();

            $_BOM.trigger('pageChange',  [iState.DOM_Index - _This_.lastIndex]);
            _This_.prevIndex = _This_.lastIndex;
            _This_.lastIndex = iState.DOM_Index;
        });
    }

    $.extend(InnerHistory.prototype, {
        splice:    Array.prototype.splice,
        push:      Array.prototype.push,
        slice:     Array.prototype.slice,
        move:      function (iState) {
            var $_Page = this.root.children().detach();

            if ((! iState)  ||  ((iState.DOM_Index + 2) == this.length))
                this[this.length - 1].$_Page = $_Page;
        },
        write:     function (iLink) {
            if (this.length)  this.move();

            this.prevIndex = this.lastIndex++ ;
            this.splice(this.lastIndex,  this.length);

            iLink = iLink || { };

            var iNew = new InnerPage(this.ownerApp, {
                    title:     iLink.title,
                    URL:       iLink.alt,
                    HTML:      iLink.href,
                    JSON:      iLink.src,
                    method:    iLink.method
                });
            this.push(iNew);

            BOM.history.pushState(
                {DOM_Index:  this.lastIndex},
                iNew.title,
                iNew.URL
            );
            return iNew;
        },
        cache:     function () {
            var iNew = this[this.lastIndex];

            for (var i = 0;  i < this.lastIndex;  i++)
                if (
                    ((iNew.time - this[i].time) < 60000)  &&
                    (! (iNew.method + this[i].method).match(/Post|Put/i))  &&
                    $.isEqual(iNew, this[i])
                )
                    return  this[i].$_Page;
        },
        last:      function () {
            return  (this[this.lastIndex] || { }).valueOf();
        },
        prev:      function () {
            return  (this[this.prevIndex] || { }).valueOf();
        }
    });

/* ---------- [object DataStack] ---------- */

    function DataStack() {
        this.history = arguments[0];

        var iStack = this.stack = [ ];

        $_BOM.on('pageChange',  function () {
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

/* ---------->> WebApp Constructor <<---------- */

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
            history:      new InnerHistory(this, $_Root),
            loading:      false,
            proxy:        API_Root[1] || ''
        });
        this.dataStack = new DataStack(this.history);
        this.dataStack.pushStack(Init_Data);
    }

    var RE_Str_Var = /\{(.+?)\}/g;

    WebApp.prototype.makeURL = function (iURL, iData, iArgs) {
        iURL = $.split(iURL, '?', 2);
        iData = iData || { };

        var This_App = this;

        iURL = [
            BOM.decodeURIComponent(iURL[0]).replace(RE_Str_Var,  function () {
                return  iData[arguments[1]] || This_App.dataStack.value(arguments[1]);
            }),
            $.param($.extend(
                $.paramJSON(iURL[1]),  iArgs || { }
            ))
        ].join('?');

        iURL = (
            iURL.match(/^(\w+:)?\/\/[\w\d]+/) ? '' : this.apiRoot
        ) + iURL;

        return  this.proxy + (
            this.proxy ? BOM.encodeURIComponent(iURL) : iURL
        );
    };

/* ---------- [object PageLink] ---------- */

    function PageLink(This_App, Link_DOM, iArgument, iData) {
        this.app = This_App;
        this.$_DOM = $.isPlainObject(Link_DOM) ?
            this.createDOM(Link_DOM, iArgument, iData)  :
            $(Link_DOM);

        $.extend(this, this.$_DOM.attr([
            'target', 'title', 'alt', 'href', 'method', 'src'
        ]));
        this.method = (this.method || 'Get').toLowerCase();
        this.data = this.$_DOM.data('EWA_Model') || { };

        if ((this.target == '_self')  &&  this.href)
            this.prefetch();
    }

    var Prefetch_Tag = $.browser.modern ? 'prefetch' : 'next';

    $.extend(PageLink.prototype, {
        createDOM:    function (iAttribute, iArgument, iData) {
            if ( $.isPlainObject(iArgument) )
                for (var iName in iArgument) {
                    iArgument['data-' + iName] = iArgument[iName];
                    delete iArgument[iName];
                }
            var $_Link = $('<button />', $.extend({
                style:    'display: none',
                rel:      'nofollow'
            }, iAttribute, iArgument));

            if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                $_Link.data('EWA_Model', iData);

            return $_Link;
        },
        getArgs:      function () {
            var This_App = this.app,  iData = this.data;

            return  $.map(this.$_DOM[0].dataset,  function (iName) {
                var _Arg_ = iData[iName] || This_App.dataStack.value(iName);

                return  (_Arg_ !== undefined)  ?  _Arg_  :  iName;
            });
        },
        getURL:       function () {
            return  this.app.makeURL(
                this.src,
                this.data,
                this.method.match(/Get|Delete/i)  &&  this.getArgs()
            );
        },
        prefetch:     function () {
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
                        href:    this.getURL()
                    })
                );

            $_Prefetch.appendTo(DOM.head);
        },
        valueOf:      function () {
            return {
                target:    this.target,
                title:     this.title,
                alt:       this.alt,
                href:      this.href,
                method:    this.method,
                src:       this.src
            };
        }
    });
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

        this.loading = false;
        (new PageLink(this, iAttribute, iArgument, iJSON))
            .$_DOM.appendTo($_Body).click();

        return this;
    }

    var _Concat_ = Array.prototype.concat,
        Target_Method = {
            _top:      'loadPage',
            _blank:    'loadJSON',
            _self:     'loadTemplate'
        };

    $.each(Target_Method,  function (iTarget) {
        WebApp.prototype[ arguments[1] ] = function () {
            return  Proxy_Trigger.apply(this,  _Concat_.apply([iTarget], arguments));
        };
    });

/* ---------- [object ListView] ---------- */

    function ListView($_Root, iData) {
        this.$_Root = $_Root;
        this.$_Template = $_Root.children().eq(0).clone(true);
        this.data = iData || [ ];
    }
    $.extend(ListView.prototype, {
        renderLine:    function (iValue) {
            var $_Clone = this.$_Template.clone(true);

            return  $_Clone.data('EWA_Model', iValue)
                .find('*').add($_Clone)
                .filter('*[name]').value(function () {
                    return iValue[arguments[0]];
                });
        },
        render:        function () {
            var iLimit = parseInt( this.$_Root.attr('max') )  ||  Infinity;
            iLimit = (this.data.length > iLimit) ? iLimit : this.data.length;

            for (var i = 0;  i < iLimit;  i++)
                this.renderLine( this.data[i] ).appendTo( this.$_Root );
        },
        insert:        function (iData, Index) {
            Index = Index || 0;

            this.data.splice(Index, 0, iData);
            this.$_Root.eq(Index).before( this.renderLine(iData) );
        },
        delete:        function (Index) {
            Index = parseInt(Index);
            if (isNaN( Index ))  return;

            this.data.splice(Index, 1);
            this.$_Root.eq(Index).remove();
        }
    });

    /* ----- Auto Navigation ----- */

    var $_Data_Box;

    function Load_Process($_Loaded_Area) {
        if (! $_Loaded_Area)
            $_Data_Box = $_Body.find('*[name]');
        else if ($_Data_Box && $_Data_Box.length)
            $_Data_Box = $_Data_Box.not( $_Loaded_Area.find('*[name]') );
        else  return;

        $.shadowCover.clear();
        $_Data_Box.sameParents().eq(0).shadowCover('<h1>Data Loading...</h1>', {
            ' h1':    {
                color:    'white'
            }
        });
    }
    InnerPage.prototype.render = function ($_Source, iData) {
        var This_App = this.ownerApp;

        /* ----- Data Stack Change ----- */
        iData = $.extend(true,  $_Source && $_Source.data('EWA_Model'),  iData);

        var iReturn = This_App.domRoot.triggerHandler('pageRender', [
                This_App.history.last(),
                This_App.history.prev(),
                iData
            ]);
        iData = This_App.dataStack.pushStack(iReturn || iData);

        if (iReturn === false)  return this;

        /* ----- Data Render ----- */
        var $_List = This_App.domRoot.find('ul, ol, dl, tbody, *[multiple]').not('input');

        if (iData instanceof Array) {
            (new ListView($_List, iData)).render();
            Load_Process($_List);
        } else
            Load_Process(
                $_Body.value(function (iName) {
                    var $_This = $(this);
                    var iValue = This_App.dataStack.value(iName, $_This.is($_List));

                    if (iValue instanceof Array)
                        (new ListView($_This, iValue)).render();
                    else if ( $.isPlainObject(iValue) )
                        $_This.data('EWA_Model', iValue).value(iValue);
                    else
                        return iValue;
                })
            );
        return this;
    };

    InnerPage.prototype.onReady = function () {
        $_Body.find('button[target]:hidden').remove();
        $.shadowCover.clear();

        var This_App = this.ownerApp;

        $('head link[rel="' + Prefetch_Tag + '"]').remove();

        (This_App.history.lastIndex ? This_App.domRoot : $_Body).find('*[target][href]')
            .each(function () {
                new PageLink(This_App, this);
            });

        This_App.loading = false;
        This_App.domRoot.trigger('pageReady', [
            This_App,
            This_App.history.last(),
            This_App.history.prev()
        ]);

        return this;
    };

    function API_Call(iLink, Data_Ready) {
        var This_App = this,  API_URL = iLink.getURL();

        function AJAX_Ready() {
            if (! Data_Ready)  return;

            Data_Ready.call(
                this,
                This_App.domRoot.triggerHandler('apiCall', [
                    This_App,
                    This_App.history.last().HTML,
                    This_App.proxy  ?
                        BOM.decodeURIComponent( API_URL.slice(This_App.proxy.length) )  :
                        API_URL,
                    arguments[0]
                ]) || arguments[0]
            );
        }
        switch (iLink.method) {
            case 'get':       ;
            case 'delete':
                $[iLink.method](API_URL, AJAX_Ready);    break;
            case 'post':      ;
            case 'put':
                $[iLink.method](
                    API_URL,  iLink.getArgs(),  AJAX_Ready
                );
        }
    }
    function Multiple_API(iRender) {
        var $_Link = $('head link[src]');

        if (! $_Link.length)  return iRender.call(this);

        Load_Process();

        var This_App = this,  iData = { },  Data_Ready = $_Link.length;

        $_Link.each(function () {
            API_Call.call(This_App,  new PageLink(This_App, this),  function () {
                $.extend(iData, arguments[0]);

                if (--Data_Ready > 0)  return;

                iRender.call(This_App, iData);
                $_Link.remove();
            });
        });
    }
    var Response_Event = ($.browser.mobile ? 'tap' : 'click') + ' change';

    function Event_Filter(This_App) {
        var iTagName = this.tagName.toLowerCase(),
            iEvent = arguments.callee.caller.arguments[0];

        switch (iEvent.type) {
            case 'click':     ;
            case 'tap':       {
                if (iTagName == 'a')  iEvent.preventDefault();

                return  iTagName.match(/form|input|textarea|select/);
            }
            case 'change':    return  (this !== iEvent.target);
        }
        return This_App.loading;
    }

    function User_Listener() {
        var This_App = this;

        $_Body.on(Response_Event,  '[target="_self"][href]',  function () {

            if ( Event_Filter.call(this, This_App) )  return;

            var iLink = new PageLink(This_App, this);

            var iReturn = This_App.domRoot.triggerHandler('pageLoad', [
                    This_App.history.last(),
                    This_App.history.prev()
                ]);
            if (iReturn === false)  return;

            This_App.loading = true;

        /* ----- Load DOM  from  Cache ----- */
            var This_Page = This_App.history.write(iLink);
            var $_Cached = This_App.history.cache();

            if ($_Cached) {
                $_Cached.appendTo(This_App.domRoot).fadeIn();
                return This_Page.onReady();
            }

        /* ----- Load DOM  from  Network ----- */
            var iData,  Load_Stage = iLink.src ? 2 : 1;

            function Page_Load() {
                if (arguments[0])  iData = arguments[0];

                if (--Load_Stage != 0)  return;

                This_Page.render(iLink.$_DOM, iData).onReady();
            }
            // --- Load Data from API --- //
            if (iLink.src)
                API_Call.call(This_App, iLink, Page_Load);

            // --- Load DOM from HTML|MarkDown --- //
            var MarkDown_File = /\.(md|markdown)$/i,
                iSelector = This_App.domRoot.selector;

            $.get(iLink.href,  (! iLink.href.match(MarkDown_File)) ?
                function (iHTML) {
                    if (typeof iHTML != 'string')  return;

                    var not_Fragment = iHTML.match(/<\s*(html|head|body)(\s|>)/i),
                        no_Link = (! iHTML.match(/<\s*link(\s|>)/i));

                    if ((! not_Fragment)  &&  no_Link) {
                        $(iHTML).appendTo( This_App.domRoot ).fadeIn();
                        return  Multiple_API.call(This_App, Page_Load);
                    }
                    $_Body.sandBox(
                        iHTML,
                        ((iSelector && no_Link) ? iSelector : 'body > *')  +  ', head link[src]',
                        function ($_Content) {
                            $_Content.filter('link').appendTo('head');
                            This_App.domRoot.append( $_Content.not('link').fadeIn() );

                            Multiple_API.call(This_App, Page_Load);
                        }
                    );
                } :
                function (iMarkDown) {
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

                    This_Page.onReady();
                }
            );
        }).on(Response_Event,  '[target="_blank"][src]',  function () {

            if ( Event_Filter.call(this, This_App) )  return;

            var $_Form = $(this).parents('form').eq(0);
            if ($_Form.length)
                This_App.dataStack.flush($_Form);

            API_Call.call(This_App,  new PageLink(This_App, this));

        }).on(Response_Event,  '[target="_top"][href]',  function () {

            if ( Event_Filter.call(this, This_App) )  return;

            var iLink = new PageLink(This_App, this);

            var iReturn = This_App.domRoot.triggerHandler('appExit', [
                    This_App.history.last().HTML,
                    iLink.href,
                    iLink.data
                ]);
            if (iReturn === false)  return;

            This_App.history.move();
            BOM.sessionStorage.EWA_Model = BOM.JSON.stringify(
                $.isPlainObject(iReturn) ? iReturn : iLink.data
            );
            BOM.location.href = iLink.href  +  '?'  +  $.param( iLink.getArgs() );
        });

        $_Body.on('submit',  'form:visible',  function () {

            if (This_App.loading)  return false;

            var $_Form = This_App.dataStack.flush( $(this) );

            $_Form.attr('action',  function () {

                return  This_App.makeURL(arguments[1]);

            }).ajaxSubmit(function (iData) {

                var iLink = (new PageLink(This_App, $_Form)).valueOf();

                var iReturn = This_App.domRoot.triggerHandler('formSubmit', [
                        This_App.history.last().HTML,
                        this.action,
                        iData,
                        iLink.href
                    ]);
                if ((iReturn !== false)  &&  this.target) {
                    if (! iLink.src)  iLink.src = iReturn || iData;

                    This_App[ Target_Method[this.target] ](iLink);
                }
            }).trigger('submit');

            return false;
        });
    }

    WebApp.prototype.boot = function () {
        if (this.history.length)  throw 'This WebApp has been booted !';

        this.loading = true;
        var This_Page = this.history.write();

        User_Listener.call(this);
        Multiple_API.call(this,  function () {
            This_Page.render(null, arguments[0]);

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
            This_Page.onReady();
        });

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