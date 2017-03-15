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
                (typeof iEvent == 'string')  ?  {type: iEvent}  :  iEvent,
                arguments[1]  ||  { }
            );
        },
        match:       function (iEvent, iHandle) {

            for (var iKey in iHandle)
                if (
                    (typeof iHandle[iKey] != 'function')  &&
                    (! (iEvent[iKey] || '').match( iHandle[iKey] ))
                )
                    return false;

            return true;
        }
    });

    $.extend(Observer.prototype, {
        sign:    function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        on:      function (iEvent, iCallback) {

            if (typeof iCallback == 'function')
                return  this.sign(iEvent, iCallback);

            var _This_ = this;

            return  new Promise(function (iResolve) {

                _This_.sign(iEvent,  function () {

                    iResolve( arguments[1] );
                });
            });
        },
        emit:    function (iEvent, iData) {

            iEvent = Observer.getEvent( iEvent );

            return  (this.__handle__[iEvent.type] || [ ]).reduce(
                $.proxy(function (_Data_, iHandle) {

                    var iResult = Observer.match(iEvent, iHandle)  &&
                            iHandle.handler.call(this, iEvent, _Data_);

                    return  iResult || _Data_;

                },  this),
                iData
            );
        },
        off:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            this.__handle__[iEvent.type] = $.map(
                this.__handle__[iEvent.type],
                $.proxy(Observer.match, Observer, iEvent)
            );

            return this;
        }
    });

    return Observer;

})(self, self.document, self.jQuery);



var InnerLink = (function (BOM, DOM, $, Observer) {

    function InnerLink(Link_DOM, Glob_Env) {

        Observer.call(this).$_View = $( Link_DOM );

        this.$_Target = Glob_Env.target[
            this.target = Link_DOM.target || '_self'
        ]  ||  $(
            '[name="' + this.target + '"]'
        );

        this.method = (Link_DOM.getAttribute('method') || 'Get').toUpperCase();

        this.src = $.paramJSON(
            this.href = Link_DOM.getAttribute(Link_DOM.href ? 'href' : 'action')
        )['for'];

        if (this.src  &&  (! $.urlDomain( this.src )))
            this.src = Glob_Env.dataBase + this.src;

        this.href = this.href.split('?')[0];

        this.title = Link_DOM.title || document.title;
    }

    var $_Prefetch = $(
            '<link rel="'  +  ($.browser.modern ? 'prefetch' : 'next')  +  '" />'
        ).on('load error',  function () {
            $(this).remove();
        });

    return  $.inherit(Observer, InnerLink, null, {
        loadData:    function () {
            if (! this.src)  return;

            if (this.$_View[0].tagName == 'A')
                return  Promise.resolve($.getJSON( this.src ));

            var iOption = {type: this.method};

            if (! this.$_View.find('input[type="file"]')[0])
                iOption.data = this.$_View.serialize();
            else {
                iOption.data = new BOM.FormData( this.$_View[0] );
                iOption.contentType = iOption.processData = false;
            }

            var URI = iOption.type.toUpperCase() + ' ' + this.src;

            return  Promise.resolve($.ajax(this.src, iOption)).then(
                $.proxy($.storage, $, URI),  $.proxy($.storage, $, URI, null)
            );
        },
        load:        function () {

            return  Promise.all([$.get( this.href ),  this.loadData()]);
        },
        valueOf:     function () {
            var _This_ = { };

            for (var iKey in this)
                if (
                    (typeof this[iKey] != 'object')  &&
                    (typeof this[iKey] != 'function')
                )
                    _This_[iKey] = this[iKey];

            return _This_;
        },
        prefetch:    function () {
            if ( this.href )
                $_Prefetch.clone().attr('href', this.href).appendTo('head');

            if (
                (this.method == 'GET')  &&
                this.src  &&  (this.src.indexOf('?') == -1)
            )
                $_Prefetch.clone().attr('href', this.src).appendTo('head');
        }
    });
})(self, self.document, self.jQuery, Observer);



