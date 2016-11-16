define(['jquery', 'EasyWebApp'],  function ($) {

    $(document).on('change',  ':input',  function () {

        var iWebApp = $(document).iWebApp(),  iName = this.getAttribute('name');

        var iModule = iWebApp.getModule( this );

        var iValue = iModule.data[ iName ];

        iWebApp.trigger('change',  iName,  [iModule.source, iValue]);
    });

    var RE_ST = /\$\{[\s\S]+?\}/g;

    function Eval_ST() {
        return  eval('`' + arguments[0] + '`');
    }

    function DOM_Refresh(iNode, iLink) {
        iNode.nodeValue = Eval_ST.call(
            this.getModule( iLink.getTarget() ).data,
            $( iNode.parentNode ).data('_EWA_DW_').template
        );
    }

    $.fn.iWebApp.fn.stringTemplate = function () {
        var iApp = this;

        return  this.on('ready',  '.html',  function (iLink) {

            var $_Target = iLink.getTarget();

            if (! $_Target[0])  return;

            var iSum = ($_Target.html().match(RE_ST) || '').length  ||  0;

            $_Target.find('*').each(function () {

                if (! this.outerHTML.match(RE_ST))  return;

                $(this).data('_EWA_DW_',  $.map(this.attributes,  function (iNode) {
                    var iWatch = $.map(
                            iNode.nodeValue.match( RE_ST ),
                            function (iName) {
                                iName = (iName.match(/this\.(\w+)/) || '')[1];

                                if (iName) {
                                    iApp.on(
                                        'change',
                                        iName,
                                        $.proxy(DOM_Refresh, iApp, iNode)
                                    );
                                    return iName;
                                }
                            }
                        );
                    return  iWatch[0] && {
                        attribute:    iNode.nodeName,
                        template:     iNode.nodeValue,
                        watch:        iWatch
                    };
                }));
            });
        });
    };
});