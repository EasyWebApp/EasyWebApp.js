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

    $.extend(DataScope.prototype, {
        extend:       function (iData) {
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
        setValue:     function (iName) {
            var iScope = this,  _Parent_;

            while (! (
                $.isEmptyObject(iScope)  ||  iScope.hasOwnProperty(iName)
            )) {
                _Parent_ = Object.getPrototypeOf( iScope );

                if (_Parent_ === DataScope.prototype) {
                    iScope = this;
                    break;
                }
                iScope = _Parent_;
            }

            iScope[iName] = arguments[1];

            return iScope;
        },
        valueOf:      function () {
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
        isNoValue:    function () {
            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    return false;

            return true;
        }
    });

    return  function (iSup, iSub) {

        return Object.create(
            (iSup instanceof DataScope)  ?  iSup  :  DataScope.prototype
        ).extend( iSub );
    };

})(self, self.document, self.jQuery);



var Node_Template = (function (BOM, DOM, $) {

    function Node_Template(iNode) {
        this.ownerNode = iNode;

        this.name = iNode.nodeName;
        this.raw = iNode.nodeValue;

        this.ownerElement = iNode.parentNode || iNode.ownerElement;
    }

    $.extend(Node_Template, {
        eval:          function () {
            'use strict';
            try {
                var iValue = eval( arguments[0] );

                return  (iValue != null)  ?  iValue  :  '';
            } catch (iError) {
                return '';
            }
        },
        safeEval:      function (iValue) {
            if ((typeof iValue == 'string')  &&  (iValue[0] == '0')  &&  iValue[1])
                return iValue;

            return  (iValue && this.eval(iValue))  ||  iValue;
        },
        expression:    /\$\{([\s\S]+?)\}/g,
        reference:     /this\.(\w+)/g
    });

    var ES_ST = Node_Template.eval('`1`');

    $.extend(Node_Template.prototype, {
        eval:        function (iContext) {
            return  ES_ST ?
                Node_Template.eval.call(iContext,  '`' + this.raw + '`')  :
                this.raw.replace(Node_Template.expression,  function () {

                    return  Node_Template.eval.call(iContext, arguments[1]);
                });
        },
        getRefer:    function () {
            var iRefer = [ ];

            this.ownerNode.nodeValue = this.raw.replace(
                Node_Template.expression,  function () {
                    arguments[1].replace(
                        Node_Template.reference,  function (_, iKey) {

                            if (iRefer.indexOf(iKey) < 0)  iRefer.push( iKey );
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
                    iParent[ this.name ] = Node_Template.safeEval( iValue );

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

        this.type = (
            $.ListView.findView( this.$_View.parent() ).filter( this.$_View )[0]  ?
                'list'  :  'plain'
        );
        this.scope = DS_Inherit(iScope,  { });

        this.init().source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;
    }

    var RAW_Tag = $.makeSet('CODE', 'XMP', 'TEMPLATE');

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
                        (! (iNode.parentNode.tagName in RAW_Tag))  &&
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
        init:          function () {
            Array.prototype.splice.call(this, 0, Infinity);

            this.map = { };

            this.lastRender = 0;

            return this;
        },
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
        parse:         function ($_Exclude) {
            if (this.type == 'list')
                return  this.parseList( this.$_View[0] );

            $_Exclude = $( $_Exclude );

            var $_List = $.ListView.findView( this.$_View ).filter('[name]').not(
                    $_Exclude.add($.map($_Exclude,  function () {

                        return  $.makeArray($.ListView.findView( arguments[0] ));
                    }))
                );
            var $_DOM = this.$_View.find('*').not(
                    $_List.add( $_Exclude ).find('*')
                );

            var $_Input = $_DOM.filter('[name]:input').not(function () {
                    return (
                        this.defaultValue || this.getAttribute('value') || ''
                    ).match( Node_Template.expression );
                });

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
                    _This_.init().$_View.load(_This_.source,  arguments[0]);
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
            var iMask = '0',  _This_ = this;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.map[ iName ]);

            return  $.map(iMask.split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {
            var iScope = this.scope.extend( iData ),
                Last_Render = this.lastRender;

            if ( Last_Render )
                iData = iData || this.scope;
            else {
                iScope = $.extend(
                    $.makeSet('', Object.keys(this.map)),  this.scope
                );
                iData = this.map;
            }

            var Render_Node = $.each(this.data2Node( iData ),  function () {

                    if (this instanceof Node_Template)
                        this.render( iScope );
                    else if (this instanceof $.ListView) {
                        if (! Last_Render)
                            this.clear().render(
                                iScope[ this.$_View[0].getAttribute('name') ]
                            );
                    } else
                        $( this )[
                            ('value' in this)  ?  'val'  :  'html'
                        ](
                            iScope[this.name || this.getAttribute('name')]
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
        contextOf:     function (iNode) {
            var iContext = { },  iValue;

            for (var iKey in this.map) {
                iValue = this.scope[ iKey ];

                if (iNode  ?
                    parseInt($.bitOperate(
                        '&', this.map[iKey], HTML_Template.getMaskCode(
                            this.indexOf(iNode)
                        )
                    ), 2)  :
                    ((iValue != null)  &&  (! $.likeArray(iValue)))
                )
                    iContext[ iKey ] = iValue;
            }

            return iContext;
        },
        valueOf:       function (iScope) {
            if (! iScope)  return this;

            var iTemplate = this;

            while (iTemplate.scope !== iScope) {
                iTemplate = HTML_Template.instanceOf(
                    iTemplate.$_View[0].parentElement
                );
                if (! iTemplate)  return this;
            }

            return iTemplate;
        }
    });

    return HTML_Template;

})(self, self.document, self.jQuery, DS_Inherit, Node_Template);



var UI_Module = (function (BOM, DOM, $, HTML_Template, Node_Template) {

    function UI_Module(iLink) {

        var iView = $.CommonView.call(this, iLink.getTarget());

        iView.source = iLink;

        if (iView !== this)  return iView;

        this.ownerApp = iLink.ownerApp;

        this.type = (this.$_View[0] == this.ownerApp.$_Root[0])  ?
            'page'  :  'module';
        this.async = (this.$_View[0].getAttribute('async') != 'false');

        this.name = this.$_View[0].getAttribute('name');

        if (! this.name) {
            this.name = $.uuid('EWA');
            this.$_View[0].setAttribute('name', this.name);
        }

        if (! iLink.href)
            this.template = HTML_Template.instanceOf(this.$_View, false);

        if (! this.template)
            this.template = new HTML_Template(
                this.$_View,  this.getScope(),  iLink.getURL('href')
            );

        this.template.scope.extend( this.getEnv() );

        this.attach();

        this.length = this.lastLoad = 0;

        if (this.type == 'page')  this.ownerApp.register( this );
    }

    var Link_Key = $.makeSet('href', 'src');

    return  $.inherit($.CommonView, UI_Module, {
        reload:      function (iTemplate) {
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
        },
        selector:    '*[href]:not(a, link), *[src]:not(:media, script)'
    }, {
        emit:          function () {
            var iArgs = [
                    arguments[0],
                    this.source.href || '',
                    this.source.src || this.source.action || '',
                    [ this.source ].concat( arguments[1] )
                ];

            return  this.trigger.apply(this, iArgs).concat(
                this.trigger.apply(this.ownerApp, iArgs)
            )[0];
        },
        attach:        function () {
            this.$_View.data(HTML_Template.getClass(), this.template);

            if (this.$_Content) {
                this.$_View.append( this.$_Content );
                this.emit('ready');
            } else if (this.lastLoad)
                this.load();

            return this;
        },
        detach:        function () {
            this.$_Content = this.$_View.children().detach();

            return this;
        },
        destructor:    function () {
            if ( this.$_Content ) {
                this.$_Content.remove();
                this.$_Content = null;
            }
            this.$_View
                .data(this.constructor.getClass(), null)
                .data(HTML_Template.getClass(), null);

            return this;
        },
        findSub:       function () {
            var _This_ = this,  InnerLink = this.source.constructor;

            var $_Sub = this.$_View.find( UI_Module.selector )
                    .not( InnerLink.selector );

            $_Sub = $($.map($_Sub,  function (_This_, Index) {

                if (! (Index  &&  $.contains($_Sub[Index - 1], _This_)))
                    return _This_;
            }));

            $.extend(this,  $.map($_Sub,  function () {
                return  new UI_Module(
                    new InnerLink(_This_.ownerApp, arguments[0])
                );
            }));
            this.length = $_Sub.length;

            return $_Sub;
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
            var _This_ = this;

            return  Promise.all($.map(this,  function (iModule) {
                return (
                    (_This_.lastLoad && iModule.async)  ||
                    !(_This_.lastLoad || iModule.async)
                ) ?
                    iModule.load() : null;
            }));
        },
        loadJSON:      function () {
            var _This_ = this;

            return (
                (this.source.getURL('src') || this.source.getURL('action'))  ?
                    this.source.loadData()  :  Promise.resolve('')
            ).then(function (iData) {

                iData = _This_.emit('data', [iData])  ||  iData;

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

                _This_.emit('template');

                var $_Sub = _This_.findSub();

                if (! _This_.template[0])  _This_.template.parse( $_Sub );

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

            this.prefetch().emit('ready');

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
        getArgs:      function () {
            var iArgs = { },  iTemplate = HTML_Template.instanceOf( this.$_DOM );

            if ( iTemplate )
                iArgs = iTemplate.contextOf(this.src ? 'src' : 'action');

            return  $.extend(iArgs, this.$_DOM[0].dataset);
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
        getURL:       function (iName) {
            var iURL = this[iName] =
                    this.$_DOM[0].getAttribute(iName) || this[iName];

            if ( iURL ) {
                if ((iName != 'href')  &&  (! $.urlDomain(iURL || ' ')))
                    iURL = this.ownerApp.apiPath + iURL;

                return iURL;
            }
        },
        loadData:     function () {
            var iOption = {type:  this.method};

            if (this.$_DOM[0].tagName != 'FORM')
                iOption.data = $.extend({ }, this.$_DOM[0].dataset);
            else if (! this.$_DOM.find('input[type="file"]')[0])
                iOption.data = this.$_DOM.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_DOM[0] );
                iOption.contentType = iOption.processData = false;
            }

            return  $.ajax(this.getURL('src') || this.getURL('action'),  iOption);
        },
        prefetch:     function () {
            var iHTML = (this.href || '').split('?')[0];

            if (iHTML)
                $_Prefetch.clone(true).attr('href', iHTML).appendTo('head');

            if (
                (this.method == 'get')  &&
                this.src  &&  (this.src.indexOf('?') == -1)  &&
                $.isEmptyObject( this.$_DOM[0].dataset )
            )
                $_Prefetch.clone(true).attr(
                    'href',  this.getURL('src') || this.getURL('action')
                ).appendTo('head');
        }
    });

    return InnerLink;

})(self, self.document, self.jQuery, UI_Module, HTML_Template);



var WebApp = (function (BOM, DOM, $, UI_Module, InnerLink) {

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

        $(BOM).on('popstate',  function () {

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

    $.fn.iWebApp = $.inherit($.Observer, WebApp, {
        getRoute:    function () {
            var iHash = BOM.location.hash.match(/^#!([^#!]+)/);
            return  iHash && iHash[1];
        }
    }, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        init:        function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            var iLink = iModule.source,  _This_ = this;

            iModule.template.scope.extend( $.paramJSON() );

            iModule.findSub();

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
        register:    function (iPage) {
            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                $.each(this.splice(this.lastPage, Infinity),  iPage.destructor);

            this.hashChange = false;
            iPage.source.register( this.length );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  this[i + 2];  i++)
                if ((this[i].lastLoad < iTimeOut)  &&  this[i].$_Content) {

                    this[i].$_Content.remove();
                    this[i].$_Content = null;
                }
        },
        boot:        function (iLink) {
            iLink = new InnerLink(this, iLink);

            switch (iLink.target) {
                case null:        ;
                case '':          break;
                case '_blank':
                    $.extend(Object.create( UI_Module.prototype ),  {
                        ownerApp:    this,
                        source:      iLink,
                        template:    iLink.ownerView.template
                    }).loadJSON();
                    break;
                case '_self':     ;
                default:          {
                    var iModule = UI_Module.instanceOf(iLink.getTarget(), false);

                    if ( iModule ) {
                        if ( iModule.domReady )  break;

                        if ( iLink.href )  iModule.destructor();
                    }

                    (new UI_Module(iLink)).load();
                }
            }

            return this;
        },
        load:        function (HTML_URL, $_Sibling) {
            $('<span />',  $.extend(
                {style: 'display: none'},
                (typeof HTML_URL == 'object')  ?  HTML_URL  :  {
                    target:    '_self',
                    href:      HTML_URL
                }
            )).appendTo($_Sibling || 'body').click();

            return this;
        }
    });

    WebApp.fn = WebApp.prototype;

    return WebApp;

})(self, self.document, self.jQuery, UI_Module, InnerLink);



var Helper_API = (function (BOM, DOM, $, UI_Module, HTML_Template, Node_Template, InnerLink, WebApp) {

    $.extend(UI_Module.prototype, {
        update:       function (iName, iValue) {
            var iTemplate = this.template;

            if (iName instanceof HTML_Template) {
                iTemplate = iName;
                iName = iValue;
                iValue = arguments[2];
            }

            var iData = { };
            iData[iName] = Node_Template.safeEval( iValue );

            UI_Module.reload(
                iTemplate.valueOf(
                    iTemplate.scope.setValue(iName, iData[iName])
                ).render( iData )
            );

            return this;
        },
        bind:         function (iType, $_Sub, iCallback) {

            $_Sub = new UI_Module(new InnerLink(
                this.ownerApp,  this.$_View.find( $_Sub )[0]
            ));

            var iHTML = ($_Sub.source.href || '').split('?')[0]  ||  '',
                iJSON = ($_Sub.source.src || '').split('?')[0]  ||  '';

            return  $_Sub.off(iType, iHTML, iJSON, iCallback)
                .on(iType, iHTML, iJSON, iCallback);
        },
        getParent:    function () {
            return  UI_Module.instanceOf( this.$_View[0].parentNode );
        }
    });

    $.extend(WebApp.prototype, {
        getModule:    function () {
            return  UI_Module.instanceOf(arguments[0] || this.$_Root);
        },
        component:    function ($_View, iFactory) {
            switch (typeof $_View) {
                case 'string':
                    $_View = $('[href*="' + $_View + '.htm"]',  document.body);
                    break;
                case 'function':    {
                    iFactory = $_View;
                    $_View = null;
                }
                default:            $_View = $( $_View );
            }

            var iModule = $_View[0]  ?
                    (new UI_Module(new InnerLink(this, $_View[0])))  :
                    this.getModule();

            if (typeof iFactory == 'function')
                iModule.domReady.then(function (iData) {

                    iModule.render(iFactory.call(iModule, iData)  ||  iData);
                });

            return iModule;
        }
    });
})(self, self.document, self.jQuery, UI_Module, HTML_Template, Node_Template, InnerLink, WebApp);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.3  (2017-01-18)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
//



var EasyWebApp = (function (BOM, DOM, $, InnerLink, UI_Module, HTML_Template) {

    $.ajaxSetup({dataType: 'json'});


/* ----- SPA 链接事件 ----- */

    $(DOM).on('click',  'a[href]:not(a[target="_blank"])',  function () {

        var iURL = this.href.split('#');

        if (iURL[0] != DOM.URL.split('#')[0])
            return  this.target = '_blank';

        arguments[0].preventDefault();

        iURL = (iURL[1][0] == '!')  &&  iURL[1].slice(1);

        if (iURL)  $().iWebApp().load(iURL);

    }).on('click submit',  InnerLink.selector,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')  return;

            iEvent.preventDefault();
        } else if ( iEvent.isPseudo() )
            return;

        iEvent.stopPropagation();

        $().iWebApp().boot( this );
    });

/* ----- 视图数据监听 ----- */

    var Only_Change = $.map(['select', 'textarea', '[designMode]'].concat(
            $.map([
                'hidden', 'radio', 'checkbox', 'number', 'search',
                'file', 'range', 'date', 'time', 'color'
            ],  function () {
                return  'input[type="' + arguments[0] + '"]';
            })
        ),  function () {  return  arguments[0] + '[name]';  }).join(', ');

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
        var iTemplate = HTML_Template.instanceOf( this );

        if (iTemplate  &&  (! No_Input( arguments[0] )))
            UI_Module.instanceOf( this ).update(
                iTemplate,  this.getAttribute('name'),  $(this).value('name')
            );
    }

    $(DOM).on('change', Only_Change, Data_Change)
        .on(
            $.browser.mobile ? 'input' : 'keyup paste',
            ':field:not(' + Only_Change + ')',
            $.throttle( Data_Change )
        );

})(self, self.document, self.jQuery, InnerLink, UI_Module, HTML_Template);


});
