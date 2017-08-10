/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery'],  function ($) {

    function reload(adcode) {

        if ( adcode )
            this.dataset.href = '?data=' + $.extendURL(
                this.dataset.href.replace(/^\?data=/, ''), {
                    keywords:    adcode
                }
            );
    }

    function valueOf() {

        var iOption = this[0].selectedOptions[0];

        if ( iOption )  return iOption.dataset.adcode;
    }


    var iWebApp = $().iWebApp(),  iLevel = ['province', 'city', 'district'];


    iWebApp.component(function () {

        this.$_View.find('select').each(function () {

            $( this ).view('ListView');
        });

        this.on('update', function () {

            for (var i = iLevel.length - 1, $_Match;  iLevel[i];  i--) {

                $_Match = this.codeMatch( iLevel[i] );

                if ( $_Match[0] )  return $_Match.parent().change();
            }

            reload.call(this.childOf()[0].$_View[0], '100000');
        });

        var $_adCode = this.$_View.find('[type="hidden"]');

        return {
            codeOf:       function (_Level_) {

                var iCount = iLevel.indexOf(_Level_) + 1;

                return  ((this.adcode || '') + '').slice(0,  2 * iCount)  +
                    '00'.repeat(3 - iCount);
            },
            codeMatch:    function (_Level_) {

                var $_Select = this.$_View.find('select[name="' + _Level_ + '"]');

                return $_Select.children(
                    '[data-adcode="'  +  this.codeOf(_Level_)  +  '"]'
                ).prop('selected', true);
            },
            onData:       function (iEvent, iData) {

                iData = iData.districts[0].districts;

                if (! iData[0])  return;

                var iList = $(
                        'select[name="' + iData[0].level + '"]',  iEvent.target
                    ).view('ListView');

                if (! iList)  return;

                iList.clear().render( [{name: '（请选择）'}].concat( iData ) );

                var $_Select = iList.$_View;

                this.codeMatch( iData[0].level );

                if (valueOf.call( $_Select ))
                    setTimeout($.proxy($.fn.change, $_Select));
            },
            getSub:       function (iEvent) {

                var $_Select = $( iEvent.target ),
                    iLink = $_adCode.parents(':view')[0];

                $_adCode[0].value = valueOf.call( $_Select );

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