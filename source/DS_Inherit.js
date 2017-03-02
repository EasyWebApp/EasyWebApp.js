define(['jquery'],  function ($) {

    function DataScope() {
        this.extend( arguments[0] );
    }

    $.extend(DataScope.prototype, {
        extend:       function (iData) {
            switch (true) {
                case  $.likeArray( iData ):          {
                    this.length = iData.length;

                    Array.prototype.splice.call(
                        this,  iData.length,  iData.length
                    );
                }
                case  (! $.isEmptyObject(iData)):    $.extend(this, iData);
            }

            return this;
        },
        setValue:     function (iName) {
            var iScope = this,  _Parent_;

            while (! (
                $.isEmptyObject(iScope)  ||  iScope.hasOwnProperty(iName)
            )) {
                _Parent_ = Object.getPrototypeOf( iScope );

                if (_Parent_ === DataScope.prototype) {
                    iScope = this;
                    break;
                }
                iScope = _Parent_;
            }

            iScope[iName] = arguments[1];

            return iScope;
        },
        valueOf:      function () {
            if (this.hasOwnProperty('length'))  return $.makeArray(this);

            var iValue = { };

            for (var iKey in this)
                if (
                    this.hasOwnProperty(iKey)  &&
                    (! iKey.match(/^(\d+|length)$/))  &&
                    (typeof this[iKey] != 'function')
                )
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        isNoValue:    function () {
            for (var iKey in this)
                if (typeof this[iKey] != 'function')
                    return false;

            return true;
        }
    });

    return  function (iSup, iSub) {

        return Object.create(
            (iSup instanceof DataScope)  ?  iSup  :  DataScope.prototype
        ).extend( iSub );
    };

});
