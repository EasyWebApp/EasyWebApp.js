(function (BOM, DOM, $) {

    var Proxy_API = 'php/proxy.php?second_out=10800&url=';

    function Image_Proxy(iValue) {
        return  Proxy_API + BOM.encodeURIComponent(
            'http://tnfs.tngou.net/img' + iValue
        );
    }

    $('#Main_View').on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {
        var _TP_ = $.fileName(This_Page.HTML),
            _PP_ = $.fileName(Prev_Page.HTML);

        switch ( _TP_.split('.')[0] ) {
            case 'news':         ;
            case 'image':        {
                if ((! _PP_)  ||  (_PP_ != _TP_))
                    return {
                        content_type:    iData
                    };

                return  $.map(iData.tngou,  function (iValue) {
                    iValue.time = (new Date(iValue.time)).toLocaleString();

                    iValue.img = Image_Proxy(iValue.img);

                    return iValue;
                });
            }
            case 'news_text':    ;
            case 'gallery':      {
                var Image_Key = iData.list[0].src ? 'src' : 'img';

                return  $.map(iData.list,  function (iValue) {
                    iValue[Image_Key] = Image_Proxy( iValue[Image_Key] );

                    return iValue;
                });
            }
        }
    }).WebApp({ }, 'http://www.tngou.net');

})(self, self.document, self.iQuery);