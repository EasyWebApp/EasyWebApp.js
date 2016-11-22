define(['jquery'],  function ($) {

    function HTML_Template(iURL) {
        this.source = iURL.match(/\.(html?|md)\??/) ? iURL.split('?')[0] : iURL;
        this.$_View = $();
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
        parse:     function () {
            var iMap = this.map,  $_DOM = this.$_View.find('*');

            for (var i = 0;  $_DOM[i];  i++)
                if ($_DOM[i].outerHTML.match( HTML_Template.expression ))
                    $.each(HTML_Template.getTextNode( $_DOM[i] ),  function () {
                        var iNode = this;

                        this.nodeValue = this.nodeValue.replace(
                            HTML_Template.expression,
                            function (iName) {
                                iName = iName.match( HTML_Template.reference );
                                iName = (iName || '')[1];

                                if ( iName ) {
                                    iMap[iName] = iMap[iName] || [ ];

                                    iMap[iName].push({
                                        node:        iNode,
                                        template:    iNode.nodeValue
                                    });
                                }

                                return '';
                            }
                        );
                    });

            return this;
        },
        loadTo:    function ($_View) {
            var _This_ = this;

            return  new Promise(function () {

                _This_.$_View = $($_View).load(_This_.source,  arguments[0]);

            }).then(function () {

                _This_.parse();
            });
        },
        render:    function (iData) {
            for (var iName in iData)
                if (this.map.hasOwnProperty( iName ))
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

            return this;
        }
    });

    return HTML_Template;

});
