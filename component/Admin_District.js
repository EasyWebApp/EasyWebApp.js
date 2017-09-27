/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    var iWebApp = new EWA(),
        API_Root = 'https://restapi.amap.com/v3/',
        AD_Level = {province: 2,  city: 4,  district: 6};


    EWA.component(function (data) {

        var ADcode = this.$_View.find('[name="adcode"]')[0];

        data = $.extend({
            province:   '',
            city:       ''
        }, data, {
            setParam:     function (_, AJAX) {    //  API URL 补全

                AJAX.option.url = $.extendURL(
                    AJAX.option.url.replace(iWebApp.pageRoot, API_Root),
                    {
                        key:            data.key,
                        extensions:     'base',
                        subdistrict:    1
                    }
                );
            },
            fixData:      function (_, data) {

                data = data.districts[0].districts;

                return  [{adcode: '',  name: '（请选择）'}].concat( data );
            },
            checkCode:    function (event) {    //  自动定位传入的行政区编码

                if (! this.adcode)  return;

                var select = event.target;

                var ADcode = (this.adcode + '').slice(0,  AD_Level[ select.name ])
                        .padEnd(6, 0);

                $.each($( select ).view(),  function () {

                    if (ADcode == this.valueOf().adcode)
                        return  !(this.$_View[0].selected = true);
                });

                if (! select.value)  return;

                this[ select.name ] = ADcode;

                this.loadSub( event );
            },
            loadSub:      function () {

                var _This_ = arguments[0].target;

                var sup = $(_This_).prev('select')[0];

                if ( _This_.value )
                    ADcode.value = $( _This_.selectedOptions ).view().adcode;
                else if ( sup )
                    ADcode.value = $( sup.selectedOptions ).view().adcode;
                else
                    ADcode.value = 100000;

                var sub = $(_This_).next('select')[0];

                if (! sub)  return this.emit('loaded');

                if ( _This_.value )  iWebApp.load( sub );

                this[ sub.name ] = '';
            }
        });

    //  传入参数变更响应

        this.on('update',  function () {

            if ('adcode' in arguments[1])
                this.checkCode( {target: this.$_View.find('select')[0]} );
        });

        return data;
    });
});