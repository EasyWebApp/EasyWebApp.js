define(['jquery'],  function ($) {

    function Node_Template(iNode) {

        this.ownerNode = iNode;

        this.name = iNode.nodeName;
        this.raw = iNode.nodeValue;

        this.ownerElement = iNode.parentNode || iNode.ownerElement;

        this.hasScope = false;
    }

    function Eval(vm) {
        'use strict';

        try {
            var iValue = eval( arguments[1] );

            return  (iValue != null)  ?  iValue  :  '';
        } catch (iError) {
            return '';
        }
    }

    $.extend(Node_Template, {
        safeEval:      function (iValue) {

            switch (typeof iValue) {
                case 'string':
                    if ((iValue[0] != '0')  ||  (! iValue[1]))  break;
                case 'function':
                    return  $.proxy(iValue, this);
            }

            return  (iValue  &&  Eval('', iValue))  ||  iValue;
        },
        expression:    /\$\{([\s\S]+?)\}/g,
        reference:     /(this|vm)\.(\w+)/g
    });

    $.extend(Node_Template.prototype, {
        eval:        function (iContext, iScope) {
            var iRefer;

            var iText = this.raw.replace(Node_Template.expression,  function () {

                    iRefer = Eval.call(iContext, iScope, arguments[1]);

                    return  (arguments[0] == arguments[3])  ?
                        arguments[3]  :  iRefer;
                });

            return  (this.raw == iText)  ?  iRefer  :  iText;
        },
        getRefer:    function () {

            var _This_ = this,  iRefer = { };

            this.ownerNode.nodeValue = this.raw.replace(
                Node_Template.expression,  function () {

                    arguments[1].replace(Node_Template.reference,  function () {

                        if (arguments[1] == 'vm')  _This_.hasScope = true;

                        iRefer[ arguments[2] ] = 1;
                    });

                    return '';
                }
            );

            return  Object.keys( iRefer );
        },
        render:      function (iContext, iScope) {

            var iValue = this.eval(iContext.valueOf(), iScope),
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
                    iParent[ this.name ] = Node_Template.safeEval.call(
                        iContext,  iValue
                    );
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
