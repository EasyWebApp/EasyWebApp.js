$('body > .PC_Narrow').on('data',  function () {
    var iComment = $('div[href]', this)[0];

    iComment.setAttribute('src',  $.extendURL(iComment.getAttribute('src'), {
        id:    arguments[1].data.id
    }));

    return  Data_Filter.apply(this, arguments);
});