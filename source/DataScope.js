define(['jquery', 'jQuery+'],  function ($) {

    function DataScope(iSuper) {

        return  (iSuper instanceof DataScope)  ?
            Object.create( iSuper )  :  this;
    }

    $.extend(DataScope.prototype, {
        splice:      Array.prototype.splice,
        commit:      function (iData) {
            var _Data_ = { };

            if ($.likeArray( iData )) {
                _Data_ = [ ];

                this.splice(0, Infinity);
            }

            for (var iKey in iData)
                if (
                    iData.hasOwnProperty( iKey )  &&  (iData[iKey] != null)  &&  (
                        (typeof iData[iKey] == 'object')  ||
                        (! this.hasOwnProperty( iKey ))  ||
                        (iData[iKey] != this[iKey])
                    )
                )  _Data_[iKey] = this[iKey] = iData[iKey];

            return _Data_;
        },
        valueOf:     function () {

            var iValue = this.hasOwnProperty('length')  ?
                    Array.apply(null, this)  :  { };

            for (var iKey in this)
                if (this.hasOwnProperty( iKey )  &&  (! $.isNumeric(iKey)))
                    iValue[iKey] = this[iKey];

            return iValue;
        },
        clear:       function () {

            if (this.hasOwnProperty('length'))  this.splice(0, Infinity);

            for (var iKey in this)  if (this.hasOwnProperty( iKey )) {

                if ($.likeArray( this[iKey] ))
                    this.splice.call(this[iKey], 0, Infinity);
                else
                    this[iKey] = '';
            }

            return this;
        }
    });

    return DataScope;
});
