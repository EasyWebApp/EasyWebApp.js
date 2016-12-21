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



var Node_Template = (function (BOM, DOM, $) {

    function Node_Template(iNode) {
        this.ownerNode = iNode;

        this.name = iNode.nodeName;
        this.raw = iNode.nodeValue;

        this.ownerElement = iNode.parentNode || iNode.ownerElement;
    }

    Node_Template.expression = /\$\{([\s\S]+?)\}/g;

    Node_Template.reference = /this\.(\w+)/;

    try {
        eval('``');

        var ES_ST = function () {
                'use strict';

                var iValue = eval('`' + arguments[0] + '`');

                return  (iValue != null)  ?  iValue  :  '';
            };
    } catch (iError) {
        var Eval_This = function () {
                'use strict';

                var iValue = eval( arguments[0] );

                return  (iValue != null)  ?  iValue  :  '';
            };
    }

    $.extend(Node_Template.prototype, {
        eval:        function (iContext) {
            try {
                return  ES_ST  ?  ES_ST.call(iContext, this.raw)  :
                    this.raw.replace(Node_Template.expression,  function () {

                        return  Eval_This.call(iContext, arguments[1]);
                    });
            } catch (iError) {
                return '';
            }
        },
        getRefer:    function () {
            var iRefer = [ ];

            this.ownerNode.nodeValue = this.raw.replace(
                Node_Template.expression,  function () {
                    arguments[1].replace(
                        Node_Template.reference,  function () {
                            iRefer.push( arguments[1] );
                        }
                    );

                    return '';
                }
            );

            return iRefer;
        },
        render:      function () {
            var iValue = this.eval( arguments[0] ),
                iNode = this.ownerNode,
                iParent = this.ownerElement;

            switch ( iNode.nodeType ) {
                case 3:    {
                    if (! (iNode.previousSibling || iNode.nextSibling))
                        return  iParent.innerHTML = iValue;

                    break;
                }
                case 2:    if (
                    (this.name != 'style')  &&  (this.name in iParent)
                ) {
                    if ( iValue )  try {
                        iValue = eval( iValue );
                    } catch (iError) { }

                    iParent[ this.name ] = iValue;

                    return;

                } else if (! iNode.ownerElement) {
                    if ( iValue )
                        iParent.setAttribute(this.name, iValue);

                    return;
                }
            }

            iNode.nodeValue = iValue;
        }
    });

    return Node_Template;

})(self, self.document, self.jQuery);



