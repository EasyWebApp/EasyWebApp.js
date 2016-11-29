(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+'], arguments[0]);

})(function () {


var DS_Inherit = (function (BOM, DOM, $) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    var iPrototype = {
            constructor:    DataScope,
            extend:         function (iData) {
                switch (true) {
                    case  $.likeArray( iData ):    {
                        this.length = iData.length;

                        Array.prototype.splice.call(
                            this,  iData.length,  iData.length
                        );
                    }
                    case  (! $.isEmptyObject(iData)):    $.extend(this, iData);
                }

                return this;
            },
            setValue:       function (iName) {
                var iScope = this,  _Parent_;

                while (! (
                    $.isEmptyObject(iScope)  ||  iScope.hasOwnProperty(iName)
                )) {
                    _Parent_ = Object.getPrototypeOf( iScope );

                    if (_Parent_ === Object.prototype)  break;

                    iScope = _Parent_;
                }

                iScope[iName] = arguments[1];

                return iScope;
            },
            toString:       function () {
                return  '[object DataScope]';
            },
            valueOf:        function () {
                if (this.hasOwnProperty('length'))  return $.makeArray(this);

                var iValue = { };

                for (var iKey in this)
                    if (
                        this.hasOwnProperty(iKey)  &&
                        (! iKey.match(/^(\d+|length)$/))  &&
                        (typeof this[iKey] != 'function')
                    )
                        iValue[iKey] = this[iKey];

                return iValue;
            },
            isNoValue:      function () {
                for (var iKey in this)
                    if (typeof this[iKey] != 'function')
                        return false;

                return true;
            }
        };

    return  function (iSup, iSub) {
        DataScope.prototype = (
            iSup  &&  (iSup.toString() == '[object DataScope]')
        ) ?
            iSup  :  $.extend(iSup, iPrototype);

        var iData = new DataScope(iSub);

        if (! $.browser.modern)
            iData.__proto__ = DataScope.prototype;

        DataScope.prototype = { };

        return iData;
    };

})(self, self.document, self.jQuery);



var HTML_Template = (function (BOM, DOM, $) {

    function HTML_Template($_View, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;
        this.map = { };
    }

    try {
        eval('``');

        var ES_ST = function () {
                return  eval('`' + arguments[0] + '`');
            };
    } catch (iError) {
        var Eval_This = function () {
                return  eval( arguments[0] );
            };
    }

    $.extend(HTML_Template, {
        getClass:       $.CommonView.getClass,
        instanceOf:     $.CommonView.instanceOf,
        expression:     /\$\{([\s\S]+?)\}/g,
        reference:      /this\.(\w+)/,
        eval:           function (iTemplate, iContext) {
            return  ES_ST  ?  ES_ST.call(iContext, iTemplate)  :
                iTemplate.replace(this.expression,  function () {

                    return  Eval_This.call(iContext, arguments[1]);
                });
        },
        getContext:     function (iTemplate, iData) {
            var iContext = { };

            (iTemplate || '').replace(this.expression,  function () {

                arguments[1].replace(HTML_Template.reference,  function () {

                    iContext[ arguments[1] ] = iData[ arguments[1] ];
                });
            });

            return iContext;
        },
        getTextNode:    function (iDOM) {
            return Array.prototype.concat.apply(
                $.map(iDOM.childNodes,  function (iNode) {
                    return  (iNode.nodeType == 3)  ?  iNode  :  null;
                }),
                iDOM.attributes
            );
        }
    });

    $.extend(HTML_Template.prototype, {
        toString:    $.CommonView.prototype.toString,
        pushMap:     function (iName, iNode) {
            if ( iName )
                if (iNode instanceof $.ListView)
                    this.map[iName] = iNode;
                else {
                    this.map[iName] = this.map[iName] || [ ];

                    this.map[iName].push({
                        node:        iNode,
                        template:    iNode.nodeValue,
                        parent:      iNode.parentNode || iNode.ownerElement
                    });
                }

            return this;
        },
        parse:        function () {
            var $_DOM = this.$_View.find('*:not([name]:list *)').not(function () {

                    return  (! this.outerHTML.match( HTML_Template.expression ));
                }),
                _This_ = this;

            $_DOM.not(
                $_DOM.not('[name]:list').each(function () {

                    $.each(HTML_Template.getTextNode( this ),  function () {
                        var iNode = this;

                        var iValue = this.nodeValue.replace(
                                HTML_Template.expression,
                                function (iName) {
                                    iName = iName.match( HTML_Template.reference );

                                    _This_.pushMap((iName || '')[1],  iNode);

                                    return '';
                                }
                            );
                        if (iValue == this.nodeValue)  return;

                        if ((! iValue)  &&  (this.nodeType == 2))
                            this.ownerElement.removeAttribute( this.nodeName );
                        else
                            this.nodeValue = iValue;
                    });
                })
            ).each(function () {

                _This_.pushMap(
                    this.getAttribute('name'),
                    $.ListView( this ).clear()
                        .on('insert',  function () {

                            (new HTML_Template( arguments[0] )).parse();
                        })
                        .on('update',  function () {

                            HTML_Template.instanceOf( arguments[0] )
                                .render( arguments[1] );
                        })
                );
            });

            return this;
        },
        load:         function () {
            var _This_ = this;

            return  new Promise(function () {

                if (_This_.source)
                    _This_.$_View.load(_This_.source,  arguments[0]);
                else
                    arguments[0]( _This_.$_View[0].innerHTML );

            }).then(function () {

                _This_.parse();
            });
        },
        render:       function (iData) {
            for (var iName in iData) {
                if (! this.map.hasOwnProperty( iName ))  continue;

                if (this.map[iName] instanceof $.ListView)
                    this.map[iName].render( iData[iName] );
                else
                    $.each(this.map[iName],  function () {
                        var iValue = HTML_Template.eval(this.template, iData),
                            iNode = this.node;

                        switch ( iNode.nodeType ) {
                            case 3:    {
                                if (! (iNode.previousSibling || iNode.nextSibling))
                                    return  this.parent.innerHTML = iValue;

                                break;
                            }
                            case 2:    if (iNode.nodeName in this.parent) {
                                try {
                                    iValue = eval( iValue );
                                } catch (iError) { }

                                return  this.parent[ iNode.nodeName ] = iValue;

                            } else if (! iNode.ownerElement) {
                                if ( iValue )
                                    this.parent.setAttribute(
                                        iNode.nodeName,  iValue
                                    );

                                return;
                            }
                        }

                        iNode.nodeValue = iValue;
                    });
            }

            return this;
        }
    });

    return HTML_Template;

})(self, self.document, self.jQuery);



var ViewDataIO = (function (BOM, DOM, $, DS_Inherit) {

    function ArrayRender(iArray, ValueRender, iScope) {

        iArray = iScope  ?  DS_Inherit(iScope, iArray)  :  iArray;

        $.ListView(this,  function ($_Item, iValue) {

            $_Item.data('EWA_DS',  DS_Inherit(iArray, iValue))
                .value('name', iValue);

            ValueRender.call($_Item, iValue, iArray);

        }).clear().render( iArray );
    }

    function ObjectRender(iData, iScope) {
        var _Self_ = arguments.callee;

        if ($.likeArray( iData ))
            return  ArrayRender.call(this[0], iData, _Self_, iScope);

        var iView = $.CommonView.instanceOf(this, false);

        if (iView)  return iView.render(iData);

        this.value('name',  function (iName) {

            if ($.likeArray( iData[iName] ))
                ArrayRender.call(this, iData[iName], _Self_, iData);
            else if ($.isPlainObject( iData[iName] ))
                _Self_.call($(this), iData[iName]);
            else
                return iData[iName];
        });
    }

    $.fn.extend({
        dataRender:    function (iData) {
            switch (true) {
                case  $.likeArray( iData ):    {
                    var iView = $.ListView.instanceOf(this, false);

                    ArrayRender.call(
                        iView  ?
                            iView.$_View[0]  :  $.ListView.findView(this, true)[0],
                        iData,
                        ObjectRender
                    );

                    break;
                }
                case  (! $.isEmptyObject(iData)):
                    ObjectRender.call(this, iData);
            }

            return this;
        },
        dataReader:    function () {
            var $_Key = $('[name]', this[0]).not( $('[name] [name]', this[0]) ),
                iData = { };

            if (! $_Key[0])  return this.value();

            for (var i = 0, iName, iLV;  i < $_Key.length;  i++) {
                iName = $_Key[i].getAttribute('name');
                iLV = $.ListView.instanceOf($_Key[i], false);

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
})(self, self.document, self.jQuery, DS_Inherit);



var UI_Module = (function (BOM, DOM, $, DS_Inherit, HTML_Template) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        this.data = DS_Inherit(this.getScope(), this.getEnv());

        this.$_View = iLink.getTarget();
        this.$_View = this.$_View[0] ? this.$_View : iLink.$_DOM;
        this.attach();

        this.lastLoad = 0;

        this.ownerApp.register(this);
    }

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf
    });

    $.extend(UI_Module.prototype, {
        toString:      $.CommonView.prototype.toString,
        trigger:       function () {
            return this.ownerApp.trigger(
                arguments[0],
                this.source.href || '',
                this.source.src || this.source.action || '',
                [ this.source ].concat( arguments[1] )
            ).slice(-1)[0];
        },
        detach:        function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        attach:        function () {
            this.$_View.data(this.constructor.getClass(), this);

            if (this.$_Content) {
                this.$_View.append( this.$_Content );
                this.trigger('ready');
            } else if (this.lastLoad)
                this.load();

            return this;
        },
        getScope:      function () {
            var iLV = $.ListView.instanceOf( this.source.$_DOM ),  iData;

            if (iLV  &&  (iLV.$_View[0] !== this.source.$_DOM[0])) {

                var $_Item = this.source.$_DOM.parentsUntil( iLV.$_View );

                iData = ($_Item[0] ? $_Item.slice(-1) : this.source.$_DOM)
                    .data('EWA_DS');
            }
            iData = iData  ||  (this.source.ownerView || '').data;

            return  $.likeArray(iData) ? { } : iData;
        },
        getEnv:        function () {
            var iData = { },
                iHTML = this.source.getURL('href'),
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            if (iHTML) {
                var iFileName = $.fileName(iHTML).split('.');

                $.extend(iData, {
                    _File_Path_:    $.filePath(iHTML),
                    _File_Name_:    iFileName[0],
                    _File_Ext_:     iFileName[1]
                });
            }

            if (iJSON) {
                iJSON = iJSON.slice( this.ownerApp.apiPath.length );

                $.extend(iData, {
                    _Data_Path_:    $.filePath(iJSON),
                    _Data_Name_:    $.fileName(iJSON)
                });
            }

            return  $.extend(iData, $.paramJSON(this.source.href));
        },
        prefetch:      function () {
            var InnerLink = this.source.constructor;

            var $_Link = this.$_View.find( InnerLink.selector ).not('link');

            for (var i = 0;  $_Link[i];  i++)
                (new InnerLink(this.ownerApp, $_Link[i])).prefetch();

            return this;
        },
        loadModule:    function () {
            var _This_ = this,  InnerLink = this.source.constructor;

            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(img, iframe, script)')
                    .not(InnerLink.selector + ', *[href]:parent');

            return Promise.all($.map(
                $_Module[this.lastLoad ? 'not' : 'filter'](function () {

                //  About this --- https://github.com/jquery/jquery/issues/3270

                    return  (this.getAttribute('async') == 'false');
                }),
                function () {
                    return  (new UI_Module(
                        new InnerLink(_This_.ownerApp, arguments[0])
                    )).load();
                }
            ));
        },
        loadJSON:      function () {
            return  this.source.loadData( this.data );
        },
        loadHTML:      function () {
            this.template = new HTML_Template(
                this.$_View,  this.source.getURL('href')
            );

            var _This_ = this;

            return  this.template.load().then(function () {
                var iLink = _This_.prefetch().source;

                var $_Target = iLink.getTarget();

                var $_Link = $_Target.children('link[target="_blank"]')
                        .attr('href', iLink.href);

                if (
                    ((! iLink.href)  ||  iLink.src  ||  iLink.action)  ||
                    ($_Target[0] != _This_.ownerApp.$_Root[0])  ||
                    (! $_Link[0])
                )
                    return;

                _This_.template.render( _This_.data );

                var _Link_ = (new iLink.constructor(iLink.ownerApp, $_Link[0]))
                        .register(iLink.ownerApp.length - 1);

                iLink.method = _Link_.method || iLink.method;
                iLink.src = _Link_.src;
                iLink.data = _Link_.data;

                _This_.data.extend( _This_.getEnv() );

                return _This_.loadJSON();
            });
        },
        render:        function (iData) {
            this.data.extend(this.trigger('data', [iData])  ||  iData);

            if (! this.data.isNoValue()) {
                this.$_View.dataRender( this.data );

                if (this.template instanceof HTML_Template)
                    this.template.render( this.data );
            }

            var _This_ = this;

            return  this.loadModule().then(function () {

                _This_.lastLoad = $.now();
                _This_.domReady = null;

                _This_.trigger('ready');

                return _This_.loadModule();

            },  function () {

                _This_.domReady = null;
            });
        },
        load:          function () {
            var _This_ = this,
                iJSON = this.source.getURL('src') || this.source.getURL('action');

            this.lastLoad = 0;

            return  this.domReady = Promise.all([
                iJSON  &&  this.loadJSON(),  this.loadHTML()
            ]).then(function (_Data_) {
                _Data_ = _Data_[0] || _Data_[1];

                return  _This_.$_View.children('script')[0] ?
                    _Data_ : _This_.render(_Data_);
            });
        }
    });

    return UI_Module;

})(self, self.document, self.jQuery, DS_Inherit, HTML_Template);



var InnerLink = (function (BOM, DOM, $, UI_Module, HTML_Template) {

    function InnerLink(iApp, iLink) {
        this.ownerApp = iApp;
        this.ownerView = UI_Module.instanceOf(iLink);

        this.$_DOM = $(iLink);

        this.title = iLink.title;
        this.target = iLink.getAttribute('target');
        this.href = iLink.getAttribute('href');
        this.method = (iLink.getAttribute('method') || 'GET').toLowerCase();
        this.src = iLink.getAttribute('src');
        this.action = iLink.getAttribute('action');

        this.data = iLink.dataset;
    }

    $.extend(InnerLink, {
        selector:       '*[target]:not(a)',
        reURLVar:       /\{(.+?)\}/g,
        prefetchRel:    $.browser.modern ? 'prefetch' : 'next'
    });

    var $_Prefetch = $('<link rel="' + InnerLink.prefetchRel + '" />')
            .on('load error',  function () {
                $(this).remove();
            });

    $.extend(InnerLink.prototype, {
        valueOf:      function () {
            var iValue = { };

            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        getTarget:    function () {
            switch (this.target) {
                case '_self':      return this.ownerApp.$_Root;
                case '_blank':     ;
                case '_parent':    ;
                case '_top':       return $();
            }

            return  this.target  ?  $('*[name="' + this.target + '"]')  :  $();
        },
        getArgs:      function () {
            var iData = this.ownerView.data;

            var iArgs = HTML_Template.getContext(this.src || this.action,  iData);

            for (var iKey in this.data)
                iArgs[ this.data[iKey] ] = iData[ this.data[iKey] ];

            return iArgs;
        },
        getURL:       function (iName, iScope) {
            var iURL = this[iName] =
                    this.$_DOM[0].getAttribute(iName) || this[iName];

            iScope = iScope  ||  (this.ownerView || '').data;

            if (! iURL)  return;

            if (iScope  &&  iScope.isNoValue  &&  (! iScope.isNoValue())) {
                var _Args_ = { },  _Data_;

                for (var iKey in this.data) {
                    _Data_ = iScope[ this.data[iKey] ];

                    if ($.isData(_Data_))  _Args_[iKey] = _Data_;
                }

                iURL = $.extendURL(
                    iURL.replace(InnerLink.reURLVar,  function () {
                        return  iScope[arguments[1]] || '';
                    }),
                    _Args_
                );
            }

            if ((iName != 'href')  &&  (! $.urlDomain(iURL || ' ')))
                iURL = this.ownerApp.apiPath + iURL;

            return iURL;
        },
        register:     function (Index) {
            DOM.title = this.title || DOM.title;

            BOM.history[
                (this.$_DOM[0].tagName != 'LINK')  ?
                    'pushState'  :  'replaceState'
            ](
                {index: Index},
                DOM.title,
                '#!'  +  $.extendURL(this.href, this.getArgs())
            );

            return this;
        },
        loadData:     function (iScope) {
            var iOption = {type:  this.method};

            if (! this.$_DOM.find('input[type="file"]')[0])
                iOption.data = this.$_DOM.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_DOM[0] );
                iOption.contentType = iOption.processData = false;
            }

            return $.ajax(
                this.getURL('src', iScope)  ||  this.getURL('action', iScope),
                iOption
            );
        },
        prefetch:     function () {
            var iHTML = (this.href || '').split('?')[0],
                iJSON = this.src || this.action || '';

            if (iHTML)
                $_Prefetch.clone(true).attr('href', iHTML).appendTo('head');

            if (
                (this.method == 'get')  &&
                (! iJSON.match(this.constructor.reURLVar))  &&
                $.isEmptyObject( this.data )
            )
                $_Prefetch.clone(true).attr(
                    'href',  this.getURL('src') || this.getURL('action')
                ).appendTo('head');
        }
    });

    return InnerLink;

})(self, self.document, self.jQuery, UI_Module, HTML_Template);



