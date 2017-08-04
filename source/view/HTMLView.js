define([
    'jquery', './View', './DOMkit', './RenderNode', 'jQueryKit'
],  function ($, View, DOMkit, RenderNode) {

    function HTMLView($_View, iScope) {

        var _This_ = View.call(this, $_View, iScope);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:     0,
            __map__:    { },
        });
    }

    return  View.extend(HTMLView, {
        is:             function () {
            return true;
        },
        rawSelector:    $.makeSet('code', 'xmp', 'template')
    }, {
        parseSlot:     function (iNode) {

            iNode = iNode.getAttribute('name');

            var $_Slot = this.$_Content.filter(
                    iNode  ?
                        ('[slot="' + iNode + '"]')  :  '[slot=""], :not([slot])'
                );
            this.$_Content = this.$_Content.not( $_Slot );

            return $_Slot;
        },
        fixStyle:      function (iDOM) {

            this.$_View.cssRule(DOMkit.cssRule( iDOM.sheet ),  function () {

                iDOM = arguments[0].ownerNode;
            });

            return iDOM;
        },
        fixDOM:        function (iDOM) {

            var _This_ = this;

            switch ( iDOM.tagName.toLowerCase() ) {
                case 'link':      {
                    if (('rel' in iDOM)  &&  (iDOM.rel != 'stylesheet'))
                        return iDOM;

                    iDOM.onload = function () {

                        $( this ).replaceWith( _This_.fixStyle( this ) );
                    };
                    break;
                }
                case 'style':     iDOM = this.fixStyle( iDOM );    break;
                case 'script':    iDOM = DOMkit.fixScript( iDOM );
            }

            return iDOM;
        },
        signIn:        function (iNode) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            var iName = (iNode instanceof RenderNode)  ?  iNode  :  [
                    iNode.__name__  ||  iNode.name
                ];

            for (var j = 0;  iName[j];  j++)
                this.__map__[iName[j]] = (this.__map__[iName[j]] || 0)  +
                    Math.pow(2, i);
        },
        parsePlain:    function (iDOM) {

            var _This_ = this;

            $.each(
                Array.prototype.concat.apply(
                    $.makeArray( iDOM.attributes ),  iDOM.childNodes
                ),
                function () {
                    if ((! this.nodeValue)  ||  (
                        (this.nodeType != 2)  &&  (this.nodeType != 3)
                    ))
                        return;

                    var iTemplate = new RenderNode( this );

                    if (! iTemplate[0])  return;

                    _This_.signIn( iTemplate );

                    if ((! this.nodeValue)  &&  (this.nodeType == 2)  &&  (
                        ($.propFix[this.nodeName] || this.nodeName)  in
                        this.ownerElement
                    ))
                        this.ownerElement.removeAttribute( this.nodeName );
                }
            );
        },
        parse:         function () {

            this.scan(function (iNode) {

                if ((iNode instanceof Element)  &&  (iNode !== this.$_View[0]))
                    iNode = this.fixDOM( iNode );

                switch (true) {
                    case (iNode instanceof View):
                        this.signIn( iNode );    break;
                    case (
                        $.expr[':'].field( iNode )  &&  (iNode.type != 'file')  &&
                        (! iNode.defaultValue)
                    ):
                        this.signIn( iNode );
                    case !(
                        iNode.tagName.toLowerCase() in HTMLView.rawSelector
                    ):
                        this.parsePlain( iNode );
                }

                return iNode;
            });

            return this;
        },
        getNode:       function () {

            var iMask = '0',  _This_ = this;

            for (var iName in arguments[0])
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return  $.map(iMask.split('').reverse(),  function (iBit, Index) {

                if ((iBit > 0)  ||  ((_This_[Index] || '').type > 1))
                    return _This_[Index];
            });
        },
        render:        function (iData) {

            var _This_ = this,  _Data_ = { };

            if (typeof iData.valueOf() == 'string') {

                _Data_[iData] = arguments[1];
                iData = _Data_;
            }

            iData = this.commit( iData );  _Data_ = this.__data__;

            for (var iKey in iData)  this.watch(iKey, arguments.callee);

            if ( iData )
                $.each(this.getNode( iData ),  function () {

                    if (this instanceof RenderNode)
                        this.render(_This_, _Data_);
                    else if (this instanceof View)
                        this.render(_Data_[this.__name__]);
                    else
                        $( this )[
                            ('value' in this)  ?  'val'  :  'html'
                        ](
                            _Data_[this.name || this.getAttribute('name')]
                        );
                });

            return this;
        }
    });
});