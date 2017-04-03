(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebApp', ['iQuery+', 'MutationObserver'], arguments[0]);

})(function () {


var Observer = (function (BOM, DOM, $) {

    function Observer() {
        this.__handle__ = { };

        return this;
    }

    $.extend(Observer, {
        getEvent:    function (iEvent) {
            return $.extend(
                { },
                (typeof iEvent == 'string')  ?  {type: iEvent}  :  iEvent,
                arguments[1]
            );
        },
        match:       function (iEvent, iHandle) {
            var iRegExp;

            for (var iKey in iHandle) {

                iRegExp = iEvent[iKey] instanceof RegExp;

                switch ($.Type( iHandle[iKey] )) {
                    case 'RegExp':
                        if ( iRegExp ) {
                            if (iEvent[iKey].toString() != iHandle[iKey].toString())
                                return;
                            break;
                        }
                    case 'String':    {
                        if (! (iEvent[iKey] || '')[iRegExp ? 'test' : 'match'](
                            iHandle[iKey]
                        ))
                            return;
                        break;
                    }
                    case 'Function':
                        if (typeof iEvent[iKey] != 'function')  break;
                    default:
                        if (iEvent[iKey] !== iHandle[iKey])  return;
                }
            }

            return iHandle;
        }
    });

    $.extend(Observer.prototype, {
        on:      function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        emit:    function (iEvent, iData) {

            iEvent = Observer.getEvent( iEvent );

            return  (this.__handle__[iEvent.type] || [ ]).reduce(
                $.proxy(function (_Data_, iHandle) {

                    if (! Observer.match(iEvent, iHandle))  return _Data_;

                    var iResult = iHandle.handler.call(this, iEvent, _Data_);

                    return  (iResult != null)  ?  iResult  :  _Data_;

                },  this),
                iData
            );
        },
        off:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],  function (iHandle) {

                    return  Observer.match(iEvent, iHandle)  ?  null  :  iHandle;
                }
            );

            return this;
        },
        one:     function () {

            var _This_ = this,  iArgs = $.makeArray( arguments );

            var iCallback = iArgs.slice(-1)[0];

            iCallback = (typeof iCallback == 'function')  &&  iArgs.pop();

            var iPromise = new Promise(function (iResolve) {

                    _This_.on.apply(_This_,  iArgs.concat(function () {

                        _This_.off.apply(_This_,  iArgs.concat( arguments.callee ));

                        if ( iCallback )  return  iCallback.apply(this, arguments);

                        iResolve( arguments[1] );
                    }));
                });

            return  iCallback ? this : iPromise;
        }
    });

    return Observer;

})(self, self.document, self.jQuery);



