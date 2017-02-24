define([
    'jquery', 'Node_Template', 'jQuery+', 'MutationObserver'
],  function ($, Node_Template) {

    function Module_Argument(iSource, Exclude_Name) {

        this.callee = iSource;

        this.exclude = $.makeSet.apply($, Exclude_Name);

        this.length = 0;

        this.update();
    }

    $.extend(Module_Argument.prototype, {
        push:       function (iAttr) {

            if (! (iAttr.nodeName in this))
                this[ this.length++ ] = iAttr.nodeName;

            this[ iAttr.nodeName ] =
                (iAttr.nodeValue || '').match( Node_Template.expression )  ?
                    null  :  iAttr.nodeValue;

            return iAttr;
        },
        update:     function () {
            var _This_ = this;

            $.each(this.callee.attributes,  function () {
                if (! (
                    (this.nodeName in _This_.exclude)  ||
                    (this.nodeName in _This_.constructor.prototype)  ||
                    (($.propFix[this.nodeName] || this.nodeName)  in  _This_.callee)
                ))
                    _This_.push( this );
            });
        },
        valueOf:    function () {
            this.update();

            var iData = { };

            for (var i = 0;  this[i];  i++)  if (this[this[i]] != null)
                iData[ this[i] ] = this[ this[i] ];

            return iData;
        },
        observe:    function (iCallback) {
            var _This_ = this;

            if (typeof iCallback == 'function')
                this.observer = new self.MutationObserver(function () {

                    $.each(arguments[0],  function () {

                        var iNew = this.target.getAttribute( this.attributeName ),
                            iOld = this.oldValue;

                        if (
                            (iNew != iOld)  &&
                            (! (iOld || '').match( Node_Template.expression ))
                        )
                            iCallback.apply(_This_.push( this.target ), [
                                this,  this.attributeName,  iNew,  iOld
                            ]);
                    });
                });

            if ( this.observer )
                this.observer.observe(this.callee, {
                    attributes:           true,
                    attributeOldValue:    true,
                    attributeFilter:      $.makeArray( this )
                });

            return this;
        },
        destructor:    function () {
            this.observer.disconnect();
        }
    });

    return Module_Argument;

});