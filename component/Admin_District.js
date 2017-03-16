/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery'],  function ($) {

    var iWebApp = $().iWebApp();

    iWebApp.component(function () {

        this.$_View.find('select').each(function () {

            $( this ).view('ListView');
        });

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('[data-href]')[0]
            },
            VM = this;

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            iData = iData.districts[0].districts;

            if (! iData[0])  return;

            var iList = $(
                    'select[name="' + iData[0].level + '"]',  iEvent.target
                ).view('ListView');

            if (! iList)  return;

            iList.clear().render( iData );

            var $_Select = iList.$_View;

            var iValue = VM[ $_Select[0].name ];

            if ( iValue ) {
                $_Select[0].value = iValue;

                if (! $_Select[0].value)  $_Select[0].selectedIndex = 0;
            }

            if ( $_Select[0].value )
                setTimeout($.proxy($.fn.change, $_Select));
        });

        return {
            getSub:    function (iEvent) {

                var $_Select = $( iEvent.target );

                var iLink = $_Select.parents(':view')[0];

                iLink.dataset.href = '?data=' + $.extendURL(
                    iLink.dataset.href.replace(/^\?data=/, ''),  {
                        keywords:    $_Select[0].value
                    }
                );

                if ($_Select.nextAll('select').each(function () {

                    $( this ).view('ListView').clear();
                })[0])
                    iWebApp.load( iLink );
            }
        };
    });
});