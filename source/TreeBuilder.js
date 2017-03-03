define(['jquery', 'ListView', 'HTMLView'],  function ($, ListView, HTMLView) {

    function is_Component(iDOM) {

        return  (iDOM.tagName != 'A')  &&  (! iDOM.getAttribute('target'))  &&  (
            iDOM.getAttribute('href')  ||  iDOM.getAttribute('src')
        );
    }

    return  function ($_Root) {

        $_Root = $( $_Root );

        var Sub_Component = [ ];

        var iSearcher = document.createTreeWalker($_Root[0], 1, {
                acceptNode:    function (iDOM) {

                    if (is_Component( iDOM )) {
                        Sub_Component.push( iDOM );

                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }),
            iList = [ ],  _This_;

        while (_This_ = iSearcher.nextNode())
            if (_This_.getAttribute('name')  &&  $.expr[':'].list(_This_))
                iList.unshift(_This_);

        for (var i = 0;  iList[i];  i++)
            _This_ = new ListView( iList[i] );

        return  (iList[i] != $_Root[0]) ?
            (new HTMLView( $_Root )).parse( Sub_Component )  :  _This_;
    };

});