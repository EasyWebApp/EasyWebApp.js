//
//              >>>  iQuery+  <<<
//
//
//    [Version]    v1.0  (2016-03-29)  Stable
//
//    [Require]    iQuery  ||  jQuery with jQuery+
//
//
//        (C)2015-2016  shiy2008@gmail.com
//


(function (BOM, DOM, $) {

/* ---------- ListView Interface  v0.6 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp

    function ListView($_View, $_Item, onInsert) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onInsert);

        $_View = $($_View);
        if (typeof $_Item == 'function') {
            onInsert = $_Item;
            $_Item = null;
        }

        var iView = _Self_.getInstance($_View) || this;

        this.callback = {
            insert:         [ ],
            remove:         [ ],
            afterRender:    [ ]
        };
        if (onInsert)  iView.on('insert', onInsert);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('_LVI_', this);
        this.data = [ ];

        this.selector = $_Item;
        this.length = 0;

        for (;  ;  this.length++) {
            $_Item = this.itemOf(this.length);

            if (! $_Item.length)  break;

            this[this.length] = $_Item;
        }
        this.$_Template = this[0].clone(true);

//        this.limit = parseInt( this.$_View.attr('max') )  ||  Infinity;
//        this.limit = (this.data.length > this.limit) ? this.limit : this.data.length;
    }

    $.extend(ListView, {
        getInstance:    function () {
            var _Instance_ = $(arguments[0]).data('_LVI_');
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        },
        findView:       function ($_View, Init_Instance) {
            $_View = $($_View).find(
                'ul, ol, dl, tbody, select, datalist, *[multiple]'
            ).not('input[type="file"]');

            if (Init_Instance === true) {
                for (var i = 0;  i < $_View.length;  i++)
                    if (! this.getInstance($_View[i]))  this( $_View[i] );
            } else if (Init_Instance === false)
                $_View.data('_LVI_', null);

            return $_View;
        }
    });

    function _Callback_(iType, $_Item, iValue, Index) {
        var iCallback = this.callback[iType],  iReturn,
            iArgs = ($_Item instanceof $)  ?  [$_Item, iValue, Index]  :  [$_Item];

        for (var i = 0;  i < iCallback.length;  i++)
            iReturn = iCallback[i].apply(this, iArgs);

        return iReturn;
    }

    function New_Item($_Item, Index) {
        var $_Clone = this.$_Template.clone(true);

        if (! Index)
            this.$_View.prepend($_Clone);
        else {
            if (! $_Item.length)
                this.itemOf(Index - 1).slice(-1).after($_Clone);
            else
                $_Item.eq(0).before($_Clone);
        }

        return $_Clone;
    }

    $.extend(ListView.prototype, {
        on:         function (iType, iCallback) {
            if (
                (typeof iType == 'string')  &&
                (typeof iCallback == 'function')  &&
                (this.callback[iType].indexOf(iCallback) == -1)
            )
                this.callback[iType].push(iCallback);

            return this;
        },
        itemOf:     function (Index) {
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
        slice:      Array.prototype.slice,
        splice:     Array.prototype.splice,
        indexOf:    function (Index) {
            if (! isNaN(parseInt( Index )))
                return  $(this.slice(Index,  ++Index ? Index : undefined)[0]);

            var $_Item = $(Index);

            for (var i = 0;  i < this.length;  i++)
                if (this[i].index($_Item[0]) > -1)
                    return i;
            return -1;
        },
        insert:     function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;

            Index = parseInt(Index) || 0;
            Index = (Index < this.length)  ?  Index  :  this.length;

            var $_Item = this.itemOf(Index);
            var _Insert_ = (
                    (! $_Item.length)  ||  $_Item.hasClass('ListView_Item')
                );
            if (_Insert_)  $_Item = New_Item.call(this, $_Item, Index);

            var _Index_ = (Index < 0)  ?  (Index - 1)  :  Index;

            var iReturn = _Callback_.call(
                    this,  'insert',  $_Item,  iValue,  _Index_
                );
            if (_Insert_) {
                $_Item = this.itemOf(_Index_);
                this.splice(Index, 0, $_Item);
            }
            iValue = (iReturn === undefined) ? iValue : iReturn;

            $_Item.addClass('ListView_Item').data('LV_Model', iValue);
            this.data.splice(Index, 0, iValue);

            return this.indexOf(_Index_);
        },
        render:     function (iData) {
            iData = $.likeArray(iData) ? iData : [iData];

            for (var i = 0;  i < iData.length;  i++)
                this.insert(iData[i], i);

            _Callback_.call(this, 'afterRender', iData);

            return this;
        },
        valueOf:    function (Index) {
            var iValue = this.data.slice(
                    Index,  ++Index ? Index : undefined
                )[0];
            return  (iValue === undefined) ? $.makeArray(this.data) : iValue;
        },
        remove:     function (Index) {
            var $_Item = this.indexOf(Index);

            if (typeof $_Item == 'number') {
                if ($_Item < 0)  return this;
                Index = $_Item;
                $_Item = this.indexOf(Index);
            }
            if (
                $_Item.length  &&
                (false !== _Callback_.call(
                    this,  'remove',  $_Item,  this.valueOf(Index),  Index
                ))
            ) {
                this.data.splice(Index, 1);
                $_Item.remove();
                this.splice(Index, 1);
            }

            return this;
        },
        clear:      function () {
            this.data = [ ];
            this.splice(0, this.length);
            this.$_View.empty();

            return this;
        },
        focus:      function () {
            var $_Item = this.indexOf( arguments[0] );

            if (typeof $_Item == 'number') {
                if ($_Item < 0)  return this;
                $_Item = this.indexOf($_Item);
            }
            var $_Scroll = $_Item.scrollParents().eq(0).focus();

            $_Item.siblings().removeClass('active');

            $_Scroll.scrollTo( $_Item.addClass('active') );

            return this;
        },
        fork:       function () {
            var _Self_ = this.constructor,  $_View = this.$_View.clone(true);

            $_View.data({_LVI_: '',  LV_Model: ''})[0].id = '';

            var iFork = _Self_($_View.appendTo( arguments[0] ),  this.selector);
            iFork.callback = this.callback;

            return iFork;
        }
    });

    $.ListView = ListView;


/* ---------- TreeView Interface  v0.2 ---------- */

    function TreeView(iListView, iKey, onFork, onFocus) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, onFork, onFocus);

        this.unit = iListView.on('insert',  function ($_Item, iValue) {
            if (! iValue[iKey])  return;

            var iFork = this.fork($_Item).clear().render( iValue[iKey] );

            if (typeof onFork == 'function')  onFork.call(iFork);
        });

        if (typeof onFocus != 'function')  return;

        var _This_ = this;

        this.unit.$_View.on(
            $.browser.mobile ? 'tap' : 'click',
            function () {
                var $_Target = onFocus.apply(this, arguments);

                if ($_Target && _This_.$_Content) {
                    _This_.$_Content.scrollTo( $_Target );
                    return false;
                }
            }
        );
    }
    $.extend(TreeView.prototype, {
        bind:       function ($_Item, Depth_Sort, Data_Filter) {
            this.$_Content = $_Item.sameParents().eq(0);
            this.data = [ ];

            for (
                var  i = 0,  _Tree_ = this.data,  _Level_ = 0,  _Parent_;
                i < $_Item.length;
                i++
            ) {
                if (i > 0)
                    _Level_ = Depth_Sort.call(this,  $_Item[i - 1],  $_Item[i]);

                if (_Level_ > 0)
                    _Tree_ = _Tree_.slice(-1)[0].list = $.extend([ ], {
                        parent:    _Tree_
                    });
                else if (_Level_ < 0) {
                    _Parent_ = _Tree_.parent;
                    delete _Tree_.parent;
                    _Tree_ = _Parent_;
                }
                _Tree_.push( Data_Filter.call($_Item[i]) );
            }

            this.unit.clear().render( this.data );

            return this;
        },
        linkage:    function ($_Scroll, onScroll) {
            var _DOM_ = $_Scroll[0].ownerDocument;

            $_Scroll.scroll(function () {
                if (arguments[0].target !== this)  return;

                var iAnchor = $_Scroll.offset(),
                    iFontSize = $(_DOM_.body).css('font-size') / 2;

                var $_Anchor = $(_DOM_.elementFromPoint(
                        iAnchor.left + $_Scroll.css('padding-left') + iFontSize,
                        iAnchor.top + $_Scroll.css('padding-top') + iFontSize
                    ));
                return  onScroll.call(this, $_Anchor);
            });

            return this;
        }
    });

    $.TreeView = TreeView;


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
                    iCallback.call(this,  BufferToString( arguments[0].target.result ));
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

})(self, self.document, self.jQuery);