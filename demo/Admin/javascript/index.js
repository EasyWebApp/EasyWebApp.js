(function (BOM, DOM, $) {

    var Image_Root = 'http://tnfs.tngou.net/img';

    function Data_Fix(iArray) {
        var Image_Key = iArray[0].src ? 'src' : 'img';

        return  $.map(iArray,  function (iValue) {
            if (iValue.time)
                iValue.time = (new Date(iValue.time)).toLocaleString();

            if ( (iValue[Image_Key] || '').indexOf('http') )
                iValue[Image_Key] = Image_Root + iValue[Image_Key];

            return iValue;
        });
    }

    $(DOM).on('click',  'th',  function () {
        $.ListView.getInstance(
            $('tbody', $(this).parents('table')[0])
        ).sort(function (A, B) {
            return  B.count - A.count;
        });
    });

    $('#Main_View').on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {
        var _TP_ = $.fileName(This_Page.HTML),
            _PP_ = $.fileName(Prev_Page.HTML);

        if ((! $.isEmptyObject(iData))  &&  (iData.status === false))
            return BOM.alert(iData.msg);

        switch ( _TP_.split('.')[0] ) {
            case 'news':         ;
            case 'image':        {
                if (_PP_  &&  (_PP_ == _TP_))  return Data_Fix(iData.tngou);

                $.ListView(
                    $.ListView.findView( $('form', this) ),
                    ['label', 'input'],
                    function ($_Item) {
                        var _UUID_ = $_Item.filter('input')[0].id = $.uuid();
                        $_Item.filter('label')[0].setAttribute('for', _UUID_);
                    }
                ).on('afterRender',  function () {
                    this.$_View.children('label')[0].click();
                });
                return {
                    content_type:    iData.tngou
                };
            }
            case 'gallery':      iData.list = Data_Fix(iData.list);
            case 'news_text':    return Data_Fix([iData])[0];
        }
    }).WebApp({ }, 'http://www.tngou.net');

})(self, self.document, self.iQuery);