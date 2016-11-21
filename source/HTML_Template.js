define(['jquery'],  function () {

    function HTML_Template() {
        this.source = arguments[0].split('?')[0];
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
        expression:    /\$\{([\s\S]+?)\}/g,
        reference:     /this\.(\w+)/,
        eval:          function (iTemplate, iContext) {
            return  ES_ST  ?  ES_ST.call(iContext, iTemplate)  :
                iTemplate.replace(this.expression,  function () {

                    return  Eval_This.call(iContext, arguments[1]);
                });
        }
    });

    $.extend(HTML_Template.prototype, {
        parse:     function () {
            return  $.extend.apply($, [this.map].concat(
                $.map(this.$_View.find('*'),  function (iDOM) {
                    return  iDOM.outerHTML.match( HTML_Template.expression )  &&
                        $.map(iDOM.attributes,  function (iNode) {
                            var iKey = { };

                            iNode.nodeValue.replace(
                                HTML_Template.expression,
                                function (iName) {
                                    iName = iName.match(
                                        HTML_Template.reference
                                    );

                                    if ( iName )
                                        iKey[(iName || '')[1]] = {
                                            node:        iNode,
                                            template:    iNode.nodeValue
                                        };
                                }
                            );

                            return iKey;
                        });
                })
            ));
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
            var iThis, iValue;

            for (var iName in iData) {
                if (! this.map.hasOwnProperty( iName ))  continue;

                iThis = this.map[ iName ];

                iValue = HTML_Template.eval(iThis.template, iData);

                if (iThis.node.nodeName in iThis.node.ownerElement.constructor.prototype) {
                    try {
                        iValue = eval( iValue );
                    } catch (iError) { }

                    iThis.node.ownerElement[ iThis.node.nodeName ] = iValue;
                } else
                    iThis.node.nodeValue = iValue;
            }

            return this;
        }
    });

    return HTML_Template;

});
