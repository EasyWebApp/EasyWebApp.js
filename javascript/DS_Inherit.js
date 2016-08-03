define(['jquery'],  function ($) {

    function DataScope(iData) {
        if (! $.isEmptyObject(iData))  $.extend(this, iData);
    }

    var iPrototype = {
            constructor:    DataScope,
            toString:       function () {
                return  '[object DataScope]';
            },
            valueOf:        function () {
                if (this.hasOwnProperty('length'))  return $.makeArray(this);

                var iValue = { };

                for (var iKey in this)
                    if (! iKey.match(/^(\d+|length)$/))
                        iValue[iKey] = this[iKey];

                return iValue;
            }
        };

    return  function (iSup, iSub) {
        DataScope.prototype = $.isEmptyObject(iSup) ? iPrototype : iSup;

        var iData = new DataScope(iSub);

        DataScope.prototype = null;

        return iData;
    };

});
