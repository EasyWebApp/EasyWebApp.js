define([
    'jquery', 'View', 'Node_Template', 'DS_Inherit', 'iQuery+'
],  function ($, View, Node_Template, DS_Inherit) {

    function HTMLView($_View) {

        var _This_ = View.call(this, $_View);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:      0,
            __map__:     { },
            __last__:    0
        });
    }

    return  View.extend(HTMLView, {
        is:            function () {
            return true;
        },
        build:         function ($_View, iTemplate) {

            var $_Content = $_View.children();

            $_Content = (iTemplate && $_Content[0])  &&  $_Content.detach();

            return (
                iTemplate ?
                    $_View.htmlExec( iTemplate )  :  Promise.resolve('')
            ).then(function () {

                return  iTemplate && $_Content;
            });
        },
        rawSelector:    $.makeSet('code', 'xmp', 'template')
    }, {
        parseSlot:     function ($_Content) {

            var $_Slot = this.$_View.find('slot'),
                $_Named = $_Content.filter('[slot]');

            if ( $_Named[0] )
                $_Slot.filter('[name]').replaceWith(function () {
                    return $_Named.filter(
                        '[slot="' + this.getAttribute('name') + '"]'
                    );
                });

            $_Slot.not('[name]').replaceWith( $_Content.not( $_Named ) );

            return this;
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

                    if ((! this.nodeValue)  &&  (this.nodeType == 2))
                        this.ownerElement.removeAttribute( this.nodeName );
                }
            );
        },
        parse:         function () {

            this.scan(function (iNode) {

                switch (true) {
                    case (iNode instanceof View):  {

                        this.signIn(iNode, [iNode.__name__]);    break;
                    }
                    case ($.expr[':'].field( iNode )  &&  (! iNode.value)):  {

                        this.signIn(iNode, [iNode.name]);
                    }
                    case !(iNode.tagName.toLowerCase() in HTMLView.rawSelector):  {

                        this.parsePlain( iNode );
                    }
                }
            });

            return this;
        },
        scope:         function (iSup) {

            return  (! iSup)  ?  this.__data__  :
                View.prototype.scope.call(this,  DS_Inherit(iSup, this.__data__));
        },
        getNode:       function () {
            var iMask = '0',  _This_ = this;

            for (var iName in arguments[0])
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return  $.map(iMask.split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {

            if (typeof iData.valueOf() == 'string') {
                var _Data_ = { };
                _Data_[iData] = arguments[1];
                iData = _Data_;
            }

            var _This_ = this;  _Data_ = this.extend( iData );

            $.each(this.getNode(this.__last__ ? iData : _Data_),  function () {

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

            this.__last__ = $.now();

            return this;
        }
    });
});