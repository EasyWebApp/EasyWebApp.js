define([
    'jquery', 'UI_Module', 'HTML_Template', 'Node_Template', 'InnerLink', 'WebApp'
],  function ($, UI_Module, HTML_Template, Node_Template, InnerLink, WebApp) {

    $.extend(UI_Module.prototype, {
        update:       function (iName, iValue) {
            var iTemplate = this.template;

            if (iName instanceof HTML_Template) {
                iTemplate = iName;
                iName = iValue;
                iValue = arguments[2];
            }

            var iData = { };
            iData[iName] = Node_Template.safeEval( iValue );

            UI_Module.reload(
                iTemplate.valueOf(
                    iTemplate.scope.setValue(iName, iData[iName])
                ).render( iData )
            );

            return this;
        },
        bind:         function (iType, $_Sub, iCallback) {

            $_Sub = new UI_Module(new InnerLink(
                this.ownerApp,  this.$_View.find( $_Sub )[0]
            ));

            var iHTML = ($_Sub.source.href || '').split('?')[0]  ||  '',
                iJSON = ($_Sub.source.src || '').split('?')[0]  ||  '';

            return  $_Sub.off(iType, iHTML, iJSON, iCallback)
                .on(iType, iHTML, iJSON, iCallback);
        },
        getParent:    function () {
            return  UI_Module.instanceOf( this.$_View[0].parentNode );
        }
    });

    $.extend(WebApp.prototype, {
        getModule:    function () {
            return  UI_Module.instanceOf(arguments[0] || this.$_Root);
        },
        component:    function ($_View, iFactory) {
            switch (typeof $_View) {
                case 'string':
                    $_View = $('[href*="' + $_View + '.htm"]',  document.body);
                    break;
                case 'function':    {
                    iFactory = $_View;
                    $_View = null;
                }
                default:            $_View = $( $_View );
            }

            var iModule = $_View[0]  ?
                    (new UI_Module(new InnerLink(this, $_View[0])))  :
                    this.getModule();

            if (typeof iFactory == 'function')
                iModule.domReady.then(function (iData) {

                    iModule.render(iFactory.call(iModule, iData)  ||  iData);
                });

            return iModule;
        }
    });
});