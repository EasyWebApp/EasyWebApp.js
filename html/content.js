$('body > .PC_Narrow').iWebApp().on('data',  'content.html',  function (iModule) {
    var iComment = iModule.$_Root.find('.Content > .Panel > .Body')[0];

    iComment.setAttribute('src',  $.extendURL(iComment.getAttribute('src'), {
        id:    iModule.data.id
    }));

    return  Data_Filter.apply(this, arguments);
});
