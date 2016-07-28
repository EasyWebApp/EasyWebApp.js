define(['jquery', 'UI_Module'],  function ($, UI_Module) {

    function WebApp() {
        var iApp = $('#EWA_ViewPort').data('_EWA_');

        if (iApp instanceof arguments.callee)  return iApp;

        this.$_Root = $( arguments[0] ).data('_EWA_', this)
            .prop('id', 'EWA_ViewPort');

        this.apiPath = arguments[1];
        this.history = [ ];
    }

    var _Link_ = '*[target]:not(a)';

    WebApp.prototype.boot = function () {
        var $_Module = $('body').find('*[href]:not(a), *[src]:not(img, iframe)')
                .not(_Link_);

        for (var i = 0;  $_Module[i];  i++)
            (new UI_Module(this, $_Module[i])).load();

        return this;
    };

    $.fn.iWebApp = function () {
        return  this[0]  &&  (new WebApp(this[0], arguments[0])).boot();
    };

    $(document).on('click change submit',  _Link_,  function (iEvent) {

        if (this.tagName == 'FORM') {
            if (iEvent.type != 'submit')
                return;
            else
                iEvent.preventDefault();
        } else if (
            (this !== iEvent.target)  &&
            $(iEvent.target).parentsUntil(this).addBack().filter('a')[0]
        )
            return;

        (new UI_Module(
            new WebApp(),  '*[name="' + this.getAttribute('target') + '"]',  this
        )).load();
    });

});
