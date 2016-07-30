$('body > .PC_Narrow').iWebApp().on('data',  'comment.html',  function () {

    $.ListView($('ol', arguments[0].$_Root[0]));

    return  Data_Filter.apply(this, arguments);
});