var View = (function (BOM, DOM, $) {

    function View($_View) {

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.constructor.instanceOf(this.$_View, false);

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        this.__id__ = $.uuid('View');
        this.__name__ = this.$_View.attr('name');

        this.$_View.data('[object View]', this);

        return this;
    }

    $.extend(View.prototype, {
        toString:       function () {

            var iName = this.constructor.name;

            return  '[object ' + (
                (typeof iName == 'function')  ?  this.constructor.name()  :  iName
            )+ ']';
        },
        destructor:    function () {

            this.$_View.data('[object View]', null).empty();

            delete this.__data__;
        },
        scope:         function (iSup) {
            this.__data__ = iSup;

            for (var i = 0;  this[i];  i++)
                if (this[i] instanceof View)  this[i].scope( iSup );

            return this;
        }
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

    return  $.extend(View.signSelector(),  {
        extend:        function (iConstructor, iStatic, iPrototype) {
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
        }
    });

    return  function (iSup, iSub) {

        return Object.create(
            (iSup instanceof DataScope)  ?  iSup  :  DataScope.prototype
        ).extend( iSub );
    };

})(self, self.document, self.jQuery);



var HTMLView = (function (BOM, DOM, $, View, Node_Template, DS_Inherit) {

    function HTMLView($_View, $_Template) {

        var _This_ = View.call(this, $_View);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:      0,
            __map__:     { },
            __data__:    { }
        });

        if ( $_Template )  this.parseSlot( $_Template );
    }

    return  View.extend(HTMLView, {
        rawSelector:    'code, xmp, template'
    }, {
        parseSlot:     function ($_Template) {

            var $_All = this.$_View.children().detach();

            var $_Slot = this.$_View.append( $_Template ).find('slot'),
                $_Named = $_All.filter('[slot]');

            if ( $_Named[0] )
                $_Slot.filter('[name]').replaceWith(function () {
                    return $_Named.filter(
                        '[slot="' + this.getAttribute('name') + '"]'
                    );
                });

            $_Slot.not('[name]').replaceWith( $_All.not( $_Named ) );
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
        signIn:        function (iNode, iName) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            for (var j = 0;  iName[j];  j++) {
                this.__map__[iName[j]] = (this.__map__[iName[j]] || 0)  +
                    Math.pow(2, i);

                if ( $.browser.modern )  this.watch( iName[j] );
            }
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

                    if ((! this.nodeValue)  &&  (this.nodeType == 2))
                        this.ownerElement.removeAttribute( this.nodeName );
                }
            );
        },
        parse:         function ($_Exclude) {

            var _This_ = this,  $_Sub = this.$_View.find(':view');

            for (var i = 0;  $_Sub[i];  i++)
                this.signIn(
                    View.instanceOf( $_Sub[i] ),  [ $_Sub[i].getAttribute('name') ]
                );

            $_Exclude = $( $_Exclude ).add( $_Sub ).find('*').add( $_Sub );

            this.$_View.each(function () {

                var $_All = $('*', this).not( $_Exclude ).add( this );

                var $_Input = $_All.filter(':field');

                for (var i = 0;  $_Input[i];  i++)
                    _This_.signIn($_Input[i], [$_Input[i].name]);

                var $_Plain = $_All.not( HTMLView.rawSelector );

                for (var i = 0;  $_Plain[i];  i++)
                    _This_.parsePlain( $_Plain[i] );
            });

            return this;
        },
        scope:         function (iSup) {

            return  (! iSup)  ?  this.__data__  :
                View.prototype.scope.call(this,  DS_Inherit(iSup, this.__data__));
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

            var _This_ = this,  _Data_ = $.extend(this.__data__, iData);

            if (! $.browser.modern)
                for (var iKey in iData)  if (this.__map__[iKey])
                    this[iKey] = iData[iKey];

            $.each(this.getNode( iData ),  function () {

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

            return this;
        }
    });
})(self, self.document, self.jQuery, View, Node_Template, DS_Inherit);



var ListView = (function (BOM, DOM, $, View, HTMLView) {

    function ListView() {

        var _This_ = View.apply(this, arguments);

        if (this != _This_)  return _This_;

        this.template = this.$_View.html();

        this.clear();
    }

    return  View.extend(ListView, null, {
        splice:    Array.prototype.splice,
        clear:     function () {
            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        },
        insert:    function (iData, Index) {

            var Item = (new HTMLView( this.template ))
                    .parse().scope( this.__data__ );

            Item.$_View.insertTo(this.$_View, Index);

            this.splice(Index || 0,  0,  Item.render( iData ));
        },
        render:    function (iList) {

            $.map(iList,  $.proxy(this.insert, this));

            return this;
        },
        remove:    function (Index) {

            this.splice(Index, 1)[0].$_View.remove();
        }
    });
})(self, self.document, self.jQuery, View, HTMLView);