var WebApp = (function (BOM, DOM, $, UI_Module, InnerLink) {

    var $_BOM = $(BOM);

    function WebApp(Page_Box, API_Path, Cache_Minute) {
        var _Self_ = arguments.callee;

        if (this instanceof $)
            return  new _Self_(this[0], Page_Box, API_Path);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        $.Observer.call(this, 1);

        this.$_Root = $(Page_Box).data('_EWA_', this);

        var iArgs = $.makeArray(arguments).slice(1);

        this.apiPath = $.urlDomain(iArgs[0] || ' ')  ?  iArgs.shift()  :  '';
        this.cacheMinute = $.isNumeric( iArgs[0] )  ?  iArgs.shift()  :  3;

        this.length = 0;
        this.lastPage = -1;

        $_BOM.on('popstate',  function () {

            var Index = (arguments[0].originalEvent.state || '').index;

            _This_.hashChange = false;

            if ((! _This_[Index])  ||  (_This_.lastPage == Index))
                return;

            _This_[_This_.lastPage].detach();
            _This_[_This_.lastPage = Index].attach();

        }).on('hashchange',  function () {

            if (_This_.hashChange === false)
                return  _This_.hashChange = null;

            var iHash = _Self_.getRoute();

            if (iHash)  _This_.load(iHash);
        });

        this.init();
    }

    WebApp.getRoute = function () {
        var iHash = BOM.location.hash.match(/^#!([^#!]+)/);
        return  iHash && iHash[1];
    };

    WebApp.fn = WebApp.prototype = $.extend(new $.Observer(),  {
        constructor:     WebApp,
        push:            Array.prototype.push,
        splice:          Array.prototype.splice,
        load:            function (HTML_URL, $_Sibling) {
            $('<span />',  $.extend(
                {style: 'display: none'},
                (typeof HTML_URL == 'object')  ?  HTML_URL  :  {
                    target:    '_self',
                    href:      HTML_URL
                }
            )).appendTo($_Sibling || 'body').click();

            return this;
        },
        init:            function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source,  _This_ = this;

            iModule.data.extend( $.paramJSON() );

            iModule[
                (iLink.href || iLink.src || iLink.action)  ?  'load'  :  'render'
            ]().then(function () {
                var iHash = WebApp.getRoute();

                if (! iHash)
                    $('body *[autofocus]:not(:input)').eq(0).click();
                else
                    _This_.load(iHash);
            });
        },
        register:        function (iPage) {
            if (this.$_Root[0] !== iPage.$_View[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            this.hashChange = false;
            iPage.source.register( this.length );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  (i + 2) < this.length;  i++)
                if ((this[i].lastLoad < iTimeOut)  &&  this[i].$_Content) {
                    this[i].$_Content.remove();
                    this[i].$_Content = null;
                }
        },
        getModule:       function () {
            return  UI_Module.instanceOf( arguments[0] );
        }
    });

    return  $.fn.iWebApp = WebApp;

})(self, self.document, self.jQuery, UI_Module, InnerLink);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.2  (2016-11-29)  Alpha
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2016    shiy2008@gmail.com
//



var EasyWebApp = (function (BOM, DOM, $, WebApp, InnerLink, UI_Module, HTML_Template) {

    $.ajaxSetup({dataType: 'json'});


/* ----- SPA 链接事件 ----- */

    $(DOM).on('click',  'a[href]:not(a[target="_blank"])',  function () {

        var iURL = this.href.split('#');

        if (iURL[0] != DOM.URL.split('#')[0])
            return  this.target = '_blank';

        arguments[0].preventDefault();

        iURL = (iURL[1][0] == '!')  &&  iURL[1].slice(1);

        if (iURL)  (new WebApp()).load(iURL);

    }).on('click submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')  return;

            iEvent.preventDefault();
        } else if ( iEvent.isPseudo() )
            return;

        iEvent.stopPropagation();

        var iLink = new InnerLink(new WebApp(), this),  iModule;

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':    {
                iModule = $.extend({
                    ownerApp:    iLink.ownerApp,
                    source:      iLink,
                    data:        iLink.ownerView.data
                }, UI_Module.prototype);

                iModule.loadJSON().then(function () {

                    iModule.trigger('data', arguments[0]);
                });
                break;
            }
            case '_self':     ;
            default:          {
                iModule = iLink.ownerApp.getModule( iLink.$_DOM );

                if ((! iModule)  ||  !(iModule.domReady instanceof Promise))
                    (new UI_Module(iLink)).load();
            }
        }
    });

/* ----- 视图数据监听 ----- */

    function Data_Change() {
        var iValue = $(this).value('name');

        try {
            iValue = eval( iValue );
        } catch (iError) { }

        iValue = (iValue != null)  ?  iValue  :  '';

        var iName = this.getAttribute('name');

        UI_Module.instanceOf( this ).data.setValue(iName, iValue);

        var iData = { };
        iData[iName] = iValue;

        HTML_Template.instanceOf( this ).render( iData );
    }

    $(DOM)
        .on('change', 'select', Data_Change)
        .on('keyup paste', ':input:not(select)', Data_Change);

})(self, self.document, self.jQuery, WebApp, InnerLink, UI_Module, HTML_Template);


});
