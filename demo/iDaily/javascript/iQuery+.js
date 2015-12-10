//
//          >>>  iQuery+  <<<
//
//
//    [Version]     v0.5  (2015-12-10)
//
//    [Based on]    jQuery  v1.9+
//
//
//      (C)2015  shiy2008@gmail.com
//


(function (BOM, DOM, $) {

/* ---------- ListView Interface  v0.3 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp

    function ListView($_View, onInsert) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInsert);

        $_View = $($_View);

        iView = $_View.data('_LVI_');
        iView = (iView instanceof _Self_)  ?  iView  :  this;

        this.callback = {
            insert:    [ ],
            remove:    [ ]
        };
        if (onInsert)  iView.on('insert', onInsert);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('_LVI_', this);
        this.$_Template = $(this.$_View[0].children[0]).addClass('ListView_Item');
        this.length = 0;
        this.data = [ ];

//        this.limit = parseInt( this.$_View.attr('max') )  ||  Infinity;
//        this.limit = (this.data.length > this.limit) ? this.limit : this.data.length;
    }

    ListView.listSelector = 'ul, ol, dl, tbody, *[multiple]';

    function _Callback_($_Item, iValue, Index) {
        var iCallback = this.callback.insert,  iReturn;

        for (var i = 0;  i < iCallback.length;  i++)
            iReturn = iCallback[i].call(
                this,  $_Item.data('LV_Model', iValue),  iValue,  Index
            );
        return iReturn;
    }

    $.extend(ListView.prototype, {
        on:         function (iType, iCallback) {
            if (
                (typeof iType == 'string')  &&
                (typeof iCallback == 'function')
            )
                this.callback[iType].push(iCallback);

            return this;
        },
        indexOf:    function () {
            return  this.$_View.children('.ListView_Item').eq( arguments[0] );
        },
        insert:     function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;
            Index = Index || 0;

            var $_Clone = this.$_Template.clone(true);

            this.indexOf(Index).before( $_Clone[0] );

            var iReturn = _Callback_.call(this, $_Clone, iValue, Index);

            this.data.splice(
                Index,  0,  (iReturn === undefined) ? iValue : iReturn
            );

            this.length++ ;

            return $_Clone;
        },
        render:     function (iData, DetachTemplate) {
            iData = $.likeArray(iData) ? iData : [iData];

            for (var i = 0;  i < iData.length;  i++)
                this.insert( iData[i] );

            if (DetachTemplate)  this.$_Template.detach();

            return this;
        },
        remove:     function (Index) {
            Index = parseInt(Index);
            if (isNaN( Index ))  return;

            _Callback_.call(
                this,
                this.indexOf(Index).remove(),
                this.data.splice(Index, 1)[0],
                Index
            );
        },
        valueOf:    function () {
            var iValue = this.data[Number( arguments[0] )];

            return  (iValue === undefined) ? $.makeArray(this.data) : iValue;
        }
    });

    $.ListView = ListView;


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