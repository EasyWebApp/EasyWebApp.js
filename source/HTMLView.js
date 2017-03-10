define([
    'jquery', 'View', 'Node_Template', 'iQuery+'
],  function ($, View, Node_Template) {

    function HTMLView($_View, $_Template) {

        var _This_ = View.call(this, $_View);

        if (this != _This_)  return _This_;

        $.extend(this, {
            length:      0,
            __map__:     { },
            __data__:    { }
        });

        if ( $_Template )  this.parseSlot( $_Template );
    }

    return  View.extend(HTMLView, {
        rawSelector:    'code, xmp, template'
    }, {
        parseSlot:     function ($_Template) {

            var $_All = this.$_View.children().detach();

            var $_Slot = this.$_View.append( $_Template ).find('slot'),
                $_Named = $_All.filter('[slot]');

            if ( $_Named[0] )
                $_Slot.filter('[name]').replaceWith(function () {
                    return $_Named.filter(
                        '[slot="' + this.getAttribute('name') + '"]'
                    );
                });

            $_Slot.not('[name]').replaceWith( $_All.not( $_Named ) );
        },
        watch:         function (iKey) {
            var _This_ = this;

            if (! (iKey in this))
                Object.defineProperty(this, iKey, {
                    get:    function () {
                        return _This_.__data__[iKey];
                    },
                    set:    function () {
                        _This_.render(iKey, arguments[0]);
                    }
                });
        },
        signIn:        function (iNode, iName) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            for (var j = 0;  iName[j];  j++) {
                this.__map__[iName[j]] = (this.__map__[iName[j]] || 0)  +
                    Math.pow(2, i);

                if ( $.browser.modern )  this.watch( iName[j] );
            }
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
        parse:         function ($_Exclude) {

            var _This_ = this,  $_Sub = this.$_View.find(':view');

            for (var i = 0;  $_Sub[i];  i++)
                this.signIn(
                    View.instanceOf( $_Sub[i] ),  [ $_Sub[i].getAttribute('name') ]
                );

            $_Exclude = $( $_Exclude ).add( $_Sub ).find('*').add( $_Sub );

            this.$_View.each(function () {

                var $_All = $('*', this).not( $_Exclude ).add( this );

                var $_Input = $_All.filter(':field');

                for (var i = 0;  $_Input[i];  i++)
                    _This_.signIn($_Input[i], [$_Input[i].name]);

                var $_Plain = $_All.not( HTMLView.rawSelector );

                for (var i = 0;  $_Plain[i];  i++)
                    _This_.parsePlain( $_Plain[i] );
            });

            return this;
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

            $.extend(this.__data__, iData);

            $.each(this.getNode( iData ),  function () {

                if (this instanceof Node_Template)
                    this.render( iData );
                else if (this instanceof View)
                    this.render( iData[this.__name__] );
                else
                    $( this )[
                        ('value' in this)  ?  'val'  :  'html'
                    ](
                        iData[this.name || this.getAttribute('name')]
                    );
            });

            return this;
        }
    });
});