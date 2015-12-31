(function (BOM, DOM, $) {

    var Image_Root = 'http://tnfs.tngou.net/img';

    function Data_Fix() {
        return  $.map(arguments[0],  function (iValue) {
            iValue.time = (new Date(iValue.time)).toLocaleString();

            iValue.img = Image_Root + iValue.img;

            return iValue;
        });
    }

    $('#Main_View').on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {
        var _TP_ = $.fileName(This_Page.HTML),
            _PP_ = $.fileName(Prev_Page.HTML);

        switch ( _TP_.split('.')[0] ) {
            case 'news':         ;
            case 'image':        {
                if ((! _PP_)  ||  (_PP_ != _TP_))
                    return {
                        content_type:    iData.tngou
                    };
                return Data_Fix(iData.tngou);
            }
            case 'news_text':    return Data_Fix([iData])[0];
            case 'gallery':      {
                var Image_Key = iData.list[0].src ? 'src' : 'img';

                return  $.map(iData.list,  function (iValue) {
                    iValue[Image_Key] = Image_Root + iValue[Image_Key];

                    return iValue;
                });
            }
        }
    }).WebApp({ }, 'http://www.tngou.net');

})(self, self.document, self.iQuery);