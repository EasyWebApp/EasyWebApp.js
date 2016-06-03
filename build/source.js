({
    name:            'EasyWebApp',
    baseUrl:         '../source',
    paths:           {
        jquery:       'http://cdn.bootcss.com/jquery/1.12.3/jquery.js',
        'iQuery+':    'http://git.oschina.net/Tech_Query/iQuery/raw/master/iQuery+.js'
    },
    out:             '../EasyWebApp.js',
    onBuildWrite:    function (iName) {
        var fParameter = 'BOM, DOM, $',
            aParameter = 'self, self.document, self.jQuery';

        if (iName == 'EasyWebApp') {
            fParameter += ', WebApp';
            aParameter += ', WebApp';
        }

        return arguments[2].replace(
                /^define[\s\S]+?(function \()[^\)]*/m,
                "\nWebApp = ($1" + fParameter
            )
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'xWrap_0.txt',
        end:          '});'
    },
    optimize:        'none'
});