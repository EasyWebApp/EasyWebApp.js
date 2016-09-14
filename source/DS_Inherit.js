define(['jquery'],  function ($) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    var iPrototype = {
            constructor:    DataScope,
            extend:         function (iData) {
                if (! $.isEmptyObject(iData)) {
                    $.extend(this, iData);

                    if ($.likeArray( iData )) {
                        this.length = iData.length;

                        Array.prototype.splice.call(
                            this,  iData.length,  iData.length
                        );
                    }
                }
                return this;
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
        DataScope.prototype = (iSup instanceof DataScope)  ?
            iSup  :  $.extend({ }, iSup, iPrototype);

        var iData = new DataScope(iSub);

        DataScope.prototype = { };

        return iData;
    };

});
