(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+', 'MutationObserver'], arguments[0]);

})(function () {


var DS_Inherit = (function (BOM, DOM, $) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    $.extend(DataScope.prototype, {
        extend:       function (iData) {
            switch (true) {
                case  $.likeArray( iData ):          {
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

            return this;
        }
    });

    return Node_Template;

})(self, self.document, self.jQuery);



var HTML_Template = (function (BOM, DOM, $, DS_Inherit, Node_Template) {

    function HTML_Template($_View, iScope, iURL) {

        var iView = $.CommonView.call(this, $_View);

        if (iView !== this)  return iView;

        var iLV = $.ListView.findView(
                this.$_View.parent()[0]  ||  $('<div />').append( this.$_View )
            );
        this.type = iLV.filter( this.$_View )[0]  ?  'list'  :  'plain';

        this.scope = DS_Inherit(iScope,  { });

        this.init().source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;
    }

    var RAW_Tag = $.makeSet('CODE', 'XMP', 'TEMPLATE');

    return  $.inherit($.CommonView, HTML_Template, {
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
        }
    }, {
        push:          Array.prototype.push,
        init:          function () {
            Array.prototype.splice.call(this, 0, Infinity);

            this.map = { };

            this.lastRender = 0;

            return this;
        },
        parseSlot:     function () {
            this.$_Slot = this.$_View.is('body [href]:not(a, link, [target])') ?
                $( arguments[0] )  :  $();

            var $_Slot = this.$_View.find('slot'),
                $_Named = this.$_Slot.filter('[slot]');

            if ( $_Named[0] )
                $_Slot.filter('[name]').replaceWith(function () {
                    return $_Named.filter(
                        '[slot="' + this.getAttribute('name') + '"]'
                    );
                });

            $_Slot.not('[name]').replaceWith(this.$_Slot.not( $_Named ));
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
        pushMap:       function (iName, iNode) {

            if (this.indexOf( iNode )  >  -1)  return;

            iNode = HTML_Template.getMaskCode(this.push(iNode) - 1);

            iName = (typeof iName == 'string')  ?  [iName]  :  iName;

            for (var i = 0;  iName[i];  i++)
                this.map[iName[i]] = (this.map[iName[i]] || 0)  +  iNode;
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

            var $_Media = $.ListView.findView( iList );

            $_Media = $( iList ).find(':media:not(iframe)').not(
                $_Media.add( $_Media.find('*') )
            );
            var _This_ = this,
                iView = $[$_Media[0] ? 'GalleryView' : 'ListView']( iList );

            this.pushMap(
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
                        if (! Last_Render) {
                            var _Data_ = iScope[
                                    this.$_View[0].getAttribute('name')
                                ];
                            if ($.likeArray(_Data_))  this.clear().render(_Data_);
                        }
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
        renderDOM:     function (iDOM, iScope) {
            var _This_ = this;

            iScope = $.extend({ }, this.scope, iScope);

            return  $.map(HTML_Template.getTextNode( iDOM ),  function (iNode) {

                iNode = _This_[_This_.indexOf( iNode )];

                return  iNode  &&  iNode.render( iScope );
            });
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
})(self, self.document, self.jQuery, DS_Inherit, Node_Template);



var InnerLink = (function (BOM, DOM, $, HTML_Template) {

    function InnerLink(iApp, iLink) {
        this.ownerApp = iApp;

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
        getScope:      function () {
            return  (HTML_Template.instanceOf( this.$_DOM ) || '').scope;
        },
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
        register:     function () {
            BOM.history.pushState(
                {index:  arguments[0]},
                DOM.title = this.title || DOM.title,
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
        loadHTML:     function () {
            var iHTML = this.getURL('href');

            return  (! iHTML)  ?  Promise.resolve('')  :  Promise.resolve(
                $.ajax(iHTML,  {dataType: 'html'})
            );
        },
        loadJSON:     function () {
            var iJSON = this.getURL('src') || this.getURL('action');

            if (! iJSON)  return Promise.resolve('');

            var iOption = {type:  this.method};

            if (this.$_DOM[0].tagName != 'FORM')
                iOption.data = $.extend({ }, this.$_DOM[0].dataset);
            else if (! this.$_DOM.find('input[type="file"]')[0])
                iOption.data = this.$_DOM.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_DOM[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = this.method.toUpperCase() + ' ' + iJSON;

            return  Promise.resolve($.ajax(iJSON, iOption)).then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
        },
        load:         function () {
            return  Promise.all([this.loadHTML(), this.loadJSON()]);
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

})(self, self.document, self.jQuery, HTML_Template);



var Module_Argument = (function (BOM, DOM, $, Node_Template) {

    function Module_Argument(iSource, Exclude_Name) {

        this.callee = iSource;

        this.exclude = $.makeSet.apply($, Exclude_Name);

        this.length = 0;

        this.update();
    }

    $.extend(Module_Argument.prototype, {
        push:       function (iAttr) {

            if (! (iAttr.nodeName in this))
                this[ this.length++ ] = iAttr.nodeName;

            this[ iAttr.nodeName ] =
                (iAttr.nodeValue || '').match( Node_Template.expression )  ?
                    null  :  iAttr.nodeValue;

            return iAttr;
        },
        update:     function () {
            var _This_ = this;

            $.each(this.callee.attributes,  function () {
                if (! (
                    (this.nodeName in _This_.exclude)  ||
                    (this.nodeName in _This_.constructor.prototype)  ||
                    (($.propFix[this.nodeName] || this.nodeName)  in  _This_.callee)
                ))
                    _This_.push( this );
            });
        },
        valueOf:    function () {
            this.update();

            var iData = { };

            for (var i = 0;  this[i];  i++)  if (this[this[i]] != null)
                iData[ this[i] ] = this[ this[i] ];

            return iData;
        },
        observe:    function (iCallback) {
            var _This_ = this;

            if (typeof iCallback == 'function')
                this.observer = new self.MutationObserver(function () {

                    $.each(arguments[0],  function () {

                        var iNew = this.target.getAttribute( this.attributeName ),
                            iOld = this.oldValue;

                        if (
                            (iNew != iOld)  &&
                            (! (iOld || '').match( Node_Template.expression ))
                        )
                            iCallback.apply(_This_.push( this.target ), [
                                this,  this.attributeName,  iNew,  iOld
                            ]);
                    });
                });

            if ( this.observer )
                this.observer.observe(this.callee, {
                    attributes:           true,
                    attributeOldValue:    true,
                    attributeFilter:      $.makeArray( this )
                });

            return this;
        },
        destructor:    function () {
            this.observer.disconnect();
        }
    });

    return Module_Argument;

})(self, self.document, self.jQuery, Node_Template);



var UI_Module = (function (BOM, DOM, $, HTML_Template, Module_Argument, Node_Template, InnerLink) {

    function UI_Module(iLink, iScope) {

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

        this.arguments = new Module_Argument(this.$_View[0], [
            'target', 'href', 'src', 'method', 'title', 'autofocus',
            'name', 'async'
        ]);
        (
            this.template = new HTML_Template(
                this.$_View,  iScope || this.source.getScope()
            )
        ).scope.extend( this.getEnv() ).extend( this.valueOf() );

        this.arguments.observe(function (_, iKey, iNew, iOld) {

            if (! (iOld != null))  return;

            var iData = { };  iData[iKey] = Node_Template.safeEval( iNew );

            iView.constructor.reload(iView.template.render( iData ));
        });

        this.length = this.lastLoad = 0;
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

                    if ( iModule )
                        iModule.source.loadJSON().then(function () {

                            iModule.template.lastRender = 0;

                            iModule.render(iModule.loadJSON( arguments[0] ));
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
        findSub:       function () {
            var $_Sub = this.$_View.find( UI_Module.selector )
                    .not( InnerLink.selector );

            $_Sub = $($.map($_Sub,  function (_This_, Index) {

                if (! (Index  &&  $.contains($_Sub[Index - 1], _This_)))
                    return _This_;
            }));

            var _This_ = this;

            $.extend(this,  $.map($_Sub,  function () {
                return  new UI_Module(
                    new InnerLink(_This_.ownerApp, arguments[0])
                );
            }));
            this.length = $_Sub.length;

            return $_Sub;
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
        syncLoad:      function ($_Link) {
            this.template.parsePlain( $_Link[0] );
            this.template.renderDOM( $_Link[0] );

            $_Link = $_Link[0].attributes;

            var iLink = this.source;

            for (var i = 0;  $_Link[i];  i++)
                if ($_Link[i].nodeName != 'target')
                    iLink.$_DOM[0].setAttribute(
                        $_Link[i].nodeName,  $_Link[i].nodeValue
                    );

            var iJSON = iLink.src || iLink.action;

            this.template.scope.extend( this.getEnv() );

            if (this.type == 'page') {
                iLink.$_DOM = [
                    $( $_Link[0].ownerElement ),  $_Link = iLink.$_DOM
                ][0];

                this.ownerApp.register( this ).source.$_DOM.remove();

                this.registered = true;

                iLink.$_DOM = $_Link;
            }

            return  ((! iJSON)  &&  iLink.src)  ?
                this.source.loadJSON()  :  Promise.resolve('');
        },
        attach:        function () {
            this.$_View
                .data(this.constructor.getClass(), this)
                .data(HTML_Template.getClass(), this.template);

            this.arguments.observe();

            if ( this.$_Content )
                return  this.$_View.append( this.$_Content )
                    .toggleAnimate('active', this).then(function (_This_) {

                        _This_.$_Content = null;

                        _This_.emit('ready');
                    });
        },
        detach:        function () {
            return  this.$_View.toggleAnimate('active', this)
                .then(function (_This_) {

                    _This_.$_Content = _This_.$_View.children().detach();

                    _This_.arguments.destructor();

                    _This_.$_View
                        .data(_This_.constructor.getClass(), null)
                        .data(HTML_Template.getClass(), null);

                    return _This_;
                });
        },
        destructor:    function () {
            return  (this.$_Content ? Promise.resolve('') : this.detach())
                .then(function (_This_) {

                    if ( _This_.$_Content ) {
                        _This_.$_Content.remove();
                        _This_.$_Content = null;
                    }
                });
        },
        loadHTML:      function () {

            var _This_ = this,  $_Slot = this.$_View.children().detach();

            return  this.$_View.htmlExec( arguments[0] ).then(function () {

                _This_.template.parseSlot( $_Slot );

                _This_.emit('template');

                var $_Link = _This_.$_View.children('link[target="_blank"]');

                return  $_Link[0]  &&  _This_.syncLoad( $_Link );

            }).then($.proxy($.fn.toggleAnimate, this.$_View, 'active'));
        },
        loadJSON:      function (iData) {

            iData = this.emit('data', [iData])  ||  iData;

            if (iData instanceof Array) {
                var _Data_ = { };
                _Data_[this.name] = iData;
            }

            return  _Data_ || iData;
        },
        loadModule:    function (iScope) {
            var _This_ = this;

            return  Promise.all($.map(this,  function (iModule) {
                if (
                    (_This_.lastLoad && iModule.async)  ||
                    !(_This_.lastLoad || iModule.async)
                ) {
                    if (! iModule.async) {
                        _This_.template.parsePlain( iModule.$_View[0] );
                        _This_.template.renderDOM(iModule.$_View[0], iScope);
                    }

                    return  iModule.source.load().then(function () {

                        return  iModule.load(arguments[0][1], arguments[0][0]);
                    });
                }
            })).then(function () {  return iScope;  });
        },
        prefetch:      function () {
            var $_Link = this.$_View.find( InnerLink.selector ).not('link, form');

            for (var i = 0;  $_Link[i] && (i < 5);  i++)
                (new InnerLink(this.ownerApp, $_Link[i])).prefetch();

            return this;
        },
        render:        function () {
            this.template.parse( this.$_Sub );
            delete this.$_Sub;

            this.template.render( arguments[0] );

            for (var i = 0;  this[i];  i++)  if (! this[i].async) {

                this[i].template.lastRender = 0;
                this[i].render();
            }

            if (! this.lastLoad)  this.prefetch();

            this.lastLoad = $.now();
            this.domReady = null;

            this.emit('ready');

            return this.loadModule();
        },
        load:          function (iData, iHTML) {

            var _This_ = this,  DOM_Ready = this.promise();

            return  (iHTML  ?  this.loadHTML( iHTML )  :  Promise.resolve(''))
                .then(function (_Data_) {

                    _This_.lastLoad = _This_.template.lastRender = 0;

                    _This_.$_Sub = _This_.findSub();

                    return  _This_.loadJSON(_Data_ || iData);

                }).then($.proxy(this.loadModule, this)).then(function (_Data_) {

                    if (! _This_.$_View.children('script')[0]) {

                        delete _This_.domReady;
                        return _Data_;
                    }

                    _This_.resolve(_Data_);

                    return DOM_Ready;

                }).then($.proxy(this.render, this));
        },
        promise:       function () {
            var _This_ = this;

            var DOM_Ready = new Promise(function () {

                    _This_.domReady = $.makeArray( arguments );
                });

            this.curry = $.curry(function (iData, iFactory) {

                if (typeof iData == 'function')
                    iData = [iFactory,  iFactory = iData][0];

                try {
                    _This_.domReady[0](iFactory.call(_This_, iData)  ||  iData);
                } catch (iError) {
                    _This_.domReady[1]( iError );
                }
            });

            return DOM_Ready;
        },
        resolve:       function () {
            if ( this.curry )  this.curry = this.curry( arguments[0] );

            if (! this.curry)  delete this.domReady;
        }
    });
})(self, self.document, self.jQuery, HTML_Template, Module_Argument, Node_Template, InnerLink);



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

            if (! _This_[Index])  return;

            _This_.hashChange = false;

            if (_This_.lastPage == Index)  return;

            var iPage = _This_[Index];

            _This_[_This_.lastPage].detach().then(
                $.proxy(iPage.attach, iPage)
            ).then(function () {

                _This_.lastPage = Index

                if ((! iPage.$_View.children()[0])  &&  iPage.lastLoad)
                    return  _This_.bootLink( iPage.source );

                DOM.title = iPage.source.title || DOM.title;
            });
        }).on('hashchange',  function () {

            if (_This_.hashChange !== false)  _This_.loadLink();

            _This_.hashChange = null;
        });

        this.init();
    }

    $.fn.iWebApp = $.inherit($.Observer, WebApp, null, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        loadLink:    function () {
            var iURL = (arguments[0] || BOM.location).hash.match(/^#!([^#!]+)/);

            return  iURL  &&  this.load( iURL[1] );
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
        },
        register:    function (iPage) {

            if (++this.lastPage != this.length)
                $.each(this.splice(this.lastPage, Infinity),  iPage.destructor);

            iPage.source.register( this.length );
            this.push( iPage );

            var iTimeOut = $.now()  -  (1000 * 60 * this.cacheMinute);

            for (var i = 0;  this[i + 2];  i++)
                if (this[i].lastLoad < iTimeOut)  this[i].destructor();

            return iPage;
        },
        bootLink:    function (iLink, iPrev) {
            var _This_ = this,
                not_Page = (this.$_Root[0] !== (
                    (iPrev || '').$_View  ||  iLink.getTarget()
                )[0]);

            return  iLink.load().then(function () {

                var iHTML = arguments[0][0],  iJSON = arguments[0][1];

                if ( not_Page )
                    return  (new UI_Module( iLink )).load(iJSON, iHTML);

                var iScope = iLink.getScope(),  iNext;

                return  (iPrev ? iPrev.detach() : Promise.resolve(''))
                    .then(function () {

                        iNext = new UI_Module(iLink, iScope);

                        return  iNext.load(iJSON, iHTML);

                    }).then(function () {

                        if (! iNext.registered)  _This_.register( iNext );

                    },  function () {

                        return iNext.destructor().then(
                            iPrev  ?  $.proxy(iPrev.attach, iPrev)  :  $.noop
                        );
                    });
            });
        },
        init:        function () {
            var iModule = new UI_Module(new InnerLink(this, DOM.body));

            iModule.template.scope.extend( $.paramJSON() );

            this.bootLink( iModule.source ).then(function () {

                if (! iModule.ownerApp.loadLink()) {
                    var iAuto = $('body *[autofocus]:not(:input)')[0];

                    if ( iAuto )  iAuto.click();
                }
            });
        },
        boot:        function (iLink) {
            iLink = new InnerLink(this, iLink);

            var _This_ = this;

            switch (iLink.target) {
                case null:        ;
                case '':          break;
                case '_blank':
                    iLink.loadJSON().then(function () {
                        _This_.trigger(
                            'data',
                            iLink.href || '',
                            iLink.src || iLink.action || '',
                            [iLink, arguments[0]]
                        );
                    });
                    break;
                case '_self':     ;
                default:          {
                    var iModule = UI_Module.instanceOf(iLink.getTarget(), false);

                    if (! (iModule || '').domReady)
                        this.bootLink(iLink, iModule).catch(function () {

                            console.error( arguments[0] );
                        });
                }
            }

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

            if (iModule.domReady  &&  (typeof iFactory == 'function'))
                iModule.resolve( iFactory );

            return iModule;
        }
    });
})(self, self.document, self.jQuery, UI_Module, HTML_Template, Node_Template, InnerLink, WebApp);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.5  (2017-02-24)  Beta
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

    $.ajaxSetup({
        dataType:    'json',
        timeout:     30 * 1000
    });


/* ----- SPA 链接事件 ----- */

    $(DOM).on('click',  'a[href]:not(a[target="_blank"])',  function () {

        if (this.href.split('#')[0] != DOM.URL.split('#')[0])
            return  this.target = '_blank';

        arguments[0].preventDefault();

        $().iWebApp().loadLink( this );

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
                'range', 'date', 'time', 'color'
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
