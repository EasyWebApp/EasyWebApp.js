define(['jquery', 'PageLink'],  function ($, PageLink) {

    var BOM = self,  DOM = self.document;

/* ---------- [object InnerPage] ---------- */

    function InnerPage(App_Instance, iLink) {
        $.extend(this, {
            ownerApp:      App_Instance,
            sourceLink:    iLink,
            title:         iLink.title || DOM.title,
            URL:           iLink.alt || BOM.location.href,
            HTML:          iLink.href || DOM.URL,
            method:        iLink.method,
            JSON:          iLink.src || iLink.action,
            time:          $.now(),
            innerLink:     [ ]
        });
    }

    $.extend(InnerPage.prototype, {
        show:       function ($_Page) {
            $_Page = $_Page ? $($_Page) : this.$_Page;

            var iHistory = this.ownerApp.history;
            var iForward = iHistory.isForward(this);

            if (! $_Page) {
                if (this.sourceLink.type != 'Inner')
                    BOM.setTimeout(function () {
                        BOM.history[iForward ? 'forward' : 'back']();
                    });
                else {
                    this.sourceLink = new PageLink(
                        this.ownerApp,  this.sourceLink.valueOf()
                    );
                    this.sourceLink.$_DOM[0].click();
                }
                return this;
            }

            var $_Target = this.sourceLink.getTarget();

            if (iHistory.length || iForward)  iHistory.move( $_Target );

            this.$_Page = $_Page.appendTo( $_Target ).fadeIn();

            if (! arguments.length) {
                var Link_DOM = iHistory.last(true).sourceLink.$_DOM[0];
                var iListView = $.ListView.getInstance( Link_DOM.parentElement );

                if (iListView)
                    iListView.focus(Link_DOM);
                else
                    Link_DOM.scrollIntoView();
            }

            return this;
        },
        valueOf:    PageLink.prototype.valueOf
    });

    return InnerPage;

});