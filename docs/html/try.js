iWebApp.define(['jquery'],  function ($, iData) {

    var vm = this;

    iData.check = function () {

        var iText = arguments[0].clipboardData.getData('text/plain');

        var iMore = iText.length - 140;

        if (iMore > 0)  self.alert("超出的 " + iMore + "个字会被丢弃……");
    };
});