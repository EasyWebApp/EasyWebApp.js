//
//                    >>>  EasyWebApp.js  <<<
//
//
//      [Version]    v4.0  (2017-09-18)  stable
//
//      [Require]    iQuery  ||  jQuery with jQueryKit
//
//      [Usage]      A Light-weight SPA Engine with
//                   jQuery Compatible API.
//
//
//              (C)2015-2017    shiy2008@gmail.com
//


define(['jquery', './WebApp', './InnerLink'],  function ($, WebApp, InnerLink) {

/* ---------- AMD based Component API ---------- */

    var _require_ = self.require,  _link_;

    self.require = $.extend(function () {

        if (! document.currentScript)  return _require_.apply(this, arguments);

        var iArgs = arguments,  iWebApp = new WebApp();

        var view = WebApp.View.instanceOf( document.currentScript );

        var link = (view.$_View[0] === iWebApp.$_View[0])  ?
                iWebApp[ iWebApp.lastPage ]  :
                InnerLink.instanceOf( view.$_View );

        _require_.call(this,  iArgs[0],  function () {

            _link_ = link;

            return  iArgs[1].apply(this, arguments);
        });
    },  _require_);


    WebApp.component = function (iFactory) {

        if (_link_)  _link_.emit('load', iFactory);

        return this;
    };

    $.extend(WebApp.prototype, {
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