var HTML_Template = (function (BOM, DOM, $, DS_Inherit, Node_Template) {

    function HTML_Template($_View, iScope, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.type = $.expr[':'].list( this.$_View[0] )  ?  'list'  :  'plain';

        this.scope = DS_Inherit(iScope,  { });

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;

        this.length = 0;
        this.map = { };

        this.lastRender = 0;
    }

    $.extend(HTML_Template, {
        getClass:       $.CommonView.getClass,
        instanceOf:     $.CommonView.instanceOf,
        getMaskCode:    function (Index) {
            return  (Index < 0)  ?  0  :  parseInt(1 + '0'.repeat(Index),  2);
        },
        getTextNode:    function (iDOM) {
            return Array.prototype.concat.apply(
                $.map(iDOM.childNodes,  function (iNode) {
                    if (
                        (iNode.nodeType == 3)  &&
                        (iNode.nodeValue.indexOf('${') > -1)
                    )
                        return iNode;
                }),
                iDOM.attributes
            );
        },
        extend:         function (iTarget, iSource) {
            iSource = this.getTextNode( iSource );

            for (var i = 0;  iSource[i];  i++)
                if (iSource[i].nodeName != 'target')
                    iTarget.setAttribute(
                        iSource[i].nodeName,  iSource[i].nodeValue
                    );

            var $_Target = this.instanceOf( iTarget );

            iTarget = $_Target.parsePlain( iTarget );

            for (var i = 0;  iTarget[i];  i++)
                iTarget[i].render( $_Target.scope );
        }
    });

    $.extend(HTML_Template.prototype, {
        toString:      $.CommonView.prototype.toString,
        push:          Array.prototype.push,
        pushMap:       function (iName, iNode) {
            iNode = HTML_Template.getMaskCode(this.push(iNode) - 1);

            iName = (typeof iName == 'string')  ?  [iName]  :  iName;

            for (var i = 0;  iName[i];  i++)
                this.map[iName[i]] = (this.map[iName[i]] || 0)  +  iNode;

            return this;
        },
        parsePlain:    function () {
            var _This_ = this;

            return  $.map(
                HTML_Template.getTextNode( arguments[0] ),
                function (iNode) {
                    var iTemplate = new Node_Template( iNode );

                    var iName = iTemplate.getRefer();

                    if (! iName[0])  return;

                    _This_.pushMap(iName, iTemplate);

                    if ((! iNode.nodeValue)  &&  (iNode.nodeType == 2))
                        iNode.ownerElement.removeAttribute( iNode.nodeName );

                    return iTemplate;
                }
            );
        },
        parseList:     function (iList) {
            var iView = $[
                    $(':media', iList)[0]  ?  'GalleryView'  :  'ListView'
                ]( iList ),
                _This_ = this;

            return this.pushMap(
                iList.getAttribute('name'),
                iView.on('insert',  function () {

                    (new HTML_Template(arguments[0], _This_.scope)).parse();

                }).on('update',  function () {

                    HTML_Template.instanceOf( arguments[0] )
                        .render( arguments[1] );
                })
            );
        },
        parse:         function () {
            if (this.type == 'list')
                return  this.parseList( this.$_View[0] );

            var $_List = $.ListView.findView( this.$_View ).filter('[name]');

            var $_DOM = this.$_View.find('*').not(
                    this.$_View.find('[src],  [href]:not(a, link, [target])')
                        .add( $_List ).find('*')
                );

            var $_Input = $_DOM.filter('[name]:input');

            for (var i = 0;  $_Input[i];  i++)
                this.pushMap(
                    $_Input[i].name || $_Input[i].getAttribute('name'),  $_Input[i]
                );

            $_DOM = $_DOM.add( this.$_View ).filter(function () {

                return  this.outerHTML.match( Node_Template.expression );
            });

            var $_Plain = $_DOM.not( $_List );

            for (var i = 0;  $_Plain[i];  i++)
                this.parsePlain( $_Plain[i] );

            for (var i = 0;  $_List[i];  i++)
                this.parseList( $_List[i] );

            return this;
        },
        load:          function () {
            var _This_ = this;

            this.$_Slot = this.$_View.is('body [href]:not(a, link, [target])') ?
                this.$_View.children().remove() : $();

            return  new Promise(function () {

                if (_This_.source)
                    _This_.$_View.load(_This_.source,  arguments[0]);
                else
                    arguments[0]( _This_.$_View[0].innerHTML );

            }).then(function () {

                var $_Slot = _This_.$_View.find('slot'),
                    $_Named = _This_.$_Slot.filter('[slot]');

                if ( $_Named[0] )
                    $_Slot.filter('[name]').replaceWith(function () {
                        return $_Named.filter(
                            '[slot="' + this.getAttribute('name') + '"]'
                        );
                    });

                $_Slot.not('[name]').replaceWith(_This_.$_Slot.not( $_Named ));
            });
        },
        data2Node:     function (iData) {
            var iMask = 0,  _This_ = this;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = iMask  |  this.map[ iName ];

            return  $.map(iMask.toString(2).split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {
            this.scope.extend( iData );

            iData = this.lastRender ? this.scope : $.extend(
                $.makeSet('', Object.keys(this.map)),  this.scope,  iData
            );

            var Last_Render = this.lastRender;

            var Render_Node = $.each(this.data2Node( iData ),  function () {

                    if (this instanceof Node_Template)
                        this.render( iData );
                    else if (this instanceof $.ListView) {
                        if (! Last_Render)
                            this.clear().render(
                                iData[ this.$_View[0].getAttribute('name') ]
                            );
                    } else
                        $( this )[
                            ('value' in this)  ?  'val'  :  'html'
                        ](
                            iData[this.name || this.getAttribute('name')]
                        );
                });

            this.lastRender = $.now();

            return Render_Node;
        },
        indexOf:       function (iNode) {
            for (var i = 0;  this[i];  i++)
                if (
                    (this[i] == iNode)  ||  (
                        (this[i] instanceof Node_Template)  &&  (
                            (iNode == this[i].ownerNode)  ||
                            (iNode == this[i].ownerNode.nodeName)
                        )
                    )
                )  return i;

            return -1;
        },
        getContext:    function (iNode) {
            var iContext = { },  iValue;

            for (var iKey in this.map) {
                iValue = this.scope[ iKey ];

                if (iNode  ?
                    (this.map[iKey] & HTML_Template.getMaskCode(
                        this.indexOf(iNode)
                    ))  :
                    ((iValue != null)  &&  (! $.likeArray(iValue)))
                )
                    iContext[ iKey ] = iValue;
            }

            return iContext;
        }
    });

    return HTML_Template;

})(self, self.document, self.jQuery, DS_Inherit, Node_Template);



var UI_Module = (function (BOM, DOM, $, HTML_Template, Node_Template) {

    function UI_Module(iLink) {
        this.ownerApp = iLink.ownerApp;
        this.source = iLink;

        this.$_View = iLink.getTarget();

        this.type = (this.$_View[0] == this.ownerApp.$_Root[0])  ?
            'page'  :  'module';
        this.name = this.$_View[0].getAttribute('name');

        if (! this.name) {
            this.name = $.uuid('EWA');
            this.$_View[0].setAttribute('name', this.name);
        }

        this.template = new HTML_Template(
            this.$_View,  this.getScope(),  iLink.getURL('href')
        );
        this.template.scope.extend( this.getEnv() );

        this.attach();

        this.lastLoad = 0;

        if (this.type == 'page')  this.ownerApp.register( this );
    }

    var Link_Key = $.makeSet('href', 'src');

    $.extend(UI_Module, {
        getClass:      $.CommonView.getClass,
        instanceOf:    $.CommonView.instanceOf,
        reload:        function (iTemplate) {
            for (var i = 0, iModule;  iTemplate[i];  i++)
                if (
                    (iTemplate[i] instanceof Node_Template)  &&
                    (iTemplate[i].ownerNode.nodeName in Link_Key)
                ) {
                    iModule = this.instanceOf(iTemplate[i].ownerElement, true);

                    if (! iModule)  continue;

                    iModule.loadJSON().then(function () {

                        iModule.lastLoad = iModule.template.lastRender = 0;

                        iModule.render( arguments[0] );
                    });
                }
        }
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
            this.$_View
                .data(this.constructor.getClass(), this)
                .data(HTML_Template.getClass(), this.template);

            if (this.$_Content) {
                this.$_View.append( this.$_Content );
                this.trigger('ready');
            } else if (this.lastLoad)
                this.load();

            return this;
        },
        getScope:      function () {
            return  (HTML_Template.instanceOf( this.source.$_DOM ) || '').scope;
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

            var $_Link = this.$_View.find( InnerLink.selector ).not('link, form');

            for (var i = 0;  $_Link[i] && (i < 5);  i++)
                (new InnerLink(this.ownerApp, $_Link[i])).prefetch();

            return this;
        },
        loadModule:    function () {
            var _This_ = this,  InnerLink = this.source.constructor;

            var $_Module = this.$_View
                    .find('*[href]:not(a, link), *[src]:not(:media, script)')
                    .not( InnerLink.selector );

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
            var _This_ = this;

            return (
                (this.source.getURL('src') || this.source.getURL('action'))  ?
                    this.source.loadData( this.template.scope )  :
                    Promise.resolve('')
            ).then(function (iData) {

                iData = _This_.trigger('data', [iData])  ||  iData;

                if (iData instanceof Array) {
                    var _Data_ = { };
                    _Data_[_This_.name] = iData;
                }

                return  _Data_ || iData;
            });
        },
        loadHTML:      function () {
            var _This_ = this;

            return  this.template.load().then(function () {

                _This_.trigger('template');

                _This_.template.parse();

                var $_Link = _This_.$_View.children('link[target="_blank"]');

                if (! $_Link.remove()[0])  return;

                _This_.template.render();
                _This_.template.lastRender = 0;

                var iLink = _This_.source;

                var iJSON = iLink.src || iLink.action;

                HTML_Template.extend(iLink.$_DOM[0], $_Link[0]);

                _This_.template.scope.extend( _This_.getEnv() );

                if (_This_.type == 'page')
                    iLink.register(iLink.ownerApp.length - 1);

                if ((! iJSON)  &&  (iLink.src || iLink.action))
                    return _This_.loadJSON();
            });
        },
        render:        function () {
            this.template.render( arguments[0] );

            this.lastLoad = $.now();
            this.domReady = null;

            this.prefetch().trigger('ready');

            return this.loadModule();
        },
        load:          function () {
            this.lastLoad = this.template.lastRender = 0;

            var _This_ = this;

            return  this.domReady = Promise.all([
                this.loadJSON(),  this.loadHTML()
            ]).then(function (_Data_) {
                _Data_ = _Data_[0] || _Data_[1];

                if (! _This_.$_View.find('[href][async="false"]')[0])
                    return _Data_;

                _This_.template.render(_Data_);
                _This_.template.lastRender = 0;

                return  _This_.loadModule().then(function () {
                    return _Data_;
                });
            }).then(function (_Data_) {

                return  _This_.$_View.children('script')[0] ?
                    _Data_ : _This_.render(_Data_);
            });
        }
    });

    return UI_Module;

})(self, self.document, self.jQuery, HTML_Template, Node_Template);



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
        prefetchRel:    $.browser.modern ? 'prefetch' : 'next'
    });

    var $_Prefetch = $('<link rel="' + InnerLink.prefetchRel + '" />')
            .on('load error',  function () {
                $(this).remove();
            });

    $.extend(InnerLink.prototype, {
        getTarget:    function () {
            switch (this.target) {
                case '_self':      return this.ownerApp.$_Root;
                case '_blank':     ;
                case '_parent':    ;
                case '_top':       return $();
            }

            return  this.target  ?
                $('*[name="' + this.target + '"]')  :  this.$_DOM;
        },
        getArgs:      function (Only_Param) {
            var iData = this.ownerView  ?  this.ownerView.template.scope  :  { };

            var iArgs = { };

            if (! Only_Param) {
                var iTemplate = HTML_Template.instanceOf( this.$_DOM );

                if ( iTemplate )
                    iArgs = iTemplate.getContext(this.src ? 'src' : 'action');
            }

            for (var iKey in this.data)
                iArgs[ this.data[iKey] ] = iData[ this.data[iKey] ];

            return iArgs;
        },
        getURL:       function (iName, iScope) {
            var iURL = this[iName] =
                    this.$_DOM[0].getAttribute(iName) || this[iName];

            if (! iURL)  return;

            if ((! iScope)  &&  this.ownerView)
                iScope = this.ownerView.template.scope;

            if (iScope  &&  iScope.isNoValue  &&  (! iScope.isNoValue())) {
                var _Args_ = { },  _Data_;

                for (var iKey in this.data) {
                    _Data_ = iScope[ this.data[iKey] ];

                    if ($.isData(_Data_))  _Args_[iKey] = _Data_;
                }

                iURL = $.extendURL(iURL, _Args_);
            }

            if ((iName != 'href')  &&  (! $.urlDomain(iURL || ' ')))
                iURL = this.ownerApp.apiPath + iURL;

            return iURL;
        },
        register:     function (Index) {
            DOM.title = this.title || DOM.title;

            BOM.history[this.ownerApp[Index] ? 'replaceState' : 'pushState'](
                {index: Index},
                DOM.title,
                '#!'  +  $.extendURL(this.href, this.getArgs())
            );

            return this;
        },
        loadData:     function (iScope) {
            var iOption = {type:  this.method};

            if (this.$_DOM[0].tagName != 'FORM')
                iOption.data = this.getArgs( true );
            else if (! this.$_DOM.find('input[type="file"]')[0])
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
            var iHTML = (this.href || '').split('?')[0];

            if (iHTML)
                $_Prefetch.clone(true).attr('href', iHTML).appendTo('head');

            if (
                (this.method == 'get')  &&
                this.src  &&  (this.src.indexOf('?') == -1)  &&
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

            iModule.template.scope.extend( $.paramJSON() );

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
        },
        component:       function ($_View, iFactory) {

            if (typeof $_View == 'function') {
                iFactory = $_View;
                $_View = '';
            }
            $_View = $($_View);

            var iModule = UI_Module.instanceOf($_View[0] ? $_View : this.$_Root);

            iModule.domReady.then(function (iData) {

                iModule.render(iFactory.call(iModule, iData)  ||  iData);
            });

            return this;
        }
    });

    return  $.fn.iWebApp = WebApp;

})(self, self.document, self.jQuery, UI_Module, InnerLink);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.3  (2016-12-21)  Beta
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

        var iLink = new InnerLink(new WebApp(), this);

        switch (iLink.target) {
            case null:        ;
            case '':          return;
            case '_blank':
                UI_Module.prototype.loadJSON.call({
                    ownerApp:    iLink.ownerApp,
                    source:      iLink,
                    template:    iLink.ownerView.template
                });
                break;
            case '_self':     ;
            default:          {
                var iModule = UI_Module.instanceOf( iLink.$_DOM );

                if (iModule  &&  (iModule.domReady instanceof Promise))
                    break;

                iModule = UI_Module.instanceOf(iLink.getTarget(), false);

                (((! iModule)  ||  (iModule.type == 'page'))  ?
                    (new UI_Module(iLink))  :  iModule
                ).load();
            }
        }
    });

