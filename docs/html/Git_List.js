define(['jquery'],  function ($) {

    var iAuth;

    return  function (iData) {
        if (! iAuth)
            $.ajaxPrefilter(function (iOption, _, iXHR) {

                if (iOption.url.indexOf( iData.Git_API )  >  -1)
                    iXHR.setRequestHeader(
                        'Authorization',  'token ' + iData.Git_Token
                    );
            });
    };
});