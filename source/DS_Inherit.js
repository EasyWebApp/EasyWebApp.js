define(['jquery'],  function ($) {

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

});
