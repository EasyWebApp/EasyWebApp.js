define(['jquery', 'jQuery+', 'iQuery+'],  function ($) {

    function ArrayRender(iArray, ValueRender) {
        $.ListView(this,  function () {
            ValueRender.call(arguments[0], arguments[1]);
        }).clear().render( iArray );
    }

    function ObjectRender(iData) {
        var _Self_ = arguments.callee;

        if (iData instanceof Array)
            return  ArrayRender.call(this[0], iData, _Self_);

        var iView = $.CommonView.getInstance(this);

        if (iView)  return iView.render(iData);

        this.value('name',  function (iName) {

            if (iData[iName] instanceof Array)
                ArrayRender.call(this, iData[iName], _Self_);
            else if ($.isPlainObject( iData[iName] ))
                _Self_.call($(this), iData[iName]);
            else
                return iData[iName];
        });
    }

    $.fn.extend({
        dataRender:    function (iData) {
            if (iData instanceof Array)
                ArrayRender.call(
                    $.ListView.findView(this, true)[0],  iData,  ObjectRender
                );
            else
                ObjectRender.call(this, iData);

            return this;
        },
        dataReader:    function () {
            var $_Key = $('[name]', this[0]).not( $('[name] [name]', this[0]) ),
                iData = { };

            if (! $_Key[0])  return this.value();

            for (var i = 0, iName, iLV;  i < $_Key.length;  i++) {
                iName = $_Key[i].getAttribute('name');
                iLV = $.ListView.getInstance( $_Key[i] );

                if (! iLV)
                    iData[iName] = arguments.callee.call( $( $_Key[i] ) );
                else {
                    iData[iName] = [ ];

                    for (var j = 0;  j < iLV.length;  j++)
                        iData[iName][j] = $.extend(
                            iLV.valueOf(j),  arguments.callee.call( iLV[j] )
                        );
                }
            }
            return iData;
        }
    });

});