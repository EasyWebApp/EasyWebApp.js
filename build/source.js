({
    name:            'EasyWebApp',
    baseUrl:         '../source',
    paths:           {
        jquery:       'http://cdn.bootcss.com/jquery/1.12.4/jquery',
        'jQuery+':    'http://tech_query.oschina.io/iquery/jQuery+',
        'iQuery+':    'http://tech_query.oschina.io/iquery/iQuery+'
    },
    out:             '../EasyWebApp.js',
    onBuildWrite:    function (iName) {
        var fParameter = 'BOM, DOM, $',
            aParameter = 'self, self.document, self.jQuery',
            iDependence = arguments[2].match(
                /^define[\s\S]+?function \(\$([^\)]*)/m
            )[1];

        aParameter += iDependence;

        return arguments[2].replace(
            /^define[\s\S]+?(function) \(\$/m,
            "\nvar " + iName + " = ($1 (" + fParameter
        )
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\);\s*$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'xWrap.txt',
        end:          '});'
    },
    optimize:        'none'
});
