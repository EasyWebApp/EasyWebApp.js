define([
    'jquery', 'Node_Template', 'Observer', 'jQuery+'
],  function ($, Node_Template, Observer) {

    function View($_View) {

        if (this.constructor == arguments.callee)
            throw TypeError(
                "View() is an Abstract Base Class which can't be instantiated."
            );

        this.$_View = ($_View instanceof $)  ?  $_View  :  $( $_View );

        var _This_ = this.constructor.instanceOf(this.$_View, false);

        if ((_This_ != null)  &&  (_This_ != this))  return _This_;

        $.extend(this, {
            __id__:      $.uuid('View'),
            __name__:    this.$_View.attr('name'),
            __data__:    { }
        });

        this.$_View.data('[object View]', this);

        if ( this.$_View[0].dataset.href )  this.attrWatch();

        return this;
    }

    $.extend(View.prototype, {
        toString:      function () {

            var iName = this.constructor.name;

            return  '[object ' + (
                (typeof iName == 'function')  ?  this.constructor.name()  :  iName
            )+ ']';
        },
        watch:         function (iKey) {
            var _This_ = this;

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {
                        if (_This_.__data__.hasOwnProperty( iKey ))
                            return _This_.__data__[iKey];
                    },
                    set:    function () {
                        _This_.render(iKey, arguments[0]);
                    }
                });
        },
        extend:        function (iData) {

            for (var iKey in iData)
                if (iData.hasOwnProperty( iKey )) {

                    this.__data__[iKey] = iData[iKey];

                    this.watch( iKey );
                }

            return this.__data__;
        },
        attrWatch:     function () {
            var _This_ = this;

            this.extend( this.$_View[0].dataset );

            this.__observer__ = new self.MutationObserver(function () {

                var iData = { };

                $.each(arguments[0],  function () {

                    var iNew = this.target.getAttribute( this.attributeName ),
                        iOld = this.oldValue;

                    if (
                        (iNew != iOld)  &&
                        (! (iOld || '').match( Node_Template.expression ))
                    )
                        iData[ this.attributeName.slice(5) ] = iNew;
                });

                if (! $.isEmptyObject( iData ))
                    _This_.render( iData ).trigger('update', iData);
            });

            this.__observer__.observe(this.$_View[0], {
                attributes:           true,
                attributeOldValue:    true,
                attributeFilter:      $.map(
                    this.$_View[0].attributes,
                    function (iNode) {

                        return  iNode.nodeName.match(/^data-[\w\-]+$/i) ?
                            iNode.nodeName : null;
                    }
                )
            });
        },
        destructor:    function () {

            this.$_View.data('[object View]', null).empty();

            if (this.__observer__)  this.__observer__.disconnect();

            delete this.__data__;
        },
        scope:         function (iSup) {
            this.__data__ = iSup;

            for (var i = 0;  this[i];  i++)
                if (this[i] instanceof View)  this[i].scope( iSup );

            return this;
        }
    });

    $.each(['trigger', 'on', 'off'],  function (Index, iName) {

        View.prototype[this] = function () {

            if ( Index )  arguments[0] += '.EWA_View';

            $.fn[iName].apply(this.$_View, arguments);

            return this;
        };
    });

    View.prototype.one = Observer.prototype.one;

    $.extend(View, {
        getClass:        function () {

            return this.prototype.toString.call(
                {constructor: this}
            ).split(' ')[1].slice(0, -1);
        },
        signSelector:    function () {
            var _This_ = this;

            $.expr[':'][ this.getClass().toLowerCase() ] = function () {
                return (
                    ($.data(arguments[0], '[object View]') || '') instanceof _This_
                );
            };

            return this;
        }
    });

    return  $.extend(View.signSelector(),  {
        extend:        function (iConstructor, iStatic, iPrototype) {
            return $.inherit(
                this, iConstructor, iStatic, iPrototype
            ).signSelector();
        },
        instanceOf:    function ($_Instance, Check_Parent) {

            var _Instance_;  $_Instance = $( $_Instance );

            do {
                _Instance_ = $_Instance.data('[object View]');

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        }
    });
});