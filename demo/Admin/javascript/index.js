(function (BOM, DOM, $) {

    var Proxy_API = 'php/proxy.php?second_out=10800&url=';

    function Image_Proxy(iValue) {
        return  Proxy_API + BOM.encodeURIComponent(
            'http://tnfs.tngou.net/img'  +  (iValue.img || iValue.src)
        );
    }

    $('#Main_View').on('pageRender',  function (iEvent, This_Page, Prev_Page, iData) {
        switch ( $.fileName(This_Page.HTML).split('.')[0] ) {
            case 'image':      {
                if ($.fileName(Prev_Page.HTML) == 'index.html')
                    return {
                        content_type:    iData
                    };

                return  $.map(iData.tngou,  function (iValue) {
                    iValue.time = (new Date(iValue.time)).toLocaleString();

                    iValue.img = Image_Proxy(iValue.img);

                    return iValue;
                });
            }
            case 'gallery':
                return  $.map(iData.list,  function (iValue) {
                    iValue.src = Image_Proxy(iValue.src);

                    return iValue;
                });
        }
    }).WebApp({ }, 'http://www.tngou.net');

})(self, self.document, self.iQuery);