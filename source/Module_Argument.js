define(['jquery', 'jQuery+', 'MutationObserver'],  function ($) {

    function Module_Argument(iSource, Exclude_Name) {

        this.callee = iSource;

        Exclude_Name = $.makeSet.apply($, Exclude_Name);

        var _This_ = this;  this.length = 0;

        $.each(iSource.attributes,  function () {
            if (! (
                (this.nodeName in Exclude_Name)  ||
                (($.propFix[this.nodeName] || this.nodeName)  in  iSource)
            ))
                _This_[_This_.length++] = this.nodeName;
        });
    }

    $.extend(Module_Argument.prototype, {
        observe:    function (iCallback) {

            if (typeof iCallback == 'function')
                this.observer = new self.MutationObserver(function () {

                    $.each(arguments[0],  function () {

                        var iNew = this.target.getAttribute( this.attributeName );

                        if (iNew != this.oldValue)
                            iCallback.apply(this.target, [
                                this,  this.attributeName,  iNew,  this.oldValue
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