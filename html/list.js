$('body > .PC_Narrow').iWebApp().on('data',  'list.html',  function () {

    var $_List = $('ol.CenterX', this.$_Root[0]);

    if ($.fileName(arguments[0].action) == 'search')
        $( $_List[0].children[0] ).attr('src',  function () {
            return  arguments[1].replace(/\{\S+?\}/, 'top');
        });

    $.ListView($_List,  true,  function ($_Item, iValue) {
        $_Item.attr('title', iValue.description)
            .find('small > span')[0].title =
                (new Date(iValue.time)).toLocaleString();
    });
});
