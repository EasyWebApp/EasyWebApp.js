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
        sign:     function (iEvent, iCallback) {

            iEvent = Observer.getEvent(iEvent,  {handler: iCallback});

            var iHandle = this.__handle__[iEvent.type] =
                    this.__handle__[iEvent.type]  ||  [ ];

            for (var i = 0;  iHandle[i];  i++)
                if ($.isEqual(iHandle[i], iEvent))  return this;

            iHandle.push( iEvent );

            return this;
        },
        on:       function (iEvent, iCallback) {

            if (typeof iCallback == 'function')
                return  this.sign(iEvent, iCallback);

            var _This_ = this;

            return  new Promise(function () {

                _This_.sign(iEvent, arguments[0]);
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



var InnerLink = (function (BOM, DOM, $) {

    function InnerLink(Link_DOM, Glob_Env) {

        this.$_View = $( Link_DOM );

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

    $.extend(InnerLink.prototype, {
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

    return InnerLink;

})(self, self.document, self.jQuery);



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

    View.prototype.toString = function () {

        var iName = this.constructor.name;

        return  '[object ' + (
            (typeof iName == 'function')  ?  this.constructor.name()  :  iName
        )+ ']';
    };

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

    $.extend(Node_Template, {
        eval:          function () {
            'use strict';

            var vm = this;

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
        reference:     /(this|vm)\.(\w+)/g
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



var HTMLView = (function (BOM, DOM, $, View, Node_Template) {

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

            $.extend(this.__data__, iData);

            $.each(this.getNode( iData ),  function () {

                if (this instanceof Node_Template)
                    this.render( iData );
                else if (this instanceof View)
                    this.render( iData[this.__name__] );
                else
                    $( this )[
                        ('value' in this)  ?  'val'  :  'html'
                    ](
                        iData[this.name || this.getAttribute('name')]
                    );
            });

            return this;
        }
    });
})(self, self.document, self.jQuery, View, Node_Template);



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

            var Item = (new HTMLView( this.template )).parse();

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

        var Sub_Component = [ ];

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

        return  ((! _This_)  ||  (_This_.$_View[0] != $_Root[0]))  ?
            (new HTMLView( $_Root )).parse( Sub_Component )  :  _This_;
    };

})(self, self.document, self.jQuery, ListView, HTMLView);


//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.8  (2017-03-10)  Beta
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



var WebApp = (function (BOM, DOM, $, Observer, InnerLink, TreeBuilder, HTMLView) {

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

    $.fn.iWebApp = $.inherit(Observer, WebApp, null, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!'  +  self.btoa(iLink.href + '?for=' + iLink.src)
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
        resolve:      function (CID, iPromise) {
            var _This_ = this;

            return (
                this.loading[CID]  ?
                    iPromise.then.apply(iPromise, this.loading[CID])  :
                    Promise.all([iPromise,  new Promise(function () {

                        _This_.loading[CID] = arguments;
                    })])
            ).then(function (iResult) {

                var VM = iResult[0],  AMD = iResult[1];

                if (iResult[0] instanceof Array)  VM = [AMD,  AMD = VM][0];

                if (! AMD[0])  return  VM.view.render( VM.data );

                var iFactory = AMD.pop();

                AMD.push( VM.data );

                return  VM.view.render(iFactory.apply(VM.view, AMD)  ||  VM.data);
            });
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

            var iData,  _This_ = this;

            return  this.resolve(iLink.href,  iLink.load().then(function () {

                var iEvent = iLink.valueOf();  iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit($.extend(iEvent, {type: 'data'}),  iData);

                return iLink.$_Target.empty().htmlExec(
                    _This_.emit(
                        $.extend(iEvent, {type: 'template'}),  arguments[0][0]
                    )
                );
            }).then($.proxy(function () {

                var iView = TreeBuilder( iLink.$_Target );

                if (
                    (this.$_Page[0] == iLink.$_Target[0])  &&
                    (this.indexOf( iLink )  ==  -1)
                )
                    this.setRoute( iLink );

                if (! iLink.$_Target.find('script[src]')[0])
                    this.resolve(iLink.href,  Promise.resolve([1]));

                return {
                    view:    iView,
                    data:    iData
                };
            }, this)));
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

                if ((! _This_[Index])  ||  (_This_.lastPage == Index))  return;

                _This_.$_Page.empty();

                _This_.load(_This_[Index]).then(function () {

                    _This_.lastPage = Index;

                    document.title = _This_[Index].title;
                });
            });
        },
        define:       function (iSuper, iFactory) {

            if (! document.currentScript)
                throw SyntaxError(
                    'WebApp.prototype.define() can only be executed synchronously in script tags, not a callback function.'
                );

            return this.resolve(
                this.getCID( document.currentScript.src ),
                new Promise(function (iResolve) {

                    self.require(iSuper,  function () {

                        iResolve( $.makeArray( arguments ).concat( iFactory ) );
                    });
                })
            );
        }
    });

    WebApp.fn = WebApp.prototype;

    return WebApp;

})(self, self.document, self.jQuery, Observer, InnerLink, TreeBuilder, HTMLView);


});
