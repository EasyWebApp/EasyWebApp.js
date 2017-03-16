define(['jquery', 'ListView', 'HTMLView'],  function ($, ListView, HTMLView) {

    return  function ($_Root, iTemplate) {

        $_Root = $( $_Root );

        var Sub_Component = [ ],
            iScope = HTMLView.instanceOf( $_Root.parents(':view')[0] );

        iScope = iScope  ?  iScope.scope()  :  { };

        var iSearcher = document.createTreeWalker($_Root[0], 1, {
                acceptNode:    function (iDOM) {

                    if ( iDOM.dataset.href ) {
                        Sub_Component.push( iDOM );

                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }),
            _This_,  iList = [ ],  iView = [ ];

        while (_This_ = iSearcher.nextNode())
            if (
                _This_.getAttribute('name')  &&
                (_This_.tagName.toLowerCase() != 'slot')
            ) {
                if ($.expr[':'].list(_This_))
                    iList.unshift(_This_);
                else if (
                    (! $.expr[':'].field(_This_))  &&
                    (_This_.parentElement != document.head)
                )
                    iView.unshift(_This_);
            }

        for (var i = 0;  iList[i];  i++)
            _This_ = new ListView( iList[i] );

        if (iList[i] != $_Root[0]) {

            for (var i = 0;  iView[i];  i++)
                if ($( iView[i] ).parents( $_Root )[0])
                    _This_ = (new HTMLView( iView[i] )).parse( Sub_Component );
        }

        return {
            root:     (
                (_This_  &&  (_This_.$_View[0] == $_Root[0]))  ?
                    _This_  :  new HTMLView($_Root, iTemplate)
            ),
            sub:      Sub_Component,
            scope:    iScope
        };
    };
});