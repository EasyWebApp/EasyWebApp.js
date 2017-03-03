define(['jquery', 'jQuery+'],  function ($) {

    function View($_View) {

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.constructor.instanceOf(this.$_View, false);

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        this.__id__ = $.uuid('View');
        this.__name__ = this.$_View.attr('name');

        this.$_View.data('[object View]', this);

        return this;
    }

    View.prototype.toString = function () {
        var iName = this.constructor.name;

        return  '[object ' + (
            (typeof iName == 'function')  ?  this.constructor.name()  :  iName
        )+ ']';
    };

    return  $.extend(View, {
        getClass:      function () {
            return  this.prototype.toString.call({constructor: this});
        },
        instanceOf:    function ($_Instance, Check_Parent) {

            var _Instance_;  $_Instance = $( $_Instance );

            while (_Instance_ = $_Instance.data('[object View]')) {

                if ((_Instance_ instanceof this)  ||  (Check_Parent === false))
                    return _Instance_;

                $_Instance = $_Instance.parent();
            }
        },
        findView:      function ($_Root) {

            var iClass = this,  iMap = { };

            return $.map(
                $( $_Root ).find(':data("[object View]")'),
                function () {
                    var iView = $.data(arguments[0], '[object View]');

                    if ((iView instanceof iClass)  &&  (! iMap[iView.__id__])) {

                        iMap[iView.__id__] = 1;

                        return iView;
                    }
                }
            );
        }
    });
});