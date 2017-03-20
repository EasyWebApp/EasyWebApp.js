/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery'],  function ($) {

    var iWebApp = $().iWebApp(),  iLevel = ['province', 'city', 'district'];

    function codeOf(_Level_) {

        var iCount = iLevel.indexOf(_Level_) + 1;

        return  this.adcode.toString().slice(0,  2 * iCount)  +
            '00'.repeat(3 - iCount);
    }

    iWebApp.component(function () {

        this.$_View.find('select').each(function () {

            $( this ).view('ListView');
        });

        var iEvent = {
                type:      'data',
                target:    this.$_View.find('[data-href]')[0]
            },
            $_adCode = this.$_View.find('[type="hidden"]');

        var VM = this.on('update',  function () {

                iWebApp.load( iEvent.target );
            });

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            iData = iData.districts[0].districts;

            if (! iData[0])  return;

            var iList = $(
                    'select[name="' + iData[0].level + '"]',  iEvent.target
                ).view('ListView');

            if (! iList)  return;

            iList.clear().render( iData );

            var $_Select = iList.$_View;

            if (! $_Select.children(
                '[data-adcode="'  +  VM.codeOf( iData[0].level )  +  '"]'
            ).prop('selected', true)[0])
                $_Select[0].selectedIndex = 0;

            if ( $_Select[0].value )
                setTimeout($.proxy($.fn.change, $_Select));
        });

        return {
            codeOf:    codeOf,
            getSub:    function (iEvent) {

                var $_Select = $( iEvent.target ),
                    iLink = $_adCode.parents(':view')[0];

                $_adCode[0].value = $_Select[0].selectedOptions[0].dataset.adcode;

                if ($_Select.nextAll('select').each(function () {

                    $( this ).view('ListView').clear();
                })[0])
                    iLink.dataset.href = '?data=' + $.extendURL(
                        iLink.dataset.href.replace(/^\?data=/, ''), {
                            keywords:    $_adCode[0].value
                        }
                    );
                else
                    this.trigger('loadAll');
            }
        };
    });
});