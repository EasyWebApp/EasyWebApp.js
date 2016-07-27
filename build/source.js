({
    name:            'EasyWebApp',
    baseUrl:         '../source',
    paths:           {
        jquery:       'http://cdn.bootcss.com/jquery/1.12.3/jquery.js',
        'jQuery+':    'http://git.oschina.net/Tech_Query/iQuery/raw/master/jQuery+.js',
        'iQuery+':    'http://git.oschina.net/Tech_Query/iQuery/raw/master/iQuery+.js'
    },
    out:             '../EasyWebApp.js',
    onBuildWrite:    function (iName) {
        var fParameter = 'BOM, DOM, $',
            aParameter = 'self, self.document, self.jQuery',
            iDependence = arguments[2].match(
                /^define[\s\S]+?function \(\$([^\)]*)/m
            )[1];

        if (! iName.match(/ViewDataIO|PageLink/))
            aParameter += iDependence;

        return arguments[2].replace(
            /^define[\s\S]+?(function) \(\$/m,
            "\nvar " + iName + " = ($1 (" + fParameter
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