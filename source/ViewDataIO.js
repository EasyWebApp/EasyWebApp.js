define(['jquery', 'DS_Inherit', 'iQuery+'],  function ($, DS_Inherit) {

    function ArrayRender(iArray, ValueRender, iScope) {

        iArray = iScope  ?  DS_Inherit(iScope, iArray)  :  iArray;

        $.ListView(this,  function ($_Item, iValue) {

            $_Item.data('EWA_DS',  DS_Inherit(iArray, iValue))
                .value('name', iValue);

            ValueRender.call($_Item, iValue, iArray);

        }).clear().render( iArray );
    }

    function ObjectRender(iData, iScope) {
        var _Self_ = arguments.callee;

        if ($.likeArray( iData ))
            return  ArrayRender.call(this[0], iData, _Self_, iScope);

        var iView = $.CommonView.instanceOf(this, false);

        if (iView)  return iView.render(iData);

        this.value('name',  function (iName) {

            if ($.likeArray( iData[iName] ))
                ArrayRender.call(this, iData[iName], _Self_, iData);
            else if ($.isPlainObject( iData[iName] ))
                _Self_.call($(this), iData[iName]);
            else
                return iData[iName];
        });
    }

    $.fn.extend({
        dataRender:    function (iData) {
            switch (true) {
                case  $.likeArray( iData ):    {
                    var iView = $.ListView.instanceOf(this, false);

                    ArrayRender.call(
                        iView  ?
                            iView.$_View[0]  :  $.ListView.findView(this, true)[0],
                        iData,
                        ObjectRender
                    );

                    break;
                }
                case  (! $.isEmptyObject(iData)):
                    ObjectRender.call(this, iData);
            }

            return this;
        },
        dataReader:    function () {
            var $_Key = $('[name]', this[0]).not( $('[name] [name]', this[0]) ),
                iData = { };

            if (! $_Key[0])  return this.value();

            for (var i = 0, iName, iLV;  i < $_Key.length;  i++) {
                iName = $_Key[i].getAttribute('name');
                iLV = $.ListView.instanceOf($_Key[i], false);

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
