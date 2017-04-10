({
    name:            'EasyWebApp',
    baseUrl:         '../source',
    paths:           {
        jquery:       '//cdn.bootcss.com/jquery/1.12.4/jquery',
        'jQuery+':    '//tech_query.oschina.io/iquery/jQuery+',
        'iQuery+':    '//tech_query.oschina.io/iquery/iQuery+'
    },
    out:             '../EasyWebApp.js',
    onBuildWrite:    function () {

        return  (arguments[0] != 'EasyWebApp')  ?
            arguments[2]  :  arguments[2].replace(
                /^define\([^\]]+\]/m,  '$&.concat( EWA_Polyfill )'
            );
    },
    wrap:            {startFile: 'Polyfill.js'},
    optimize:        'none'
});
