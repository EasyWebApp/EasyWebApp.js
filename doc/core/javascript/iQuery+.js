(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('iQuery+', ['jQuery+'], arguments[0]);

})(function () {


(function (BOM, DOM, $) {

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.getInstance($_View) ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data(this.constructor.getClass(), this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    $.extend(CommonView, {
        getClass:       function () {
            return  this.prototype.toString.call({constructor: this});
        },
        getInstance:    function () {
            var _Instance_ = $( arguments[0] ).data( this.getClass(this) );
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        },
        instanceOf:     function (iDOM) {
            var iName = this.getClass();
            var Instance = '*:data("' + iName + '")';

            var $_Instance = $(iDOM).parent(Instance);

            return  ($_Instance[0] ? $_Instance : $(iDOM).parents(Instance))
                .data(iName);
        }
    });

    CommonView.prototype = $.extend(new $.Observer(),  {
        constructor:    CommonView,
        toString:       function () {
            var iName = this.constructor.name;

            iName = (typeof iName == 'function')  ?  this.constructor.name()  :  iName;

            return  '[object ' + iName + ']';
        },
        render:         function () {
            this.trigger('render', arguments);

            return this;
        },
        clear:          function () {
            this.$_View.empty();

            return this;
        }
    });

    $.CommonView = CommonView;

})(self, self.document, self.jQuery);


/* ---------- ListView Interface  v0.9 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp


(function (BOM, DOM, $) {

    var Click_Type = $.browser.mobile ? 'tap' : 'click';

    function ListView($_View, $_Item, iDelay, onUpdate) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, iDelay, onUpdate);

        var iArgs = $.makeArray(arguments).slice(1);

        $_Item = (iArgs[0] instanceof Array)  &&  iArgs.shift();
        iDelay = (typeof iArgs[0] == 'boolean')  ?  iArgs.shift()  :  null;
        onUpdate = (typeof iArgs[0] == 'function')  &&  iArgs[0];

        var iView = $.CommonView.call(this, $_View);

        if (typeof onUpdate == 'function')  iView.on('update', onUpdate);

        if ((iView !== this)  ||  (! iView.$_View[0].children[0]))
            return iView;

        this.selector = $_Item;
        this.length = 0;

        for (;  ;  this.length++) {
            $_Item = this.itemOf(this.length);

            if (! $_Item.length)  break;

            this[this.length] = $_Item;
        }

        _Self_.findView(this.$_View, false);

        this.$_Template = this[0].clone(true);

        iDelay = (iDelay !== false)  ?
            $('*', this[0][0]).add( this[0][0] ).filter(':media')[0]  :  iDelay;

        this.cache = iDelay && [ ];

        this.$_View.on(Click_Type,  '.ListView_Item',  function (iEvent) {
            if (iView.$_View[0] !== this.parentNode)  return;

            var $_This = $(this);

            if (
                (! $_This.hasClass('active'))  &&
                $_This.scrollParents().is(
                    'a[href], *[tabIndex], *[contentEditable]'
                )
            )
                _Self_.getInstance(this.parentNode).focus(this);
        });
    }

    $.extend(ListView, {
        getClass:       $.CommonView.getClass,
        getInstance:    $.CommonView.getInstance,
        instanceOf:     $.CommonView.instanceOf,
        findView:       function ($_View, Init_Instance) {
            $_View = $($_View).find('*:list, *[multiple]')
                .not('input[type="file"]');

            if (Init_Instance === true) {
                for (var i = 0;  i < $_View.length;  i++)
                    if (! this.getInstance($_View[i]))  this( $_View[i] );
            } else if (Init_Instance === false)
                $_View.data(this.getClass(), null);

            return $_View;
        }
    });

    var $_DOM = $(DOM);

    ListView.prototype = $.extend(new $.CommonView(),  {
        constructor:    ListView,
        getSelector:    function () {
            return  this.selector ?
                this.selector.join(', ') : [
                    this.$_Template[0].tagName.toLowerCase()
                ].concat(
                    (this.$_Template.attr('class') || '').split(/\s+/)
                ).join('.').trim('.');
        },
        //  Retrieve
        itemOf:         function (Index) {
            Index = Index || 0;

            var _This_ = this,  $_Item = this.$_View[0].children[Index];

            return $(
                this.selector ?
                    $.map(this.selector,  function () {
                        return  _This_.$_View.children( arguments[0] )[Index];
                    }) :
                    ($_Item ? [$_Item] : [ ])
            );
        },
        slice:          Array.prototype.slice,
        //  Retrieve
        indexOf:        function (Index, getInstance) {
            if ($.isNumeric( Index ))
                return  this.slice(Index,  (Index + 1) || undefined)[0];

            var $_Item = $(Index);

            for (var i = 0;  i < this.length;  i++)
                if (this[i].index($_Item[0]) > -1)
                    return  getInstance  ?  arguments.callee.call(this, i)  :  i;

            return  getInstance ? $() : -1;
        },
        //  Update
        update:         function () {
            var $_Item = this.indexOf(arguments[0], true);

            this.trigger('update', [
                $_Item,  arguments[1],  this.indexOf($_Item)
            ]);

            return this;
        },
        splice:         Array.prototype.splice,
        //  Create
        insert:         function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;

            Index = Math.min(parseInt(Index) || 0,  this.length);
            Index = (Index < 0)  ?  (this.length - Index)  :  Index;

            var $_Item = this.itemOf(Index);

            var _New_ = (! $_Item.length)  ||  $_Item.hasClass('ListView_Item');

            $_Item = _New_ ? this.$_Template.clone(true) : $_Item;

            var iReturn = this.trigger('insert',  [$_Item, iValue, Index]);

            $_Item = iReturn.length  ?
                $($.merge.call($, [ ], iReturn))  :  $_Item;

            if (_New_)
                this.splice(Index, 0, $_Item);
            else
                this[Index] = $_Item;

            this.update(Index, iValue);

            return  $_Item.addClass('ListView_Item').data('LV_Model', iValue)
                .insertTo(this.$_View,  Index * $_Item.length);
        },
        render:         function (iData, iFrom) {
            var iDelay = (this.cache instanceof Array),  $_Scroll;

            if (iDelay)
                iData = iData  ?  $.merge(this.cache, iData)  :  this.cache;

            iFrom = iFrom || 0;

            for (var i = 0, $_Item;  i < iData.length;  i++) {
                $_Item = this.insert(iData[i],  i + iFrom);

                $_Scroll = $_Scroll  ||  $( $_Item.scrollParents()[0] );

                if ((! $_Item.inViewport())  &&  iDelay) {

                    this.cache = iData.slice(++i);

                    if (! this.cache[0])  break;

                    $_Scroll.one('scroll', $.proxy(
                        this.render,  this,  null,  i + iFrom
                    ));

                    return this;
                }
            }
            if ( iData.length )  this.trigger('afterRender', [iData]);

            return this;
        },
        valueOf:        function (Index) {
            if (Index  ||  (Index == 0))
                return  this.indexOf(arguments[0], true).data('LV_Model');

            var iData = this.$_View.data('LV_Model') || [ ];

            if (! iData[0]) {
                for (var i = 0;  i < this.length;  i++)
                    iData.push( this[i].data('LV_Model') );

                this.$_View.data('LV_Model', iData);
            }
            return iData;
        },
        //  Delete
        remove:         function (Index) {
            var $_Item = this.indexOf(Index, true);

            if (
                $_Item.length  &&
                (false  !==  this.trigger('remove', [
                    $_Item,  this.valueOf(Index),  Index
                ])[0])
            )
                this.splice(Index, 1)[0].remove();

            return this;
        },
        clear:          function () {
            this.splice(0, this.length);
            this.$_View.empty();

            if (this.cache instanceof Array)
                this.cache.length = 0;

            return this;
        },
        focus:          function () {
            var $_Item = this.indexOf(arguments[0], true);

            if ( $_Item[0] ) {
                $_Item.siblings().removeClass('active');
                $_Item.scrollParents().eq(0).focus().scrollTo(
                    $_Item.addClass('active')
                );
            }
            return this;
        },
        sort:           function (iCallback) {
            var iLV = this;

            Array.prototype.sort.call(iLV,  function ($_A, $_B) {
                if (typeof iCallback == 'function')
                    return  iCallback.apply(iLV, [
                        $_A.data('LV_Model'),  $_B.data('LV_Model'),  $_A,  $_B
                    ]);

                var A = $_A.text(),  B = $_B.text();
                var nA = parseFloat(A),  nB = parseFloat(B);

                return  (isNaN(nA) || isNaN(nB))  ?
                    A.localeCompare(B)  :  (nA - nB);
            });

            Array.prototype.unshift.call(iLV, [ ]);

            $($.merge.apply($, iLV)).detach().appendTo( iLV.$_View );

            Array.prototype.shift.call( iLV );

            return iLV;
        },
        fork:           function () {
            var $_View = this.$_View.clone(true).empty().append(
                    this.$_Template.clone(true)
                );
            $_View.data({'[object ListView]': '',  LV_Model: ''})[0].id = '';

            var iFork = ListView(
                    $_View.appendTo( arguments[0] ),  false,  this.selector
                );
            iFork.table = this.table;
            iFork.parentView = this;

            return iFork;
        }
    });

    $.ListView = ListView;

})(self, self.document, self.jQuery);


/* ---------- TreeView Interface  v0.2 ---------- */


(function (BOM, DOM, $) {

    function TreeView(iListView, iKey, Init_Depth, onFork) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, Init_Depth, onFork);

        var iArgs = $.makeArray( arguments ).slice(1);

        iKey = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  'list';
        this.initDepth = (typeof iArgs[0] == 'number')  ?
            iArgs.shift()  :  Infinity;

        var _This_ = $.CommonView.call(this, iListView.$_View)
                .on('branch',  (typeof iArgs[0] == 'function')  &&  iArgs[0]);

        this.$_View = iListView.$_View;

        this[0] = [iListView.on('insert',  function ($_Item, iValue) {
            var iParent = this;

            if ($.likeArray( iValue[iKey] )  &&  iValue[iKey][0])
                $.wait(0.01,  function () {
                    _This_.branch(iParent.fork($_Item), iValue[iKey]);
                });
        })];
        this.length = 1;

        this.listener = [
            $.browser.mobile ? 'tap' : 'click',
            iListView.getSelector(),
            function (iEvent) {
                if ( $(iEvent.target).is(':input') )  return;

                var $_Fork = $(this).children('.TreeNode');

                if (iEvent.isPseudo() && $_Fork[0]) {
                    if ( $_Fork[0].firstElementChild )
                        $_Fork.toggle(200);
                    else
                        _This_.render($_Fork);
                }

                $('.ListView_Item.active', _This_.$_View[0]).not(this)
                    .removeClass('active');

                _This_.trigger('focus', arguments);

                return (
                    (iEvent.target.tagName != 'A')  ||
                    (iEvent.target.getAttribute('href')[0] != '#')
                );
            }
        ];
        $.fn.on.apply(iListView.$_View.addClass('TreeNode'), this.listener);
    }

    $.extend(TreeView, {
        getClass:       $.CommonView.getClass,
        getInstance:    $.CommonView.getInstance,
        instanceOf:     $.CommonView.instanceOf
    });

    TreeView.prototype = $.extend(new $.CommonView(),  {
        constructor:    TreeView,
        render:         function ($_Fork, iData) {
            if (iData  ||  (! ($_Fork instanceof Array)))
                $_Fork = $($_Fork);
            else {
                iData = $_Fork;
                $_Fork = this.$_View;
            }

            $.ListView.getInstance( $_Fork ).render(
                iData || $_Fork.data('TV_Model')
            ).$_View.children().removeClass('active');

            return this;
        },
        clear:          function () {
            this[0][0].clear();

            return this;
        },
        branch:         function ($_Item, iData) {
            var iFork = ($_Item instanceof $.ListView)  ?  $_Item  :  (
                    $.ListView.getInstance( $_Item[0].parentNode ).fork( $_Item )
                );
            var iDepth = $.trace(iFork, 'parentView').length;

            if (! this[iDepth])  this[this.length++] = [ ];

            this[iDepth].push( iFork.clear() );

            if (this.initDepth < this.length) {
                iFork.$_View.data('TV_Model', iData);
                iData = null;
            } else
                this.render(iFork.$_View, iData);

            this.trigger('branch',  [iFork, this.length, iData]);

            $.fn.off.apply(iFork.$_View.addClass('TreeNode'), this.listener);

            return iFork;
        },
        valueOf:        function () {
            return this[0][0].valueOf();
        }
    });

    $.TreeView = TreeView;

})(self, self.document, self.jQuery);


/* ---------- HTML 5  History API  Polyfill ---------- */


(function (BOM, DOM, $) {

    if (! ($.browser.msie < 10))  return;

    var _BOM_,  _Pushing_,  _State_ = [[null, DOM.title, DOM.URL]];

    $(DOM).ready(function () {
        var $_iFrame = $('<iframe />', {
                id:     '_HTML5_History_',
                src:    'blank.html',
                css:    {display:  'none'}
            }).appendTo(this.body),
            $_Parent = $(BOM);

        _BOM_ = $_iFrame[0].contentWindow;

        $_iFrame.on('load',  function () {
            if (_Pushing_) {
                _Pushing_ = false;
                return;
            }

            var iState = _State_[ _BOM_.location.search.slice(7) ];
            if (! iState)  return;

            BOM.history.state = iState[0];
            DOM.title = iState[1];

            $_Parent.trigger({
                type:     'popstate',
                state:    iState[0]
            });
        });
    });

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        if (_BOM_) {
            DOM.title = iTitle;
            if ($.browser.modern)  _BOM_.document.title = iTitle;
            _Pushing_ = true;
            _BOM_.location.search = 'index=' + (_State_.push(arguments) - 1);
        }
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob(iString);

        var iBuffer = new ArrayBuffer(iString.length);
        var uBuffer = new Uint8Array(iBuffer);

        for (var i = 0;  i < iString.length;  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append(iBuffer);
        return iBuilder.getBlob(iType);
    };

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),
            iResult = [ ];

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);
            iResult.push(
                ((iTemp.length == 8) ? '' : '0') + iTemp
            );
        }
        return iResult.join('');
    }

    $.dataHash = function (iAlgorithm, iData, iCallback, iFailback) {
        var iCrypto = BOM.crypto || BOM.msCrypto;
        var iSubtle = iCrypto.subtle || iCrypto.webkitSubtle;

        iAlgorithm = iAlgorithm || 'SHA-512';
        iFailback = iFailback || iCallback;

        try {
            iData = iData.split('');
            for (var i = 0;  i < iData.length;  i++)
                iData[i] = iData[i].charCodeAt(0);

            var iPromise = iSubtle.digest(
                    {name:  iAlgorithm},
                    new Uint8Array(iData)
                );

            if(typeof iPromise.then == 'function')
                iPromise.then(
                    function () {
                        iCallback.call(this, BufferToString(arguments[0]));
                    },
                    iFailback
                );
            else
                iPromise.oncomplete = function () {
                    iCallback.call(
                        this,  BufferToString( arguments[0].target.result )
                    );
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

})(self, self.document, self.jQuery);


//
//              >>>  iQuery+  <<<
//
//
//    [Version]    v1.5  (2016-08-05)  Stable
//
//    [Require]    iQuery  ||  jQuery with jQuery+
//
//
//        (C)2015-2016  shiy2008@gmail.com
//
});
