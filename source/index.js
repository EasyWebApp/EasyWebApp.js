//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v4.0  (2017-08-04)  Beta
//
//      [Require]    iQuery  ||  jQuery with jQueryKit
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
//


define(['jquery', './WebApp'],  function ($, WebApp) {

/* ---------- AMD based Component API ---------- */

    var _require_ = self.require,  _CID_;

    self.require = $.extend(function () {

        if (! document.currentScript)  return _require_.apply(this, arguments);

        var iArgs = arguments,  iWebApp = new WebApp();

        var CID = iWebApp.getCID( document.currentScript.src );

        _require_.call(this,  iArgs[0],  function () {

            _CID_ = CID;

            return  iArgs[1].apply(this, arguments);
        });
    },  _require_);


    $.extend(WebApp.fn = WebApp.prototype,  {
        component:     function (iFactory) {

            if ( this.loading[_CID_] )  this.loading[_CID_].emit('load', iFactory);

            return this;
        },
        loadPage:      function (iURI) {
            return (
                (! iURI)  ?  Promise.resolve('')  :  new Promise(function () {

                    $( self ).one('popstate', arguments[0])[0].history.go( iURI );
                })
            ).then((function () {

                return  this.load( this[this.lastPage] );

            }).bind( this ));
        },
        setURLData:    function (key, value) {

            var URL = this.getRoute().split(/&?data=/);

            if (typeof key === 'string') {

                var name = key;  key = { };

                key[ name ] = value;
            }

            if (!  $.isEqual(key,  $.intersect(key, $.paramJSON( URL[0] ))))
                self.history.pushState(
                    {
                        index:    this.lastPage,
                        data:     key
                    },
                    document.title,
                    '#!' + self.btoa(
                        $.extendURL(URL[0], key)  +  (
                            URL[1]  ?  ('&data=' + URL[1])  :  ''
                        )
                    )
                );

            return this;
        }
    });

/* ---------- jQuery based Helper API ---------- */

    $.fn.view = function (Class_Name) {

        if (! this[0])  return;

        return  Class_Name  ?
            (new WebApp[Class_Name](this[0], arguments[1]))  :
            WebApp.View.instanceOf(this[0], false);
    };

    return  $.fn.iWebApp = WebApp;

});