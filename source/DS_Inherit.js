define(['jquery'],  function ($) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    var iPrototype = {
            constructor:    DataScope,
            extend:         function (iData) {
                switch (true) {
                    case  $.likeArray( iData ): {
                        this.length = iData.length;

                        Array.prototype.splice.call(
                            this,  iData.length,  iData.length
                        );
                    }
                    case  (! $.isEmptyObject(iData)):
                        $.extend(this, iData);
                        break;
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
                        (! iKey.match(/^(\d+|length)$/))
                    )
                        iValue[iKey] = this[iKey];

                return iValue;
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

});
