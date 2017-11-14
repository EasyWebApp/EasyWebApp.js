require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    var IE = ($.browser.msie < 12);


    EWA.component(function (data) {

        $.extend(data, {
            check:      function () {

                var iText = (IE ? self : arguments[0]).clipboardData.getData(
                        IE ? 'text' : 'text/plain'
                    );
                var iMore = this.Twitter.length + iText.length - 140;

                if (iMore > 0)  self.alert("超出的 " + iMore + "个字会被丢弃……");
            }
        });
    });
});