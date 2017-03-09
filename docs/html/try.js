iWebApp.define(['jquery'],  function ($, Data_Fix) {

    $().iWebApp().component(function () {

        this.ownerApp.on('data',  '',  '/top/list',  function () {

            return arguments[1].tngou;
        });
    });
});