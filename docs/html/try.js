require(['jquery'],  function ($) {

    var OpenAPI = {
            type:    'data',
            src:     'tngou.net'
        },
        IE = ($.browser.msie < 12);

    $().iWebApp().off( OpenAPI ).on(OpenAPI,  function (_, iData) {

        if (iData.total != null) {
            iData.list = iData.tngou;
            delete iData.tngou;
        }
    }).component(function (iData) {

        iData.check = function () {

            var iText = (IE ? self : arguments[0]).clipboardData.getData(
                    IE ? 'text' : 'text/plain'
                );
            var iMore = this.Twitter.length + iText.length - 140;

            if (iMore > 0)  self.alert("超出的 " + iMore + "个字会被丢弃……");
        };
    });
});