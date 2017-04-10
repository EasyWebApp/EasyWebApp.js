define([
    'jquery', 'View', 'DOMkit', 'Node_Template', 'iQuery+'
],  function ($, View, DOMkit, Node_Template) {

    function HTMLView($_View, iScope) {

        var _This_ = View.call(this, $_View, iScope);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:     0,
            __map__:    { },
        }).on('attach',  function () {

            this.$_View.find('style, link[rel="stylesheet"]').each(function () {

                View.instanceOf( this ).fixStyle( this );
            });
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
        fixStyle:       function (iDOM) {

            var CSS_Rule = $.map(iDOM.sheet.cssRules,  function (iRule) {

                    switch ( iRule.type ) {
                        case 1:    return  iRule;
                        case 4:    return  Array.apply(null, iRule.cssRules);
                    }
                });

            for (var i = 0;  CSS_Rule[i];  i++)
                CSS_Rule[i].selectorText = '#' + this.__id__ + ' ' +
                    CSS_Rule[i].selectorText;

            iDOM.disabled = false;

            return iDOM;
        },
        fixDOM:         function (iDOM, BaseURL) {
            var iKey = 'src';

            switch ( iDOM.tagName.toLowerCase() ) {
                case 'style':     this.fixStyle( iDOM );    break;
                case 'link':      {
                    if (('rel' in iDOM)  &&  (iDOM.rel != 'stylesheet'))
                        return iDOM;

                    iKey = 'href';

                    iDOM.onload = this.fixStyle.bind(this, iDOM);    break;
                }
                case 'script':    iDOM = DOMkit.fixScript( iDOM );    break;
                case 'img':       ;
                case 'iframe':    ;
                case 'audio':     ;
                case 'video':     break;
                case 'a':         ;
                case 'area':      ;
                case 'form':      {
                    iKey = ('href' in iDOM)  ?  'href'  :  'action';

                    DOMkit.fixLink( iDOM );    break;
                }
                default:          iKey = 'data-href';
            }

            DOMkit.prefetch(iDOM,  DOMkit.fixURL(iDOM, iKey, BaseURL));

            return iDOM;
        },
        signIn:        function (iNode, iName) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

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
                    if ((this.nodeType != 2)  &&  (this.nodeType != 3))
                        return;

                    var iTemplate = new Node_Template( this );

                    var iName = iTemplate.getRefer();

                    if (! iName[0])  return;

                    _This_.signIn(iTemplate, iName);

                    if ((! this.nodeValue)  &&  (this.nodeType == 2)  &&  (
                        ($.propFix[this.nodeName] || this.nodeName)  in
                        this.ownerElement
                    ))
                        this.ownerElement.removeAttribute( this.nodeName );
                }
            );
        },
        parse:         function (BaseURL, iTemplate) {
            if ( iTemplate ) {
                this.$_Content = this.$_View.children().detach();

                this.$_View[0].innerHTML = iTemplate;
            }

            this.scan(function (iNode) {

                if (iNode instanceof Element) {

                    if (iNode.tagName.toLowerCase() == 'slot')
                        return $.map(
                            this.parseSlot( iNode ),  arguments.callee.bind( this )
                        );

                    if (
                        (iNode != this.$_View[0])  &&
                        (iNode.outerHTML != this.lastParsed)
                    ) {
                        iNode = this.fixDOM(iNode, BaseURL);

                        this.lastParsed = iNode.outerHTML;
                    }
                }

                switch (true) {
                    case (iNode instanceof View):
                        this.signIn(iNode, [iNode.__name__]);    break;
                    case (
                        $.expr[':'].field( iNode )  &&  (iNode.type != 'file')  &&
                        (! iNode.defaultValue)
                    ):
                        this.signIn(iNode, [iNode.name]);
                    case !(
                        iNode.tagName.toLowerCase() in HTMLView.rawSelector
                    ):
                        this.parsePlain( iNode );
                }

                return iNode;
            });

            delete this.$_Content;

            return this;
        },
        getNode:       function () {
            var iMask = '0',  _This_ = this;

            for (var iName in arguments[0])
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return  $.map(iMask.split('').reverse(),  function (iBit, Index) {

                if ((iBit > 0)  ||  (_This_[Index] || '').hasScope)
                    return _This_[Index];
            });
        },
        render:        function (iData) {
            var _Data_ = { };

            if (typeof iData.valueOf() == 'string') {

                _Data_[iData] = arguments[1];
                iData = _Data_;
            }

            var _This_ = this;  _Data_ = this.extend( iData );

            $.each(this.getNode( iData ),  function () {

                if (this instanceof Node_Template)
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
        },
        clear:         function () {

            return  this.render( this.__data__.clear() );
        }
    });
});