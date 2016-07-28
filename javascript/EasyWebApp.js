define(['jquery', 'WebApp', 'UI_Module'],  function ($, WebApp, UI_Module) {

    $.fn.iWebApp = function () {
        return  this[0]  &&  (new WebApp(this[0], arguments[0]));
    };

    $(document).on('click change submit',  WebApp.$_Link,  function (iEvent) {

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
