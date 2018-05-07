/**
 * String template
 */
export default  class Template extends Array {
    /**
     * @param {string}          raw
     * @param {stirng[]}        [varName]  - Name list of the Local variable
     * @param {ChangedCallback} [onChange] - Call with New & Old value
     * @param {Array}           [bindData] - The parameter bound to `onChange`
     */
    constructor(raw, varName, onChange, bindData) {

        super();

        this.raw = raw,  this.value = null;

        if (varName instanceof Function)
            bindData = onChange, onChange = varName, varName = null;

        this.varName = varName || [ ],  this.expression = [ ];

        this.context = new Set( this.varName.concat('this') );

        this.onChange = (onChange instanceof Function)  ?  onChange  :  null;

        this.data = bindData || [ ];

        this.parse().clear();
    }

    static get Expression() {  return /\$\{([\s\S]+?)\}/g;  }

    static get Reference() {  return /(\w+)(?:\.(\w+)|\[(?:'([^']+)|"([^"]+)))/g;  }

    compile(expression) {

        return this.expression.push(
            new Function(... this.varName,  'return ' + expression.trim())
        );
    }

    parse() {

        const addReference = (match, context, key1, key2, key3)  =>  {

            if (this.context.has( context ))  this.push(key1 || key2 || key3);
        };

        this.raw = this.raw.replace(
            Template.Expression,  (_, expression) => {

                expression.replace(Template.Reference, addReference);

                return  '${' + (this.compile( expression ) - 1) + '}';
            }
        );

        return this;
    }

    /**
     * Evaluate expression
     *
     * @param {?object} context     - Value of `this` in the expression
     * @param {...*}    [parameter] - One or more value of the Local variable
     *
     * @return {string}
     */
    evaluate(context, ...parameter) {

        const value = this.raw.replace(
            /\$\{(\d+)\}/g,
            (_, index)  =>  this.expression[ index ].apply(context, parameter)
        );

        if (value !== this.value) {
            /**
             * Call back only on Value changed
             *
             * @typedef {function} ChangedCallback
             *
             * @param {*}    newValue
             * @param {*}    oldValue
             * @param {...*} bindData
             */
            if ( this.onChange )
                this.onChange(... [value, this.value].concat( this.data ));

            this.value = value;
        }

        return value;
    }

    clear() {

        const data = { };

        for (let key of this)  data[ key ] = '';

        return  this.evaluate(... Array.from(this.context,  () => data));
    }

    toString() {

        return  this.value + '';
    }
}
