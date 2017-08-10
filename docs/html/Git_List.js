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

        return {
            listURL:    function () {
                return [
                    this.Git_API, 'repos', this.Git_Account, this.Git_Repo,
                    'contents', this.Root_Path
                ].join('/')  +
                    '?ref='  +  (this.Git_Branch || 'gh-pages');
            },
            itemURL:    function () {
                return [
                    'https:/',  (this.Git_Account + '.github.io'),
                    this.Git_Repo, this.path,
                    (this.type === 'dir')  ?  'index.md'  :  ''
                ].join('/');
            }
        };
    });
});