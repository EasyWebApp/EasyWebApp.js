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
        toString:    $.CommonView.prototype.toString,
        push:        Array.prototype.push,
        pushMap:     function (iName, iNode) {
            iNode = parseInt(1 + '0'.repeat(this.push(iNode) - 1),  2);

            iName = (typeof iName == 'string')  ?  [iName]  :  iName;

            for (var i = 0;  iName[i];  i++)
                this.map[iName[i]] = (this.map[iName[i]] || 0)  +  iNode;
        },
        parse:        function () {
            var $_DOM = this.$_View.find('*:not([name]:list *)'),  _This_ = this;

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
        load:         function () {
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
        maskCode:     function (iData) {
            var iMask = 0;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = iMask  |  this.map[ iName ];

            return iMask.toString(2);
        },
        render:       function (iData) {
            this.scope.extend( iData );

            iData = this.lastRender ? this.scope : $.extend(
                $.makeSet('', Object.keys(this.map)),  this.scope,  iData
            );

            var iMask = this.maskCode( iData ).split('').reverse();

            for (var i = 0, iName;  iMask[i];  i++)  if (iMask[i] > 0)
                switch (true) {
                    case (this[i] instanceof Node_Template):
                        this[i].render( iData );
                        break;
                    case (this[i] instanceof $.ListView):
                        if (! this.lastRender)
                            this[i].clear().render(
                                iData[ this[i].$_View[0].getAttribute('name') ]
                            );
                        break;
                    default:
                        $( this[i] )[
                            ('value' in this[i])  ?  'val'  :  'html'
                        ](iData[
                            this[i].name || this[i].getAttribute('name')
                        ]);
                }

            this.lastRender = $.now();

            return this;
        }
    });

    return HTML_Template;

});
