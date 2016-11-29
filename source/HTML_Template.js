define(['jquery', 'iQuery+'],  function ($) {

    function HTML_Template($_View, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;

        this.length = 0;
        this.map = { };
    }

    try {
        eval('``');

        var ES_ST = function () {
                return  eval('`' + arguments[0] + '`');
            };
    } catch (iError) {
        var Eval_This = function () {
                return  eval( arguments[0] );
            };
    }

    $.extend(HTML_Template, {
        getClass:       $.CommonView.getClass,
        instanceOf:     $.CommonView.instanceOf,
        expression:     /\$\{([\s\S]+?)\}/g,
        reference:      /this\.(\w+)/,
        eval:           function (iTemplate, iContext) {
            return  ES_ST  ?  ES_ST.call(iContext, iTemplate)  :
                iTemplate.replace(this.expression,  function () {

                    return  Eval_This.call(iContext, arguments[1]);
                });
        },
        getContext:     function (iTemplate, iData) {
            var iContext = { };

            (iTemplate || '').replace(this.expression,  function () {

                arguments[1].replace(HTML_Template.reference,  function () {

                    iContext[ arguments[1] ] = iData[ arguments[1] ];
                });
            });

            return iContext;
        },
        getMaskCode:    function () {
            return  parseInt(1 + '0'.repeat( arguments[0] ),  2)
        },
        getTextNode:    function (iDOM) {
            return Array.prototype.concat.apply(
                $.map(iDOM.childNodes,  function (iNode) {
                    return  (iNode.nodeType == 3)  ?  iNode  :  null;
                }),
                iDOM.attributes
            );
        }
    });

    $.extend(HTML_Template.prototype, {
        toString:    $.CommonView.prototype.toString,
        push:        Array.prototype.push,
        pushMap:     function (iName, iNode) {

            var iMask = this.push((iNode instanceof $.ListView)  ?  iNode  :  {
                    node:        iNode,
                    template:    iNode.nodeValue,
                    parent:      iNode.parentNode || iNode.ownerElement
                });

            this.map[iName] = this.map[iName] || 0;

            this.map[iName] += HTML_Template.getMaskCode(iMask - 1);

            return this;
        },
        parse:        function () {
            var $_DOM = this.$_View.find('*:not([name]:list *)').not(function () {

                    return  (! this.outerHTML.match( HTML_Template.expression ));
                }),
                _This_ = this;

            $_DOM.not(
                $_DOM.not('[name]:list').each(function () {

                    $.each(HTML_Template.getTextNode( this ),  function () {
                        var iNode = this;

                        var iValue = this.nodeValue.replace(
                                HTML_Template.expression,
                                function (iName) {
                                    iName = iName.match( HTML_Template.reference );

                                    iName = (iName || '')[1];

                                    if ( iName )  _This_.pushMap(iName, iNode);

                                    return '';
                                }
                            );
                        if (iValue == this.nodeValue)  return;

                        if ((! iValue)  &&  (this.nodeType == 2))
                            this.ownerElement.removeAttribute( this.nodeName );
                        else
                            this.nodeValue = iValue;
                    });
                })
            ).each(function () {

                _This_.pushMap(
                    this.getAttribute('name'),
                    $.ListView( this ).clear()
                        .on('insert',  function () {

                            (new HTML_Template( arguments[0] )).parse();
                        })
                        .on('update',  function () {

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
        render:       function (iData) {
            var iMask = 0,  _This_ = this;

            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
                    iMask = iMask  |  this.map[ iName ];

            $.each(iMask.toString(2).split('').reverse(),  function (i) {
                if (this == 0)  return;

                if (_This_[i] instanceof $.ListView)
                    return _This_[i].render(
                        iData[ _This_[i].$_View[0].getAttribute('name') ]
                    );

                var iValue = HTML_Template.eval(_This_[i].template, iData),
                    iNode = _This_[i].node,
                    iParent = _This_[i].parent;

                switch ( iNode.nodeType ) {
                    case 3:    {
                        if (! (iNode.previousSibling || iNode.nextSibling))
                            return  iParent.innerHTML = iValue;

                        break;
                    }
                    case 2:    if (iNode.nodeName in iParent) {
                        try {
                            iValue = eval( iValue );
                        } catch (iError) { }

                        iParent[ iNode.nodeName ] = iValue;

                        return;

                    } else if (! iNode.ownerElement) {
                        if ( iValue )
                            iParent.setAttribute(iNode.nodeName, iValue);

                        return;
                    }
                }

                iNode.nodeValue = iValue;
            });

            return this;
        }
    });

    return HTML_Template;

});
