$('.Content > .Panel > div[href]').on('data',  function () {

    $.ListView($('ol', this));

    return  Data_Filter.apply(this, arguments);
});