define(['jquery', 'iQuery+'],  function ($) {

    function HTML_Template($_View, iURL) {

        this.$_View = $( $_View ).data(this.constructor.getClass(), this);

        this.source = (iURL || '').match(/\.(html?|md)\??/)  ?
            iURL.split('?')[0] : iURL;
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
        pushMap:     function (iName, iNode) {
            if ( iName )
                if (iNode instanceof $.ListView)
                    this.map[iName] = iNode;
                else {
                    this.map[iName] = this.map[iName] || [ ];

                    this.map[iName].push({
                        node:        iNode,
                        template:    iNode.nodeValue
                    });
                }

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

                        this.nodeValue = this.nodeValue.replace(
                            HTML_Template.expression,
                            function (iName) {
                                iName = iName.match( HTML_Template.reference );

                                _This_.pushMap((iName || '')[1],  iNode);

                                return '';
                            }
                        );
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

                _This_.$_View.load(_This_.source,  arguments[0]);

            }).then(function () {

                _This_.parse();
            });
        },
        render:       function (iData) {
            for (var iName in iData) {
                if (! this.map.hasOwnProperty( iName ))  continue;

                if (this.map[iName] instanceof $.ListView)
                    this.map[iName].render( iData[iName] );
                else
                    $.each(this.map[iName],  function () {
                        var iValue = HTML_Template.eval(this.template, iData),
                            iNode = this.node;

                        if (
                            (iNode.nodeType == 2)  &&
                            (iNode.nodeName in iNode.ownerElement)
                        ) {
                            try {
                                iValue = eval( iValue );
                            } catch (iError) { }

                            iNode.ownerElement[ iNode.nodeName ] = iValue;
                        } else
                            iNode.nodeValue = iValue;
                    });
            }

            return this;
        }
    });

    return HTML_Template;

});
