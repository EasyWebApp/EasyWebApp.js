require(['jquery', 'iQuery+'],  function ($) {

    var iApp = $('body > .PC_Narrow').iWebApp();

    var iModule = iApp.getModule( iApp.$_Root );

    iModule.domReady.then(function () {

        var $_List = $('ol.CenterX', iApp.$_Root[0]);

        if ($.fileName( iModule.source.action )  ==  'search')
            $( $_List[0].children[0] ).attr('src',  function () {
                return  arguments[1].replace(/\{\S+?\}/, 'top');
            });

        $.ListView($_List,  true,  function ($_Item, iValue) {
            $_Item.attr('title', iValue.description)
                .find('small > span')[0].title =
                    (new Date(iValue.time)).toLocaleString();
        });

        iModule.render( arguments[0] );
    });
});
