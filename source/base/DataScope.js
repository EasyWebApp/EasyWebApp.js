define(['jquery'],  function ($) {

    /**
     * 数据作用域
     *
     * @author  TechQuery
     *
     * @class   DataScope
     * @extends Array
     *
     * @param   {object|object[]|DataScope} parent - Parent Scope
     *
     * @returns {DataScope}                 New Scope inherit from its Parent Scope
     */

    function DataScope(parent) {

        return  (parent instanceof DataScope)  ?  Object.create( parent )  :  this;
    }

    $.extend(DataScope.prototype = [ ],  {
        constructor:    DataScope,
        commit:         function (data, filter) {

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
        valueOf:        function () {

            if ( this.hasOwnProperty('length') )
                return  Array.from(this,  function (data) {

                    return data.valueOf();
                });

            var data = { };

            for (var key in this)
                if ( this.hasOwnProperty( key ) )
                    data[ key ] = this[ key ].valueOf();

            return data;
        }
    });

    return DataScope;

});