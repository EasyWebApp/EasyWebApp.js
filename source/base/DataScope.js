define(['jquery'],  function ($) {

    /**
     * 数据作用域
     *
     * @author TechQuery
     *
     * @class DataScope
     *
     * @param {object|object[]|DataScope} parent - Parent Scope
     *
     * @return {DataScope} New Scope inherit from its Parent Scope
     */

    function DataScope(parent) {

        return  (parent instanceof DataScope)  ?  Object.create( parent )  :  this;
    }

    $.extend(DataScope.prototype, {
        commit:     function (data, filter) {

            data = data.valueOf();

            var diff = { };

            for (var key in data)
                if (
                    (data[ key ]  !=  null)  ||
                    (! this.hasOwnProperty( key ))  ||
                    (this[key] !== data[key])
                )
                    this[ key ] = diff[ key ] = data[ key ];

            return diff;
        },
        valueOf:    function () {

            if ( this.hasOwnProperty('length') )
                return  Array.from(this,  function (data) {

                    return data.valueOf();
                });

            var data = { };

            for (var key in this)
                if ( this.hasOwnProperty( key ) )
                    data[ key ] = this[ key ].valueOf();

            return data;
        },
        insert:     function (data, index) {

            index = Math.min(
                index || 0,
                this.length = this.hasOwnProperty('length') ? this.length : 0
            );

            for (var i = this.length;  i > index;  i--)
                this[i] = this[i - 1];

            this[ index ] = data;

            if (this.hasOwnProperty( this.length ))  this.length++;

            return index;
        }
    });

    return DataScope;

});
