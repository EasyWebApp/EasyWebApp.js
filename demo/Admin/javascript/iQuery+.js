//
//          >>>  iQuery+  <<<
//
//
//    [Version]     v0.4  (2015-12-3)
//
//    [Based on]    jQuery  v1.9+
//
//
//      (C)2015  shiy2008@gmail.com
//


(function (BOM, DOM, $) {

/* ---------- ListView Object  v0.2 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp

    function ListView() {
        var iArgs = $.makeArray(arguments);

        this.$_View = iArgs.shift();
        this.$_Template = this.$_View.children().eq(0).clone(true);
        this.data = (iArgs[0] instanceof Function)  ?  [ ]  :  iArgs.shift();
        this.onRenderOne = iArgs[0];
    }

    ListView.listSelector = 'ul, ol, dl, tbody, *[multiple]';

    $.extend(ListView.prototype, {
        renderOne:     function (iValue) {
            var $_Clone = this.$_Template.clone(true);

            this.onRenderOne(
                $_Clone.data('LV_Model', iValue),  iValue
            );
            return $_Clone;
        },
        render:        function (iData) {
            this.data = iData  ?  [ ].concat.apply(iData, this.data)  :  this.data;

            var iLimit = parseInt( this.$_View.attr('max') )  ||  Infinity;
            iLimit = (this.data.length > iLimit) ? iLimit : this.data.length;

            var $_List = $();

            for (var i = 0;  i < iLimit;  i++)
                $_List.add( this.renderOne( this.data[i] ) );

            $_List.prependTo( this.$_View );
        },
        insert:        function (iData, Index) {
            Index = Index || 0;

            this.data.splice(Index, 0, iData);
            this.$_View.eq(Index).before( this.renderOne(iData) );
        },
        delete:        function (Index) {
            Index = parseInt(Index);
            if (isNaN( Index ))  return;

            this.data.splice(Index, 1);
            this.$_View.eq(Index).remove();
        }
    });

    $.ListView = function ($_View, iData, iRender) {
        return  new ListView($($_View), iData, iRender);
    };

    $.ListView.listSelector = ListView.listSelector;


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