var TreeBuilder = (function (BOM, DOM, $, ListView, HTMLView) {

    function is_Component(iDOM) {
        return (
            (iDOM.tagName != 'A')  &&
            (! iDOM.getAttribute('target'))  &&
            (! $.expr[':'].media( iDOM ))  &&  (
                iDOM.getAttribute('href')  ||  iDOM.getAttribute('src')
            )
        );
    }

    return  function ($_Root) {

        $_Root = $( $_Root );

        var Sub_Component = [ ],
            iScope = HTMLView.instanceOf( $_Root.parents(':view')[0] );

        iScope = iScope  ?  iScope.scope()  :  { };

        var iSearcher = document.createTreeWalker($_Root[0], 1, {
                acceptNode:    function (iDOM) {

                    if (is_Component( iDOM )) {
                        Sub_Component.push( iDOM );

                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }),
            _This_,  iList = [ ],  iView = [ ];

        while (_This_ = iSearcher.nextNode())  if (_This_.getAttribute('name')) {

            if ($.expr[':'].list(_This_))
                iList.unshift(_This_);
            else if (! $.expr[':'].field(_This_))
                iView.unshift(_This_);
        }

        for (var i = 0;  iList[i];  i++)
            _This_ = new ListView( iList[i] );

        if (iList[i] != $_Root[0]) {

            for (var i = 0;  iView[i];  i++)
                if ($( iView[i] ).parents( $_Root )[0])
                    _This_ = (new HTMLView( iView[i] )).parse( Sub_Component );
        }

        return (
            ((! _This_)  ||  (_This_.$_View[0] != $_Root[0]))  ?
                (new HTMLView( $_Root )).parse( Sub_Component )  :  _This_
        ).scope( iScope );
    };

})(self, self.document, self.jQuery, ListView, HTMLView);



var WebApp = (function (BOM, DOM, $, Observer, InnerLink, TreeBuilder, HTMLView, View) {

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

        this.listenDOM().listenBOM();

        var Init = this.getRoute();

        if ( Init )
            this.load( $('<a />',  {href: Init})[0] );
        else
            $('body a[href][autofocus]').eq(0).click();
    }

    return  $.inherit(Observer, WebApp, null, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!' + self.btoa(
                    iLink.href  +  (iLink.src  ?  ('?for=' + iLink.src)  :  '')
                )
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
        load:         function (iLink) {

            if (iLink instanceof Element) {

                var iName = iLink.href ? 'href' : 'action';

                iLink.setAttribute(iName, iLink[iName].replace(this.pageRoot, ''));

                iLink = new InnerLink(iLink, {
                    target:      {_self:  this.$_Page},
                    dataBase:    this.apiRoot
                });
            }

            this.loading[ iLink.href ] = iLink;

            var iData,  iEvent = iLink.valueOf(),  _This_ = this,  JS_Load,  iView;

            return  iLink.load().then(function () {

                iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit($.extend(iEvent, {type: 'data'}),  iData);

                var iPrev = View.instanceOf(iLink.$_Target, false);

                if ( iPrev )  iPrev.destructor();

                JS_Load = iLink.on('load');

                return iLink.$_Target.htmlExec(
                    _This_.emit(
                        $.extend(iEvent, {type: 'template'}),  arguments[0][0]
                    )
                );
            }).then(function () {

                iView = TreeBuilder( iLink.$_Target );

                if (
                    (_This_.$_Page[0] == iLink.$_Target[0])  &&
                    (_This_.indexOf( iLink )  ==  -1)
                )
                    _This_.setRoute( iLink );

                if (! iLink.$_Target.find('script[src]')[0])
                    iLink.emit('load');

                return JS_Load;

            }).then(function (iFactory) {

                delete _This_.loading[ iLink.href ];

                if ( iFactory )  iData = iFactory.call(iView, iData)  ||  iData;

                _This_.emit(
                    $.extend(iEvent,  {type: 'ready'}),
                    (typeof iData == 'object')  ?  iView.render(iData)  :  iView
                );
            });
        },
        listenDOM:    function () {
            var _This_ = this;

            $(document).on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        $(this).value('name')
                    );
            })).on('click submit',  'a[href], form[action]',  function () {

                var CID = (this.href || this.action).match(_This_.pageRoot);

                if ((CID || '').index === 0) {

                    arguments[0].preventDefault();

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
        }
    });
})(self, self.document, self.jQuery, Observer, InnerLink, TreeBuilder, HTMLView, View);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.8  (2017-03-15)  Beta
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

    return  $.fn.iWebApp = WebApp;

})(self, self.document, self.jQuery, WebApp);


});
