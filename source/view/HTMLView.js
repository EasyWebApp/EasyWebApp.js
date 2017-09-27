define([
    'jquery', './View', './DOMkit', './RenderNode'
],  function ($, View, DOMkit, RenderNode) {

    function HTMLView($_View, iScope) {

        var _This_ = View.call(this, $_View, iScope);

        return  (_This_ !== this)  ?
            _This_ :
            this.setPrivate( {length: 0,  map: { }} );
    }

    View.extend(HTMLView, {
        is:             function () {

            return  (! $.expr[':'].list( arguments[0] ));
        },
        rawSelector:    $.makeSet('code', 'xmp', 'template'),
        getValue:       function (field) {

            if (field.type !== 'checkbox')
                return  $( field )[('value' in field) ? 'val' : 'html']();

            field = field.form.elements[ field.name ];

            return  $.likeArray( field )  ?
                $.map(field,  function (_This_) {

                    return  _This_.checked ? _This_.value : null;
                })  :  (
                    field.checked ? field.value : ''
                );
        }
    }, {
        signIn:        function (iNode) {

            for (var i = 0;  this[i];  i++)  if (this[i] == iNode)  return;

            this[this.length++] = iNode;

            var iName = (iNode instanceof RenderNode)  ?  iNode  :  [
                    iNode.__name__  ||  iNode.name
                ];

            for (var j = 0;  iName[j];  j++)
                this.watch( iName[j] ).__map__[iName[j]] =
                    (this.__map__[iName[j]] || 0)  +  Math.pow(2, i);
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

            return  this.scan(function (iNode) {

                var $_View = this.$_View,
                    tag = (iNode.tagName || '').toLowerCase();

                if ((iNode instanceof Element)  &&  (iNode !== $_View[0]))
                    switch ( tag ) {
                        case 'link':      {
                            if (('rel' in iNode)  &&  (iNode.rel != 'stylesheet'))
                                break;

                            iNode.onload = function () {

                                $( this ).replaceWith(
                                    DOMkit.fixStyle($_View, this)
                                );
                            };
                            return;
                        }
                        case 'style':     return  DOMkit.fixStyle($_View, iNode);
                        case 'script':    return  DOMkit.fixScript( iNode );
                    }

                if (iNode instanceof View)
                    this.signIn( iNode );
                else if ( !(tag in HTMLView.rawSelector))
                    this.parsePlain( iNode );
            });
        },
        nodeOf:        function (data, exclude, forEach) {

            forEach = (forEach instanceof Function)  &&  forEach;

            var iMask = '0',  _This_ = this;

            for (var iName in data)
                if (this.__map__.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.__map__[ iName ]);

            return $.map(
                iMask.padStart(this.length, 0).split('').reverse(),
                function (bit, node) {

                    node = _This_[ node ];

                    if ((node !== exclude)  &&  (
                        (bit > 0)  ||  ((node || '').type > 1)
                    )) {
                        forEach  &&  forEach.call(_This_, node);

                        return node;
                    }
                }
            );
        },
        render:        function render(iData, value) {

            var _Data_ = { },  exclude;

            if (iData instanceof Element) {

                exclude = iData;

                iData = exclude.getAttribute('name');

                value = HTMLView.getValue( exclude );
            }

            if (typeof iData.valueOf() === 'string') {

                _Data_[iData] = value;    iData = _Data_;
            }

            _Data_ = this.__data__;

            this.nodeOf(_Data_.commit( iData ),  exclude,  function (node) {

                if (node instanceof RenderNode)
                    node.render(this, _Data_);
                else if (node instanceof View) {

                    node.render(_Data_[node.__name__]);

                    _Data_[node.__name__] = node.__data__;
                } else
                    node.innerHTML = _Data_[ node.getAttribute('name') ];
            });

            return this;
        }
    }).registerEvent('template');

//  Render data from user input

    $('html').on('input change',  ':field',  $.throttle(function () {

        var iView = HTMLView.instanceOf( this );

        if (iView  &&  $( this ).validate())  iView.render( this );

    })).on('reset',  'form',  function () {

        var data = $.paramJSON('?'  +  $( this ).serialize());

        for (var key in data)  data[ key ] = '';

        HTMLView.instanceOf( this ).render( data );
    });

    return HTMLView;

});