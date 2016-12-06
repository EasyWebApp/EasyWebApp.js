define([
    'jquery', 'DS_Inherit', 'Node_Template', 'iQuery+'
],  function ($, DS_Inherit, Node_Template) {

    function HTML_Template($_View, iScope, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.scope = DS_Inherit(iScope,  { });

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;

        this.length = 0;
        this.map = { };

        this.lastRender = 0;
    }

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
                        (iNode.nodeValue.indexOf('${') > -1)
                    )
                        return iNode;
                }),
                iDOM.attributes
            );
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
        },
        parse:         function () {
            var $_DOM = this.$_View.find('*').not('[name]:list *').not(
                    this.$_View.find('[src] *')
                ),
                _This_ = this;

            $_DOM.filter('[name]:input').each(function () {

                _This_.pushMap(this.name || this.getAttribute('name'),  this);
            });

            $_DOM = $_DOM.add( this.$_View ).filter(function () {
                return  this.outerHTML.match( Node_Template.expression );
            });

            $_DOM.not(
                $_DOM.not('[name]:list').each(function () {

                    $.each(HTML_Template.getTextNode( this ),  function () {
                        var iTemplate = new Node_Template( this );

                        var iName = iTemplate.getRefer();

                        if (! iName[0])  return;

                        _This_.pushMap(iName, iTemplate);

                        if ((! this.nodeValue)  &&  (this.nodeType == 2))
                            this.ownerElement.removeAttribute( this.nodeName );
                    });
                })
            ).each(function () {

                _This_.pushMap(
                    this.getAttribute('name'),
                    $.ListView( this ).on('insert',  function () {

                        (new HTML_Template(arguments[0], _This_.scope)).parse();

                    }).on('update',  function () {

                        HTML_Template.instanceOf( arguments[0] )
                            .render( arguments[1] );
                    })
                );
            });

            return this;
        },
        load:          function () {
            var _This_ = this;

            return  new Promise(function () {

                if (_This_.source)
                    _This_.$_View.load(_This_.source,  arguments[0]);
                else
                    arguments[0]( _This_.$_View[0].innerHTML );

            }).then(function () {

                _This_.parse();
            });
        },
        data2Node:     function (iData) {
            var iMask = 0,  _This_ = this;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = iMask  |  this.map[ iName ];

            return  $.map(iMask.toString(2).split('').reverse(),  function () {

                return  (arguments[0] > 0)  ?  _This_[ arguments[1] ]  :  null;
            });
        },
        render:        function (iData) {
            this.scope.extend( iData );

            iData = this.lastRender ? this.scope : $.extend(
                $.makeSet('', Object.keys(this.map)),  this.scope,  iData
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
        getContext:    function (iNode) {
            var iContext = { },  iValue;

            for (var iKey in this.map) {
                iValue = this.scope[ iKey ];

                if (iNode  ?
                    (this.map[iKey] & HTML_Template.getMaskCode(
                        this.indexOf(iNode)
                    ))  :
                    ((iValue != null)  &&  (! $.likeArray(iValue)))
                )
                    iContext[ iKey ] = iValue;
            }

            return iContext;
        }
    });

    return HTML_Template;

});
