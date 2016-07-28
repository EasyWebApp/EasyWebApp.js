define(['jquery', 'UI_Module'],  function ($, UI_Module) {

    var BOM = self,  DOM = self.document;

    function WebApp() {
        var iApp = $('#EWA_ViewPort').data('_EWA_');

        if (iApp instanceof arguments.callee)  return iApp;

        this.$_Root = $( arguments[0] ).data('_EWA_', this)
            .prop('id', 'EWA_ViewPort');

        this.apiPath = arguments[1];

        this.length = 0;
        this.lastPage = -1;

        this.boot();
    }

    WebApp.$_Link = '*[target]:not(a)';

    $.extend(WebApp.prototype, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        boot:        function () {
            var iApp = this;

            $(BOM).on('popstate',  function () {
                var Index = arguments[0].originalEvent.state.index;

                iApp[iApp.lastPage].detach();
                iApp[iApp.lastPage = Index].attach();
            });

            var $_Module = $('body').find('*[href]:not(a), *[src]:not(img, iframe)')
                    .not( this.constructor.$_Link );

            for (var i = 0;  $_Module[i];  i++)
                (new UI_Module(this, $_Module[i])).load();
        },
        register:    function (iPage) {
            if (this.$_Root[0] !== iPage.$_Root[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            BOM.history.pushState(
                {index: this.length},  iPage.title || DOM.title,  DOM.URL
            );
            this.push( iPage );
        }
    });

    return WebApp;

});
