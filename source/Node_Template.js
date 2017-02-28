define(['jquery'],  function ($) {

    function Node_Template(iNode) {
        this.ownerNode = iNode;

        this.name = iNode.nodeName;
        this.raw = iNode.nodeValue;

        this.ownerElement = iNode.parentNode || iNode.ownerElement;
    }

    $.extend(Node_Template, {
        eval:          function () {
            'use strict';

            var vm = this;

            try {
                var iValue = eval( arguments[0] );

                return  (iValue != null)  ?  iValue  :  '';
            } catch (iError) {
                return '';
            }
        },
        safeEval:      function (iValue) {
            if ((typeof iValue == 'string')  &&  (iValue[0] == '0')  &&  iValue[1])
                return iValue;

            return  (iValue && this.eval(iValue))  ||  iValue;
        },
        expression:    /\$\{([\s\S]+?)\}/g,
        reference:     /(this|vm)\.(\w+)/g
    });

    var ES_ST = Node_Template.eval('`1`');

    $.extend(Node_Template.prototype, {
        eval:        function (iContext) {
            return  ES_ST ?
                Node_Template.eval.call(iContext,  '`' + this.raw + '`')  :
                this.raw.replace(Node_Template.expression,  function () {

                    return  Node_Template.eval.call(iContext, arguments[1]);
                });
        },
        getRefer:    function () {
            var iRefer = { };

            this.ownerNode.nodeValue = this.raw.replace(
                Node_Template.expression,  function () {

                    arguments[1].replace(Node_Template.reference,  function () {

                        iRefer[ arguments[2] ] = 1;
                    });

                    return '';
                }
            );

            return  Object.keys( iRefer );
        },
        render:      function () {
            var iValue = this.eval( arguments[0] ),
                iNode = this.ownerNode,
                iParent = this.ownerElement;

            switch ( iNode.nodeType ) {
                case 3:    {
                    if (! (iNode.previousSibling || iNode.nextSibling))
                        return  iParent.innerHTML = iValue;

                    break;
                }
                case 2:    if (
                    (this.name != 'style')  &&  (this.name in iParent)
                ) {
                    iParent[ this.name ] = Node_Template.safeEval( iValue );

                    return;

                } else if (! iNode.ownerElement) {
                    if ( iValue )
                        iParent.setAttribute(this.name, iValue);

                    return;
                }
            }

            iNode.nodeValue = iValue;

            return this;
        }
    });

    return Node_Template;

});