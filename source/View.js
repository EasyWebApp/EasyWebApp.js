const view_DOM = new WeakMap(), DOM_view = new WeakMap(), view_data = new WeakMap();


/**
 * Abstract View
 */
export default  class View extends Array {
    /**
     * @param {string|Element|DocumentFragment} template
     * @param {string}                          nameKey  - Key (littleCamelCase) of HTML `data-*`
     *                                                     to get name of bound data
     * @param {Object}                          scope    - Empty Model for this view
     */
    constructor(template, nameKey, scope) {

        if (super().constructor === View)
            throw TypeError('"View" is an abstract class');

        switch ( template.nodeType ) {
            case 1:
                this.name = template.dataset[ nameKey ];  break;
            case 11:
                if (! template.parentNode)
                    template = Array.from( template.childNodes );
                break;
            default:
                template = View.parseDOM( template );
        }

        var _this_ = this.bindWith( template );

        if (_this_ !== this) {

            _this_.booted = true;

            return _this_;
        }

        view_data.set(this, scope);
    }

    /**
     * @param {Node} node - Node from other `Document`
     *
     * @return {Node} Cloned & imported Node (with its child nodes)
     */
    static import(node) {  return  document.importNode(node, true);  }

    /**
     * @param {string} markup - Code of an markup fragment
     *
     * @return {Element[]}
     */
    static parseDOM(markup) {

        markup = (new window.DOMParser()).parseFromString(markup, 'text/html');

        return  Array.from(markup.head.childNodes, View.import).concat(
            Array.from(markup.body.childNodes, View.import)
        );
    }

    /**
     * @protected
     *
     * @param {Element|Element[]|DocumentFragment} template
     *
     * @return {View} This view or the view bound before
     */
    bindWith(template) {

        var _this_;

        if (template instanceof Array)
            template = template.filter(node => {

                switch ( node.nodeType ) {
                    case 1:
                        if (! (_this_ = DOM_view.get( node )))
                            DOM_view.set(node, this);
                        break;
                    case 3:
                        if (! node.nodeValue.trim())  return;
                }

                return true;
            });
        else if (! (_this_ = DOM_view.get( template )))
            DOM_view.set(template, this);

        view_DOM.set(this, template);

        return  _this_ || this;
    }

    /**
     * @param {Element|DocumentFragment} node
     *
     * @return {View} View instance bound with `node`
     */
    static instanceOf(node) {  return  DOM_view.get( node );  }

    /**
     * @return {Element|Element[]|DocumentFragment}
     */
    get content() {  return  view_DOM.get( this );  }

    /**
     * @return {string} Full markup code of this view
     */
    toString() {

        const content = this.content;

        return  (content.nodeType === 1)  ?
            content.outerHTML  :
            Array.from(content.childNodes || content,  node => {

                switch ( node.nodeType ) {
                    case 1:    return node.outerHTML;
                    case 3:    return node.nodeValue;
                }
            }).join('');
    }

    /**
     * @protected
     *
     * @type {Object}
     */
    get data() {  return  view_data.get( this );  }

    /**
     * Get original data of this view
     *
     * @return {Object}
     */
    valueOf() {

        throw TypeError('View.prototype.valueOf() must be overwriten');
    }

    /**
     * Render this view
     *
     * @return {View}
     */
    render() {

        throw TypeError('View.prototype.render() must be overwriten');
    }

    /**
     * Reset this view to empty data
     *
     * @return {View}
     */
    clear() {

        throw TypeError('View.prototype.clear() must be overwriten');
    }
}
