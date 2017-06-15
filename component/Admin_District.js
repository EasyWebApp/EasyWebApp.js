/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery'],  function ($) {

    var iWebApp = $().iWebApp(),  iLevel = ['province', 'city', 'district'];

    function codeOf(_Level_) {

        var iCount = iLevel.indexOf(_Level_) + 1;

        return  ((this.adcode || '') + '').slice(0,  2 * iCount)  +
            '00'.repeat(3 - iCount);
    }

    function codeMatch(_Level_) {

        var $_Select = this.$_View.find('select[name="' + _Level_ + '"]');

        return $_Select.children(
            '[data-adcode="'  +  this.codeOf(_Level_)  +  '"]'
        ).prop('selected', true);
    }

    function reload() {

        this.dataset.href = '?data=' + $.extendURL(
            this.dataset.href.replace(/^\?data=/, ''), {
                keywords:    arguments[0]
            }
        );
    }

    function outerChange() {

        for (var i = iLevel.length - 1, $_Match;  iLevel[i];  i--) {

            $_Match = this.codeMatch( iLevel[i] );

            if ( $_Match[0] )  return $_Match.parent().change();
        }

        reload.call(this.childOf()[0].$_View[0], '100000');
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

        var VM = this.on('update', outerChange);

        iWebApp.off( iEvent ).on(iEvent,  function (iEvent, iData) {

            iData = iData.districts[0].districts;

            if (! iData[0])  return;

            var iList = $(
                    'select[name="' + iData[0].level + '"]',  iEvent.target
                ).view('ListView');

            if (! iList)  return;

            iList.clear().render( [{name: '（请选择）'}].concat( iData ) );

            var $_Select = iList.$_View;

            if (! VM.codeMatch( iData[0].level )[0])
                $_Select[0].selectedIndex = 0;

            if ( $_Select[0].value )
                setTimeout($.proxy($.fn.change, $_Select));
        });

        return {
            codeOf:       codeOf,
            codeMatch:    codeMatch,
            getSub:       function (iEvent) {

                var $_Select = $( iEvent.target ),
                    iLink = $_adCode.parents(':view')[0];

                $_adCode[0].value = $_Select[0].selectedOptions[0].dataset.adcode;

                if ($_Select.nextAll('select').each(function () {

                    $( this ).view('ListView').clear();
                })[0])
                    reload.call(iLink, $_adCode[0].value);
                else
                    this.emit('loaded');
            },
            onUpdate:     function () {

                iWebApp.load( arguments[0].target );
            }
        };
    });
});