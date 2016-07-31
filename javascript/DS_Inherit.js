define(['jquery'],  function ($) {

    function DataScope(iData) {
        if (! $.isEmptyObject(iData))  $.extend(this, iData);
    }

    return  function () {
        DataScope.prototype = arguments[0];

        var iData = new DataScope( arguments[1] );

        DataScope.prototype = null;

        return iData;
    };

});
