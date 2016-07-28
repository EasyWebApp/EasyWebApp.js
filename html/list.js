//define(['jquery'],  function ($) {

    $('body > .PC_Narrow').on('data',  function () {
        $.ListView(this,  true,  function () {
            arguments[0][0].title = (new Date(arguments[1].time)).toLocaleString();
        });
    });
//});