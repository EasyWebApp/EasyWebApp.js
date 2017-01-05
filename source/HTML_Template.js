define([
    'jquery', 'DS_Inherit', 'Node_Template', 'iQuery+'
],  function ($, DS_Inherit, Node_Template) {

    function HTML_Template($_View, iScope, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.type = (
            $.ListView.findView( this.$_View.parent() ).filter( this.$_View )[0]  ?
                'list'  :  'plain'
        );
        this.scope = DS_Inherit(iScope,  { });

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;

        this.length = 0;
        this.map = { };

        this.lastRender = 0;
    }

    var RAW_Tag = $.makeSet('CODE', 'XMP', 'TEMPLATE');

    $.extend(HTML_Template, {
        getClass:       $.CommonView.getClass,
        instanceOf:     $.CommonView.instanceOf,
        getMaskCode:    function (Index) {
            return  (Index < 0)  ?  0  :  parseInt(1 + '0'.repeat(Index),  2);
        },
        getTextNode:    function (iDOM) {
            return Array.prototype.concat.apply(
                $.map(iDOM.childNodes,  function (iNode) {
                    if (
                        (iNode.nodeType == 3)  &&
                        (! (iNode.parentNode.tagName in RAW_Tag))  &&
                        (iNode.nodeValue.indexOf('${') > -1)
                    )
                        return iNode;
                }),
                iDOM.attributes
            );
        },
        extend:         function (iTarget, iSource) {
            iSource = this.getTextNode( iSource );

            for (var i = 0;  iSource[i];  i++)
                if (iSource[i].nodeName != 'target')
                    iTarget.setAttribute(
                        iSource[i].nodeName,  iSource[i].nodeValue
                    );

            var $_Target = this.instanceOf( iTarget );

            iTarget = $_Target.parsePlain( iTarget );

            for (var i = 0;  iTarget[i];  i++)
                iTarget[i].render( $_Target.scope );
        }
    });

    $.extend(HTML_Template.prototype, {
        toString:      $.CommonView.prototype.toString,
        push:          Array.prototype.push,
        pushMap:       function (iName, iNode) {
            iNode = HTML_Template.getMaskCode(this.push(iNode) - 1);

            iName = (typeof iName == 'string')  ?  [iName]  :  iName;

            for (var i = 0;  iName[i];  i++)
                this.map[iName[i]] = (this.map[iName[i]] || 0)  +  iNode;

            return this;
        },
        parsePlain:    function () {
            var _This_ = this;

            return  $.map(
                HTML_Template.getTextNode( arguments[0] ),
                function (iNode) {
                    var iTemplate = new Node_Template( iNode );

                    var iName = iTemplate.getRefer();

                    if (! iName[0])  return;

                    _This_.pushMap(iName, iTemplate);

                    if ((! iNode.nodeValue)  &&  (iNode.nodeType == 2))
                        iNode.ownerElement.removeAttribute( iNode.nodeName );

                    return iTemplate;
                }
            );
        },
        parseList:     function (iList) {
            var iView = $[
                    $(':media', iList)[0]  ?  'GalleryView'  :  'ListView'
                ]( iList ),
                _This_ = this;

            return this.pushMap(
                iList.getAttribute('name'),
                iView.on('insert',  function () {

                    (new HTML_Template(arguments[0], _This_.scope)).parse();

                }).on('update',  function () {

                    HTML_Template.instanceOf( arguments[0] )
                        .render( arguments[1] );
                })
            );
        },
        parse:         function ($_Exclude) {
            if (this.type == 'list')
                return  this.parseList( this.$_View[0] );

            $_Exclude = $.likeArray( $_Exclude )  ?  $_Exclude  :  $( $_Exclude );

            var $_List = $.ListView.findView( this.$_View )
                    .filter('[name]').not( $_Exclude );

            var $_DOM = this.$_View.find('*').not(
                    $_List.add( $_Exclude ).find('*')
                );

            var $_Input = $_DOM.filter('[name]:input').not(function () {
                    return (
                        this.defaultValue || this.getAttribute('value') || ''
                    ).match( Node_Template.expression );
                });

            for (var i = 0;  $_Input[i];  i++)
                this.pushMap(
                    $_Input[i].name || $_Input[i].getAttribute('name'),  $_Input[i]
                );

            $_DOM = $_DOM.add( this.$_View ).filter(function () {

                return  this.outerHTML.match( Node_Template.expression );
            });

            var $_Plain = $_DOM.not( $_List );

            for (var i = 0;  $_Plain[i];  i++)
                this.parsePlain( $_Plain[i] );

            for (var i = 0;  $_List[i];  i++)
                this.parseList( $_List[i] );

            return this;
        },
        load:          function () {
            var _This_ = this;

            this.$_Slot = this.$_View.is('body [href]:not(a, link, [target])') ?
                this.$_View.children().remove() : $();

            return  new Promise(function () {

                if (_This_.source)
                    _This_.$_View.load(_This_.source,  arguments[0]);
                else
                    arguments[0]( _This_.$_View[0].innerHTML );

            }).then(function () {

                var $_Slot = _This_.$_View.find('slot'),
                    $_Named = _This_.$_Slot.filter('[slot]');

                if ( $_Named[0] )
                    $_Slot.filter('[name]').replaceWith(function () {
                        return $_Named.filter(
                            '[slot="' + this.getAttribute('name') + '"]'
                        );
                    });

                $_Slot.not('[name]').replaceWith(_This_.$_Slot.not( $_Named ));
            });
        },
        data2Node:     function (iData) {
            var iMask = '0',  _This_ = this;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = $.bitOperate('|',  iMask,  this.map[ iName ]);

            return  $.map(iMask.split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {
            this.scope.extend( iData );

            iData = this.lastRender  ?  (iData || this.scope)  :  $.extend(
                $.makeSet('', Object.keys(this.map)),  this.scope
            );

            var Last_Render = this.lastRender;

            var Render_Node = $.each(this.data2Node( iData ),  function () {

                    if (this instanceof Node_Template)
                        this.render( iData );
                    else if (this instanceof $.ListView) {
                        if (! Last_Render)
                            this.clear().render(
                                iData[ this.$_View[0].getAttribute('name') ]
                            );
                    } else
                        $( this )[
                            ('value' in this)  ?  'val'  :  'html'
                        ](
                            iData[this.name || this.getAttribute('name')]
                        );
                });

            this.lastRender = $.now();

            return Render_Node;
        },
        indexOf:       function (iNode) {
            for (var i = 0;  this[i];  i++)
                if (
                    (this[i] == iNode)  ||  (
                        (this[i] instanceof Node_Template)  &&  (
                            (iNode == this[i].ownerNode)  ||
                            (iNode == this[i].ownerNode.nodeName)
                        )
                    )
                )  return i;

            return -1;
        },
        contextOf:     function (iNode) {
            var iContext = { },  iValue;

            for (var iKey in this.map) {
                iValue = this.scope[ iKey ];

                if (iNode  ?
                    parseInt($.bitOperate(
                        '&', this.map[iKey], HTML_Template.getMaskCode(
                            this.indexOf(iNode)
                        )
                    ), 2)  :
                    ((iValue != null)  &&  (! $.likeArray(iValue)))
                )
                    iContext[ iKey ] = iValue;
            }

            return iContext;
        },
        valueOf:       function (iScope) {
            if (! iScope)  return this;

            var iTemplate = this;

            while (iTemplate.scope !== iScope) {
                iTemplate = HTML_Template.instanceOf(
                    iTemplate.$_View[0].parentElement
                );
                if (! iTemplate)  return this;
            }

            return iTemplate;
        }
    });

    return HTML_Template;

});