var DS_Inherit = (function (BOM, DOM, $) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    $.extend(DataScope.prototype, {
        extend:     function (iData) {

            if ($.likeArray( iData ))
                Array.prototype.splice.apply(
                    this,  Array.prototype.concat.apply([0, Infinity],  iData)
                );
            else if (! $.isEmptyObject(iData))
                $.extend(this, iData);

            return this;
        },
        valueOf:    function () {

            if (this.hasOwnProperty('length'))  return $.makeArray(this);

            var iValue = { };

            for (var iKey in this)
                if (this.hasOwnProperty( iKey )  &&  (! $.isNumeric(iKey)))
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        clear:      function () {

            if (this.hasOwnProperty('length'))  this.extend([ ]);

            for (var iKey in this)  if (this.hasOwnProperty( iKey )) {

                if ($.likeArray( this[iKey] ))
                    this[iKey].length = 0;
                else
                    this[iKey] = '';
            }

            return this;
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

    function Eval(vm) {
        'use strict';

        try {
            var iValue = eval( arguments[1] );

            return  (iValue != null)  ?  iValue  :  '';
        } catch (iError) {
            return '';
        }
    }

    $.extend(Node_Template, {
        safeEval:      function (iValue) {

            switch (typeof iValue) {
                case 'string':
                    if ((iValue[0] != '0')  ||  (! iValue[1]))  break;
                case 'function':
                    return  $.proxy(iValue, this);
            }

            return  (iValue  &&  Eval('', iValue))  ||  iValue;
        },
        expression:    /\$\{([\s\S]+?)\}/g,
        reference:     /(this|vm)\.(\w+)/g
    });

    $.extend(Node_Template.prototype, {
        eval:        function (iContext, iScope) {
            var iRefer;

            var iText = this.raw.replace(Node_Template.expression,  function () {

                    iRefer = Eval.call(iContext, iScope, arguments[1]);

                    return  (arguments[0] == arguments[3])  ?
                        arguments[3]  :  iRefer;
                });

            return  (this.raw == iText)  ?  iRefer  :  iText;
        },
        getRefer:    function () {
            var iRefer = { };

            this.ownerNode.nodeValue = this.raw.replace(
                Node_Template.expression,  function () {

                    arguments[1].replace(Node_Template.reference,  function () {

                        iRefer[ arguments[2] ] = 1;
                    });

                    return '';
                }
            );

            return  Object.keys( iRefer );
        },
        render:      function (iContext, iScope) {

            var iValue = this.eval(iContext, iScope),
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
                    iParent[ this.name ] = Node_Template.safeEval.call(
                        iContext,  iValue
                    );
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



var View = (function (BOM, DOM, $, DS_Inherit, MutationObserver, Node_Template, Observer) {

    function View($_View, iScope) {

        if (this.constructor == arguments.callee)
            throw TypeError(
                "View() is an Abstract Base Class which can't be instantiated."
            );

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.constructor.instanceOf(this.$_View, false);

        return  ((_This_ != null)  &&  (_This_ != this))  ?
            _This_  :
            $.extend(this, {
                __id__:       $.uuid('View'),
                __name__:     this.$_View[0].name || this.$_View[0].dataset.name,
                __data__:     DS_Inherit(iScope, { }),
                __child__:    [ ]
            }).attach();
    }

    $.extend(View.prototype, {
        toString:      function () {

            var iName = this.constructor.name;

            return  '[object ' + (
                (typeof iName == 'function')  ?  this.constructor.name()  :  iName
            )+ ']';
        },
        watch:         function (iKey) {
            var _This_ = this;

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {
                        if (_This_.__data__.hasOwnProperty( iKey ))
                            return _This_.__data__[iKey];
                    },
                    set:    function () {
                        _This_.render(iKey, arguments[0]);
                    }
                });
        },
        extend:        function (iData) {

            for (var iKey in iData)
                if (iData.hasOwnProperty( iKey )) {

                    this.__data__[iKey] = iData[iKey];

                    this.watch( iKey );
                }

            return this.__data__;
        },
        attrWatch:     function () {
            var _This_ = this;

            if (! this.__observer__)  this.extend( this.$_View[0].dataset );

            this.__observer__ = new self.MutationObserver(function () {

                var iData = { };

                $.each(arguments[0],  function () {

                    var iNew = this.target.getAttribute( this.attributeName ),
                        iOld = this.oldValue;

                    if (
                        (iNew != iOld)  &&
                        (! (iOld || '').match( Node_Template.expression ))
                    )
                        iData[$.camelCase( this.attributeName.slice(5) )] = iNew;
                });

                if (! $.isEmptyObject( iData ))
                    _This_.render( iData ).trigger('update', iData);
            });

            this.__observer__.observe(this.$_View[0], {
                attributes:           true,
                attributeOldValue:    true,
                attributeFilter:      $.map(
                    Object.keys( this.$_View[0].dataset ),
                    function () {
                        return  'data-'  +  $.hyphenCase( arguments[0] );
                    }
                )
            });
        },
        attach:        function () {

            this.$_View.data('[object View]', this);

            if ( this.$_View[0].dataset.href )  this.attrWatch();

            this.$_View.append( this.$_Content );

            return this;
        },
        detach:        function () {

            this.$_View.data('[object View]', null);

            if (this.__observer__) {
                this.__observer__.disconnect();

                delete this.__observer__;
            }

            this.$_Content = this.$_View.children().detach();

            return this;
        },
        scan:          function (iParser) {

            var Sub_View = [ ],  _This_ = this;

            var iSearcher = document.createTreeWalker(this.$_View[0], 1, {
                    acceptNode:    function (iDOM) {
                        var iView;

                        if ( iDOM.dataset.href ) {

                            _This_.__child__.push( iDOM );

                            return NodeFilter.FILTER_REJECT;

                        } else if (
                            iDOM.dataset.name  ||
                            (iView = View.instanceOf(iDOM, false))
                        ) {
                            Sub_View.push(iView  ||  View.getSub( iDOM ));

                            return NodeFilter.FILTER_REJECT;
                        } else if (
                            (iDOM.parentNode == document.head)  &&
                            (iDOM.tagName.toLowerCase() != 'title')
                        )
                            return NodeFilter.FILTER_REJECT;

                        return NodeFilter.FILTER_ACCEPT;
                    }
                });

            iParser.call(this, this.$_View[0]);

            var iPointer,  iNew,  iOld;

            while (iPointer = iPointer || iSearcher.nextNode()) {

                iNew = iParser.call(this, iPointer);

                if (iNew == iPointer) {
                    iPointer = null;
                    continue;
                }

                $( iNew ).insertTo(iPointer.parentNode,  $( iPointer ).index());

                iOld = iPointer;

                iPointer = iSearcher.nextNode();

                $( iOld ).remove();
            }

            for (var i = 0;  this.__child__[i];  i++)
                iParser.call(this, this.__child__[i]);

            for (var i = 0;  Sub_View[i];  i++)
                iParser.call(this, Sub_View[i]);
        },
        one:           Observer.prototype.one
    });

    $.each(['trigger', 'on', 'off'],  function (Index, iName) {

        View.prototype[this] = function () {

            var iArgs = $.makeArray( arguments );

            if ( Index ) {
                iArgs[0] += '.EWA_View';

                if (typeof iArgs.slice(-1)[0] == 'function') {

                    iArgs = iArgs.concat($.proxy(iArgs.pop(), this));
                }
            }

            $.fn[iName].apply(this.$_View, iArgs);

            return this;
        };
    });

    $.extend(View, {
        getClass:        function () {

            return this.prototype.toString.call(
                {constructor: this}
            ).split(' ')[1].slice(0, -1);
        },
        signSelector:    function () {
            var _This_ = this;

            $.expr[':'][ this.getClass().toLowerCase() ] = function () {
                return (
                    ($.data(arguments[0], '[object View]') || '') instanceof _This_
                );
            };

            return this;
        }
    });

    return  $.extend(View.signSelector(), {
        Sub_Class:     [ ],
        getSub:        function (iDOM) {

            for (var i = this.Sub_Class.length - 1;  this.Sub_Class[i];  i--)
                if (this.Sub_Class[i].is( iDOM ))
                    return  new this.Sub_Class[i](
                        iDOM,
                        (this.instanceOf( iDOM.parentNode )  ||  '').__data__
                    );
        },
        extend:        function (iConstructor, iStatic, iPrototype) {

            this.Sub_Class.push( iConstructor );

            return $.inherit(
                this, iConstructor, iStatic, iPrototype
            ).signSelector();
        },
        instanceOf:    function ($_Instance, Check_Parent) {

            var _Instance_;  $_Instance = $( $_Instance );

            do {
                _Instance_ = $_Instance.data('[object View]');

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        }
    });
})(self, self.document, self.jQuery, DS_Inherit, MutationObserver, Node_Template, Observer);



var HTMLView = (function (BOM, DOM, $, View, Node_Template, DS_Inherit) {

    function HTMLView($_View, iScope) {

        var _This_ = View.call(this, $_View, iScope);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:      0,
            __map__:     { },
            __last__:    0
        });
    }

    return  View.extend(HTMLView, {
        is:            function () {
            return true;
        },
        parsePath:     function (iPath) {

            var iNew;  iPath = iPath.replace(/^\.\//, '').replace(/\/\.\//g, '/');

            do {
                iPath = iNew || iPath;

                iNew = iPath.replace(/[^\/]+\/\.\.\//g, '');

            } while (iNew != iPath);

            return iNew;
        },
        fixDOM:        function (iDOM, BaseURL) {
            var iKey = 'src';

            switch ( iDOM.tagName.toLowerCase() ) {
                case 'img':       ;
                case 'iframe':    ;
                case 'audio':     ;
                case 'video':     break;
                case 'script':    {
                    var iAttr = { };

                    $.each(iDOM.attributes,  function () {

                        iAttr[ this.nodeName ] = this.nodeValue;
                    });

                    iDOM = $('<script />', iAttr)[0];    break;
                }
                case 'link':      {
                    if (('rel' in iDOM)  &&  (iDOM.rel != 'stylesheet'))
                        return iDOM;

                    iKey = 'href';    break;
                }
                default:          {
                    if (! (iDOM.dataset.href || '').split('?')[0])  return iDOM;

                    iKey = 'data-href';
                }
            }
            var iURL = iDOM.getAttribute( iKey );

            if (iURL  &&  (iURL.indexOf( BaseURL )  <  0))
                iDOM.setAttribute(iKey,  this.parsePath(BaseURL + iURL));

            return iDOM;
        },
        rawSelector:    $.makeSet('code', 'xmp', 'template')
    }, {
        parseSlot:     function (iNode) {

            iNode = iNode.getAttribute('name');

            var $_Slot = this.$_Content.filter(
                    iNode  ?
                        ('[slot="' + iNode + '"]')  :  '[slot=""], :not([slot])'
                );
            this.$_Content = this.$_Content.not( $_Slot );

            return $_Slot;
        },
        signIn:        function (iNode, iName) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            for (var j = 0;  iName[j];  j++)
                this.__map__[iName[j]] = (this.__map__[iName[j]] || 0)  +
                    Math.pow(2, i);
        },
        parsePlain:    function (iDOM) {
            var _This_ = this;

            $.each(
                Array.prototype.concat.apply(
                    $.makeArray( iDOM.attributes ),  iDOM.childNodes
                ),
                function () {
                    if ((this.nodeType != 2)  &&  (this.nodeType != 3))
                        return;

                    var iTemplate = new Node_Template( this );

                    var iName = iTemplate.getRefer();

                    if (! iName[0])  return;

                    _This_.signIn(iTemplate, iName);

                    if (
                        (! this.nodeValue)  &&
                        (this.nodeType == 2)  &&
                        (this.nodeName.slice(0, 5) != 'data-')
                    )
                        this.ownerElement.removeAttribute( this.nodeName );
                }
            );
        },
        parse:         function (BaseURL, iTemplate) {
            if ( iTemplate ) {
                this.$_Content = this.$_View.children().detach();

                this.$_View[0].innerHTML = iTemplate;
            }

            this.scan(function (iNode) {

                if (iNode instanceof Element) {

                    if (iNode.tagName.toLowerCase() == 'slot')
                        return $.map(
                            this.parseSlot( iNode ),
                            $.proxy(arguments.callee, this)
                        );

                    if (iNode != this.$_View[0])
                        iNode = HTMLView.fixDOM(iNode, BaseURL);
                }

                switch (true) {
                    case (iNode instanceof View):
                        this.signIn(iNode, [iNode.__name__]);    break;
                    case (
                        $.expr[':'].field( iNode )  &&  (iNode.type != 'file')  &&
                        (! iNode.defaultValue)
                    ):
                        this.signIn(iNode, [iNode.name]);
                    case !(
                        iNode.tagName.toLowerCase() in HTMLView.rawSelector
                    ):
                        this.parsePlain( iNode );
                }

                return iNode;
            });

            delete this.$_Content;

            return this;
        },
        getNode:       function () {
            var iMask = '0',  _This_ = this;

            for (var iName in arguments[0])
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return  $.map(iMask.split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {

            if (typeof iData.valueOf() == 'string') {
                var _Data_ = { };
                _Data_[iData] = arguments[1];
                iData = _Data_;
            }

            var _This_ = this;  _Data_ = this.extend( iData );

            $.each(this.getNode(this.__last__ ? iData : _Data_),  function () {

                if (this instanceof Node_Template)
                    this.render(_This_, _Data_);
                else if (this instanceof View)
                    this.render(_Data_[this.__name__]);
                else
                    $( this )[
                        ('value' in this)  ?  'val'  :  'html'
                    ](
                        _Data_[this.name || this.getAttribute('name')]
                    );
            });

            this.__last__ = $.now();

            return this;
        },
        clear:         function () {

            return  this.render( this.__data__.clear() );
        }
    });
})(self, self.document, self.jQuery, View, Node_Template, DS_Inherit);



var ListView = (function (BOM, DOM, $, View, HTMLView) {

    function ListView() {

        var _This_ = View.apply(this, arguments);

        if (this != _This_)  return _This_;

        this.__HTML__ = this.$_View.html();

        this.clear();
    }

    return  View.extend(ListView, {
        is:    $.expr[':'].list
    }, {
        splice:    Array.prototype.splice,
        clear:     function () {
            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        },
        insert:    function (iData, Index) {

            var Item = (new HTMLView(this.__HTML__, this.__data__)).parse();

            Item.$_View.insertTo(this.$_View, Index);

            this.splice(Index || 0,  0,  Item.render( iData ));
        },
        render:    function (iList) {

            if ($.likeArray( iList ))
                $.map(iList,  $.proxy(this.insert, this));

            return this;
        },
        remove:    function (Index) {

            this.splice(Index, 1)[0].$_View.remove();
        }
    });
})(self, self.document, self.jQuery, View, HTMLView);



var InnerLink = (function (BOM, DOM, $, Observer) {

    function InnerLink(Link_DOM, API_Root) {

        Observer.call(this).$_View = $( Link_DOM );

        this.target = Link_DOM.tagName.match(/^(a|form)$/i) ? 'page' : 'view';

        this.method = (
            Link_DOM.getAttribute('method') || Link_DOM.dataset.method || 'Get'
        ).toUpperCase();

        this.setURI(Link_DOM, API_Root).title = Link_DOM.title || document.title;
    }

    var $_Prefetch = $(
            '<link rel="'  +  ($.browser.modern ? 'prefetch' : 'next')  +  '" />'
        ).on('load error',  function () {
            $(this).remove();
        });

    return  $.inherit(Observer, InnerLink, {
        HTML_Link:    'a[href], form[action]',
        Self_Link:    '[data-href]:not(a, form)'
    }, {
        setURI:      function (Link_DOM, API_Root) {

            this.href = Link_DOM.dataset.href ||
                Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action');

            this.src = this.href.split('?data=');

            this.href = this.src[0];

            this.fullSrc = this.src = this.src[1];

            if (this.src  &&  (! $.urlDomain( this.src )))
                this.fullSrc = API_Root + this.src;

            this.data = $.paramJSON( this.href );

            this.href = this.href.split('?')[0];

            return this;
        },
        getURI:      function () {

            var iData = [$.param( this.data )];

            if (! iData[0])  iData.length = 0;

            if ( this.src )  iData.push('data=' + this.src);

            iData = iData.join('&');

            return  (this.href || '')  +  (iData  &&  ('?' + iData));
        },
        loadData:    function () {

            if (this.$_View[0].tagName == 'A')
                return  Promise.resolve($.getJSON( this.fullSrc ));

            var iOption = {
                    type:          this.method,
                    beforeSend:    arguments[0],
                    dataType:
                        (this.src.match(/\?/g) || '')[1]  ?  'jsonp'  :  'json'
                };

            if (this.$_View[0].tagName == 'A') {

                iOption.data = $.extend({ }, this.$_View[0].dataset);

            } else if (! this.$_View.find('input[type="file"]')[0]) {

                iOption.data = this.$_View.serialize();
            } else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = iOption.type.toUpperCase() + ' ' + this.fullSrc,
                iJSON = Promise.resolve($.ajax(this.fullSrc, iOption));

            return  (this.method != 'get')  ?  iJSON  :  iJSON.then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
        },
        load:        function (onRequest) {

            return Promise.all([
                this.href  &&  $.ajax({
                    type:          'GET',
                    url:           this.href,
                    beforeSend:    onRequest
                }),
                this.src  &&  this.loadData( onRequest )
            ]);
        },
        valueOf:     function () {
            var _This_ = { };

            for (var iKey in this)
                if (
                    (typeof this[iKey] != 'object')  &&
                    (typeof this[iKey] != 'function')
                )
                    _This_[iKey] = this[iKey];

            _This_.target = this.$_View[0];

            return _This_;
        },
        prefetch:    function () {
            if ( this.href )
                $_Prefetch.clone().attr('href', this.href).appendTo('head');

            if (
                (this.method == 'GET')  &&
                this.src  &&  (this.src.indexOf('?') == -1)  &&
                $.isEmptyObject( this.$_View[0].dataset )
            )
                $_Prefetch.clone().attr('href', this.fullSrc).appendTo('head');
        }
    });
})(self, self.document, self.jQuery, Observer);



var WebApp = (function (BOM, DOM, $, Observer, View, HTMLView, ListView, InnerLink) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Root);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        Observer.call( this ).$_Page = $( Page_Box ).data('_EWA_', this);

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;
        this.loading = { };

        this.listenDOM().listenBOM().boot();
    }

    return  $.inherit(Observer, WebApp, {
        View:        View,
        HTMLView:    HTMLView,
        ListView:    ListView
    }, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!'  +  self.btoa( iLink.getURI() )
            );
            this.push( iLink );
        },
        getRoute:     function () {
            return self.atob(
                (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
            );
        },
        getCID:       function () {
            return  arguments[0].replace(this.pageRoot, '')
                .replace(/\.\w+(\?.*)?/i, '.html');
        },
        loadView:     function (iLink, iHTML) {

            var $_Target = iLink.$_View;

            if (iLink.target == 'page') {

                var iPrev = View.instanceOf(this.$_Page, false);

                if ( iPrev )  iPrev.detach();

                if (this.indexOf( iLink )  ==  -1)  this.setRoute( iLink );

                $_Target = this.$_Page;
            }

            iHTML = this.emit(
                $.extend(iLink.valueOf(),  {type: 'template'}),  iHTML
            );

            var iView = View.getSub( $_Target[0] );

            if (! $_Target.children()[0]) {

                $_Target[0].innerHTML = iHTML;

                iHTML = '';
            }
            if ( iView.parse )
                iView.parse($.filePath(iLink.href) + '/',  iHTML);

            if (! $_Target.find('script[src]:not(head > *)')[0])
                iLink.emit('load');

            iView.__data__.extend( iLink.data );

            return iView;
        },
        loadComponent:    function (iLink, iHTML, iData) {

            this.loading[ iLink.href ] = iLink;

            var JS_Load = iLink.one('load');

            var iView = this.loadView(iLink, iHTML),  _This_ = this;

            return  JS_Load.then(function (iFactory) {

                delete _This_.loading[ iLink.href ];

                if ( iFactory )
                    iData = iFactory.call(iView, iData)  ||  iData;

                return iView.render(
                    ((typeof iData == 'object') && iData)  ||  { }
                );
            });
        },
        load:         function (iLink) {

            if (iLink instanceof Element)
                iLink = new InnerLink(iLink, this.apiRoot);

            if ((! iLink.href)  &&  (iLink.target != 'view'))
                return  this.loadData( iLink );

            var _This_ = this,  iView;

            return  iLink.load(function () {

                _This_.emit(
                    $.extend(iLink.valueOf(), {type: 'request'}),
                    [this, arguments[0]]
                );
            }).then(function () {

                var iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit(
                        $.extend(iLink.valueOf(), {type: 'data'}),  iData
                    );

                return  _This_.loadComponent(iLink, arguments[0][0], iData);

            }).then(function () {

                iView = arguments[0];

                return Promise.all($.map(
                    iView.__child__,  $.proxy(_This_.load, _This_)
                ));
            }).then(function () {

                _This_.emit(
                    $.extend(iLink.valueOf(), {type: 'ready'}),  iView
                );
            });
        },
        listenDOM:    function () {
            var _This_ = this;

            $('html').on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        $(this).value('name')
                    );
            })).on('click submit',  InnerLink.HTML_Link,  function (iEvent) {
                if (
                    ((this.tagName == 'FORM')  &&  (iEvent.type != 'submit'))  ||
                    (this.target  &&  (this.target != '_self'))
                )
                    return;

                var CID = (this.href || this.action).match(_This_.pageRoot);

                if ((CID || '').index === 0) {

                    iEvent.preventDefault();

                    _This_.load( this );
                }
            });

            return this;
        },
        listenBOM:    function () {
            var _This_ = this;

            $(self).on('popstate',  function () {

                var Index = (arguments[0].originalEvent.state || '').index;

                if (_This_[Index]  &&  (_This_.lastPage != Index))
                    _This_.load(_This_[Index]).then(function () {

                        _This_.lastPage = Index;

                        document.title = _This_[Index].title;
                    });
            });

            return this;
        },
        boot:         function () {

            var $_Init = $('[data-href]').not( this.$_Page.find('[data-href]') ),
                _This_ = this;

            return  ($_Init[0]  ?  this.load( $_Init[0] )  :  Promise.resolve(''))
                .then(function () {

                    var Init = _This_.getRoute();

                    if ( Init )
                        return  _This_.load( $('<a />',  {href: Init})[0] );

                    $('a[href][data-autofocus="true"]').eq(0).click();
                });
        }
    });
})(self, self.document, self.jQuery, Observer, View, HTMLView, ListView, InnerLink);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v4.0  (2017-04-03)  Alpha
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



var EasyWebApp = (function (BOM, DOM, $, WebApp) {

/* ---------- AMD based Component API ---------- */

    var _require_ = self.require,  _CID_;

    self.require = function () {

        if (! document.currentScript)  return _require_.apply(this, arguments);

        var iArgs = arguments,  iWebApp = new WebApp();

        var CID = iWebApp.getCID( document.currentScript.src );

        _require_.call(this,  iArgs[0],  function () {

            _CID_ = CID;

            return  iArgs[1].apply(this, arguments);
        });
    };

    WebApp.fn = WebApp.prototype;

    WebApp.fn.component = function (iFactory) {

        if ( this.loading[_CID_] )  this.loading[_CID_].emit('load', iFactory);

        return this;
    };

/* ---------- jQuery based Helper API ---------- */

    $.fn.view = function (Class_Name) {

        if (! this[0])  return;

        return  Class_Name  ?
            (new WebApp[Class_Name](this[0], arguments[1]))  :
            WebApp.View.instanceOf(this[0], false);
    };

    return  $.fn.iWebApp = WebApp;

})(self, self.document, self.jQuery, WebApp);


});
