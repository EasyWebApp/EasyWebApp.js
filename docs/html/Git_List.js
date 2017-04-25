require(['jquery'],  function ($) {

    var iWebApp = $().iWebApp();

    iWebApp.component(function (iData) {

        var iEvent = {
                type:    'request',
                src:     iData.Git_API
            };

        iWebApp.off( iEvent ).on(iEvent,  function () {

            arguments[1].transport.setRequestHeader(
                'Authorization',  'token ' + iData.Git_Token
            );
        });
    });
});