/* ----- 视图数据监听 ----- */

    function No_Input(iEvent) {
        var iKey = iEvent.which;

        return  (iEvent.type == 'keyup')  &&  (
            iEvent.ctrlKey || iEvent.shiftKey || iEvent.altKey || (
                (iKey != 8)  &&  (iKey != 46)  &&  (
                    (iKey < 48)  ||  (iKey > 105)  ||
                    ((iKey > 90)  &&  (iKey < 96))
                )
            )
        );
    }

    function Data_Change() {
        var iName = this.getAttribute('name'),
            iTemplate = HTML_Template.instanceOf( this );

        if (No_Input( arguments[0] )  ||  (! iName)  ||  (! iTemplate))
            return;

        var iValue = $(this).value('name');

        try {
            iValue = eval( iValue );
        } catch (iError) { }

        iValue = (iValue != null)  ?  iValue  :  '';

        var iScope = iTemplate.scope.setValue(iName, iValue);

        while (iTemplate.scope !== iScope) {
            iTemplate = HTML_Template.instanceOf(
                iTemplate.$_View[0].parentElement
            );
            if (! iTemplate)  return;
        }

        UI_Module.reload( iTemplate.render() );
    }

    var Only_Change = ['select', 'textarea', '[designMode]'].concat(
            $.map([
                'hidden', 'radio', 'checkbox', 'number', 'search',
                'file', 'range', 'date', 'time', 'color'
            ],  function () {
                return  'input[type="' + arguments[0] + '"]';
            })
        ).join(', ');

    $(DOM)
        .on('change', Only_Change, Data_Change)
        .on(
            'keyup paste',
            ':input:not(:button, ' + Only_Change + ')',
            $.throttle( Data_Change )
        );

})(self, self.document, self.jQuery, WebApp, InnerLink, UI_Module, HTML_Template);


});
