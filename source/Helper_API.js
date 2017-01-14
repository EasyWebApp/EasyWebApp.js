define(['jquery', 'UI_Module', 'WebApp'],  function ($, UI_Module, WebApp) {

    $.extend(UI_Module.prototype, {
        update:       function (iName, iValue) {
            var iTemplate = this.template;

            if (iName instanceof HTML_Template) {
                iTemplate = iName;
                iName = iValue;
                iValue = arguments[2];
            }
            try {
                iValue = eval( iValue );
            } catch (iError) { }

            iValue = (iValue != null)  ?  iValue  :  '';

            var iData = { };
            iData[iName] = iValue;

            UI_Module.reload(
                iTemplate.valueOf(
                    iTemplate.scope.setValue(iName, iValue)
                ).render( iData )
            );

            return this;
        },
        on:           function (iType, $_Sub, iCallback) {

            $_Sub = this.ownerApp.getModule( this.$_View.find($_Sub) );

            var iHTML = ($_Sub.source.href || '').split('?')[0]  ||  '',
                iJSON = ($_Sub.source.src || '').split('?')[0]  ||  '';

            this.ownerApp.off(iType, iHTML, iJSON, iCallback)
                .on(iType, iHTML, iJSON, iCallback);

            return this;
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

            if (typeof $_View == 'function') {
                iFactory = $_View;
                $_View = null;
            }
            $_View = (typeof $_View == 'string')  ?
                $('[href*="' + $_View + '.htm"]',  document.body)  :
                $( $_View );

            var iModule = this.getModule($_View[0] && $_View);

            if (typeof iFactory == 'function')
                iModule.domReady.then(function (iData) {

                    iModule.render(iFactory.call(iModule, iData)  ||  iData);
                });

            return iModule;
        }
    });
});