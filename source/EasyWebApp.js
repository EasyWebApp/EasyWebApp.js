//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v3.8  (2017-03-15)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQuery+,
//
//                   iQuery+
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
//


define(['jquery', 'WebApp'],  function ($, WebApp) {

    var _require_ = self.require,  _CID_;

    self.require = function () {

        if (! document.currentScript)  return _require_.apply(this, arguments);

        var iArgs = arguments,  iWebApp = new WebApp();

        var CID = iWebApp.getCID( document.currentScript.src );

        _require_.call(this,  iArgs[0],  function () {

            _CID_ = CID;

            return  iArgs[1].apply(this, arguments);
        });
    };

    WebApp.fn = WebApp.prototype;

    WebApp.fn.component = function (iFactory) {

        if ( this.loading[_CID_] )  this.loading[_CID_].emit('load', iFactory);

        return this;
    };

    return  $.fn.iWebApp = WebApp;

});