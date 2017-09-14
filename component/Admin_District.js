/* ---------- 行政区 联动查询 ---------- */

// 【文档】http://lbs.amap.com/api/webservice/guide/api/district/


require(['jquery', 'EasyWebApp'],  function ($, EWA) {

    var API_Root = 'https://restapi.amap.com/v3/',
        Request_Event = {
            type: 'request',  method: 'GET',  src: 'config/district'
        },
        AD_Level = {province: 2,  city: 4,  district: 6};


    EWA.component(function (data) {

        var iWebApp = new EWA();

    //  API URL 补全

        iWebApp.off( Request_Event ).on(Request_Event,  function (_, AJAX) {

            AJAX.option.url = $.extendURL(
                AJAX.option.url.replace(iWebApp.pageRoot, API_Root),
                {
                    key:            data.key,
                    extensions:     'base',
                    subdistrict:    1
                }
            );
        });

        $.extend(data, {
            fixData:      function (_, data) {

                data = data.districts[0].districts;

                return  [{adcode: '',  name: '（请选择）'}].concat( data );
            },
            checkCode:    function (event) {    //  自动定位传入的行政区编码

                if (! this.adcode)  return;

                var select = event.target;

                var ADcode = this.adcode.slice(0,  AD_Level[ select.name ])
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

                var $_Sub = $( arguments[0].target ).next('select');

                if (! $_Sub[0])  return;

                iWebApp.load( $_Sub.show()[0] );

                $_Sub.view().clear().$_View.next('select').hide();
            }
        });

    //  传入参数变更响应

        this.on('update',  function () {

            if ('adcode' in arguments[1])
                this.checkCode( {target: this.$_View.find('select')[0]} );
        });
    });
});