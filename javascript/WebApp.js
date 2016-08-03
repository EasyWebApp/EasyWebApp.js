define(['jquery', 'UI_Module', 'InnerLink'],  function ($, UI_Module, InnerLink) {

    var BOM = self,  DOM = self.document;

    function WebApp() {
        var iApp = $('*:data("_EWA_")').data('_EWA_') || this;

        if (iApp !== this)  return iApp;

        $.Observer.call(this, 1);

        this.$_Root = $( arguments[0] ).data('_EWA_', this);

        this.apiPath = arguments[1];

        this.length = 0;
        this.lastPage = -1;

        $(BOM).on('popstate',  function () {
            var Index = (arguments[0].originalEvent.state || '').index;

            if (typeof Index != 'number')  return;

            iApp[iApp.lastPage].detach();
            iApp[iApp.lastPage = Index].attach();
        });

        (new UI_Module(new InnerLink(this, DOM.body)))
            .load().render( $.paramJSON() );
    }

    WebApp.prototype = $.extend(new $.Observer(),  {
        constructor:    WebApp,
        push:           Array.prototype.push,
        splice:         Array.prototype.splice,
        register:       function (iPage) {
            if (this.$_Root[0] !== iPage.$_View[0])  return;

            if (this.lastPage > -1)  this[this.lastPage].detach();

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, this.length);

            BOM.history.pushState(
                {index: this.length},  iPage.source.title || DOM.title,  DOM.URL
            );
            this.push( iPage );

            return this;
        }
    });

    return WebApp;

});
