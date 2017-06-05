define(['jquery', 'jQueryKit'],  function ($) {

    function DataScope(iSuper) {

        this.__data__ = Object.create(iSuper || { });

        this.__data__.splice = this.__data__.splice || Array.prototype.splice;
    }

    $.extend(DataScope.prototype, {
        commit:      function (iData) {
            var _Data_ = { };

            if ($.likeArray( iData )) {
                _Data_ = [ ];

                this.__data__.splice(0, Infinity);
            }

            for (var iKey in iData)
                if (
                    iData.hasOwnProperty( iKey )  &&  (iData[iKey] != null)  &&  (
                        (typeof iData[iKey] == 'object')  ||
                        (! this.__data__.hasOwnProperty( iKey ))  ||
                        (iData[iKey] != this.__data__[iKey])
                    )
                )  _Data_[iKey] = this.__data__[iKey] = iData[iKey];

            return _Data_;
        },
        watch:       function (iKey, iSetter) {

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {

                        return  this.__data__[iKey];
                    },
                    set:    iSetter.bind(this, iKey)
                });
        },
        valueOf:     function () {

            var iValue = this.__data__.hasOwnProperty('length')  ?
                    Array.apply(null, this.__data__)  :  { };

            for (var iKey in this.__data__)
                if (this.__data__.hasOwnProperty( iKey )  &&  (! $.isNumeric(iKey)))
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        clear:       function () {

            var iData = this.__data__;

            if ( iData.hasOwnProperty('length') )  iData.splice(0, Infinity);

            for (var iKey in iData)  if (iData.hasOwnProperty( iKey )) {

                if ($.likeArray( iData[iKey] ))
                    iData.splice.call(iData[iKey], 0, Infinity);
                else
                    iData[iKey] = '';
            }

            return this;
        }
    });

    return DataScope;
});
