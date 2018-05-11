import View from './View';

import { mapTree } from './utility';

import Template from './Template';

import ArrayView from './ArrayView';

const template_element = new WeakMap();


/**
 * View for Object model
 */
export default  class ObjectView extends View {
    /**
     * @param {string|Element|DocumentFragment} template
     */
    constructor(template) {

        if (! super(template,  'object',  { }).booted)  this.scan();
    }

    valueOf() {

        const data = Object.assign({ },  this.data);

        for (let template of this)
            if (template instanceof View)
                data[ template.name ] = template.valueOf();

        return data;
    }

    /**
     * @private
     *
     * @param {Node|Attr} node
     * @param {function}  renderer
     *
     * @return {Template}
     */
    static templateOf(node, renderer) {

        return  new Template(node.value || node.nodeValue,  ['view'],  renderer);
    }

    /**
     * @private
     *
     * @param {Element|View} element
     * @param {Template}     [template]
     */
    register(element, template) {

        if (element instanceof View)
            this[ this.length ] = element;
        else if ( template[0] )
            template_element.set(this[ this.length ] = template,  element);
    }

    /**
     * @private
     *
     * @param {Element} element
     */
    parseTag(element) {

        for (let attr of element.attributes) {

            let name = attr.name;

            let template = ObjectView.templateOf(
                attr,
                (name in element)  ?
                    (value  =>  element[ name ] = value)  :
                    (value  =>  element.setAttribute(name, value))
            );

            if (template == '')  element.removeAttribute( name );

            this.register(element, template);
        }
    }

    /**
     * @private
     */
    scan() {

        var root = this.content;

        root = root.parentNode ? root : {
            childNodes:    (root instanceof Array)  ?  root  :  [ root ]
        };

        mapTree(root,  'childNodes',  (node) => {

            switch ( node.nodeType ) {
                case 1:
                    if ( node.dataset.object )
                        this.register(new ObjectView( node ));
                    else if ( node.dataset.array )
                        this.register(new ArrayView( node ));
                    else
                        this.parseTag( node );
                    break;
                case 3:
                    this.register(
                        node,
                        ObjectView.templateOf(
                            node,  value => node.nodeValue = value
                        )
                    );
            }

            return node;
        });
    }

    /**
     * @param {Object} data
     *
     * @return {ObjectView}
     */
    render(data) {

        const _data_ = Object.assign(this.data, data);

        for (let template of this) {

            let name = template.name;

            if (template instanceof Template)
                template.evaluate(template_element.get( template ),  _data_);
            else if (
                (template instanceof View)  &&  data[ name ]
            )
                _data_[name] = template.render( data[ name ] ).data;
        }

        return this;
    }

    clear() {

        for (let template of this)  template.clear();

        return this;
    }
}
