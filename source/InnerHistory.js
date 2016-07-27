define(['jquery', 'InnerPage'],  function ($, InnerPage) {

    var BOM = self,  DOM = self.document;

/* ---------- [object InnerHistory] ---------- */

    function InnerHistory() {
        var _This_ = $.extend(this, {
                length:       0,
                ownerApp:     arguments[0],
                root:         arguments[1],
                lastIndex:    -1
            });

        $(BOM).on('popstate',  function () {
            var iState = arguments[0].state;
            var _Index_ = (iState || { }).DOM_Index;
            var iHistory = _This_[_Index_];

            if (! iHistory)
                return  BOM.history.go(_This_[_Index_ - 1]  ?  -1  :  1);

            _This_.move(iState);
            iHistory.show().onReady();

            _This_.prevIndex = _This_.lastIndex;
            _This_.lastIndex = iState.DOM_Index;
        });
    }

    $.extend(InnerHistory.prototype, {
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        slice:        Array.prototype.slice,
        indexOf:      Array.prototype.indexOf,
        move:         function () {
            if ($.isPlainObject( arguments[0] ))
                var iState = arguments[0];
            else {
                var $_Target = arguments[0];
                $.ListView.findView(this.root, true);
            }
            var $_Page = ($_Target || this.root).children().detach();

            if ((! iState)  ||  ((iState.DOM_Index + 2) == this.length))
                this[this.length - 1].$_Page =
                    this[this.length - 1].$_Page  ||  $_Page;

            return $_Page;
        },
        write:        function () {
            this.prevIndex = this.lastIndex++ ;
            this.splice(this.lastIndex,  this.length);

            var iNew = new InnerPage(this.ownerApp,  arguments[0] || { });
            this.push(iNew);
            iNew.$_Page = (this.cache() || { }).$_Page;

            BOM.history.pushState(
                {DOM_Index:  this.lastIndex},
                iNew.title,
                iNew.URL
            );
            return iNew;
        },
        cache:        function () {
            var iNew = this[this.lastIndex];

            for (var i = 0;  i < this.lastIndex;  i++)
                if ((iNew.time - this[i].time)  >  (this.ownerApp.cache * 1000)) {
                    if (! this[i].sourceLink.action)  this[i].$_Page = null;
                } else if (
                    (! iNew.JSON)  &&
                    $.isEqual(iNew.sourceLink, this[i].sourceLink)
                )
                    return this[i];
        },
        last:         function () {
            var iPage = this[this.lastIndex] || { };
            return  arguments[0] ? iPage : iPage.valueOf();
        },
        prev:         function () {
            var iPage = this[this.prevIndex] || { };
            return  arguments[0] ? iPage : iPage.valueOf();
        },
        isForward:    function () {
            return (
                this.indexOf( arguments[0] )  >  this.indexOf( this.last(true) )
            );
        },
        mergeData:    function (iSource, Index) {
            var iPage = this.slice(Index,  (Index + 1) || undefined)[0];

            iPage.data = $.extend(
                iPage.data || { },
                (iSource instanceof $)  ?
                    $.paramJSON('?' + iSource.serialize())  :  iSource
            );
            return iSource;
        }
    });

    return InnerHistory;

});