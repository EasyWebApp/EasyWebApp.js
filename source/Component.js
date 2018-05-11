export const _private_ = new WeakMap();


/**
 * Utility methods of Web Component
 */
export default  class Component {
    /**
     * @type {string} - `tagName` of a Custom Element
     */
    static get tagName() {

        return this.name.replace(
            /[A-Z]/g,  char => '-' + char.toLowerCase()
        ).slice( 1 );
    }

    /**
     * @protected
     *
     * @param {DocumentFragment} template - `HTMLTemplateElement.prototype.content`
     *
     * @return {HTMLElement} This custom element
     */
    boot(template) {

        this.attachShadow({
            mode:              'open',
            delegatesFocus:    true
        }).appendChild(
            template.cloneNode( true )
        );

        return this;
    }

    /**
     * Define a set of Getter or Setter for DOM properties,
     * and store their values into private object.
     *
     * @param {Object} map - `1` for Getter, `2` for Setter & sum for both
     *                       in each key's value
     * @return {string[]} Keys of `map`
     *
     * @example
     *
     *    WebCell.component(class MyInput extends HTMLElement {
     *
     *        constructor() {  super();  }
     *
     *        static get observedAttributes() {
     *
     *            return this.setAccessor({
     *                value:  1,
     *                step:   3
     *            });
     *        }
     *    });
     */
    static setAccessor(map) {

        for (let key in map) {

            let config = {enumerable: true};

            if (map[ key ]  &  1)
                config.get = function () {

                    return  _private_.get( this )[ key ];
                };

            if (map[ key ]  &  2)
                config.set = function (value) {

                    _private_.get( this )[ key ] = value;
                };

            Object.defineProperty(this.prototype, key, config);
        }

        return  Object.keys( map );
    }

    attributeChangedCallback(name, oldValue, newValue) {

        switch ( newValue ) {
            case '':      this[ name ] = true;      break;
            case null:    this[ name ] = false;     break;
            default:      try {
                this[ name ] = JSON.parse( newValue );

            } catch (error) {

                this[ name ] = newValue;
            }
        }
    }

    /**
     * @param {Element} element
     *
     * @return {number} The index of `element` in its siblings
     */
    static indexOf(element) {

        var index = 0;

        while (element = element.previousElementSibling)  index++;

        return index;
    }

    /**
     * @param {Event} event
     *
     * @return {Element} The target of `event` object (**Shadow DOM** is in account)
     */
    static targetOf(event) {

        const target = event.composedPath ? event.composedPath() : event.path;

        return  (target || '')[0]  ||  event.target;
    }

    /**
     * @protected
     *
     * @return   {Object}
     * @property {HTMLTemplateElement}                      template
     * @property {Array<HTMLStyleElement, HTMLLinkElement>} style
     * @property {HTMLScriptElement}                        script
     */
    static findTemplate() {

        var script = document.currentScript, template, style = [ ];

        var element = script, stop;

        while ((! stop)  &&  (element = element.previousElementSibling))
            switch ( element.tagName.toLowerCase() ) {
                case 'template':
                    template = element;  break;
                case 'style':
                    style.unshift( element );  break;
                case 'link':
                    if (element.rel === 'stylesheet') {

                        element.setAttribute('href', element.href);

                        style.unshift( element );
                    }
                    break;
                case 'script':
                    stop = true;
            }

        return  {template, style, script};
    }

    /**
     * @param {string} selector
     *
     * @return {Element[]} Element set which matches `selector` in this Shadow DOM
     */
    $(selector) {

        return  [... this.shadowRoot.querySelectorAll( selector )];
    }
}
