var EWA_Polyfill = [
        {exports: 'MutationObserver'},
        {
            exports:    'history.pushState',
            name:       'html5-history-api'
        }
    ].map(function (API) {

        if (! eval('self.' + API.exports))  return  API.name || API.exports;

    }).filter(function () {  return arguments[0];  });


