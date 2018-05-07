var depth = 0;

/**
 * Traverse Object-tree & return Node array through the filter
 *
 * @param {object}        node     - Object tree
 * @param {string}        fork_key - Key of children list
 * @param {MapTreeFilter} filter   - Map filter
 *
 * @return {Array}  Result list of Map filter
 */
export function mapTree(node, fork_key, filter) {

    var children = node[fork_key], list = [ ];    depth++ ;

    for (var i = 0, value;  i < children.length;  i++) {
        /**
         * @typedef {function} MapTreeFilter
         *
         * @param {object} child
         * @param {number} index
         * @param {number} depth
         *
         * @return {?object}  `Null` or `Undefined` to **Skip the Sub-Tree**,
         *                    and Any other Type to Add into the Result Array.
         */
        try {
            value = filter.call(node, children[i], i, depth);

        } catch (error) {

            depth = 0;    throw error;
        }

        if (! (value != null))  continue;

        list.push( value );

        if ((children[i] != null)  &&  (children[i][fork_key] || '')[0])
            list.push.apply(
                list,  mapTree(children[i], fork_key, filter)
            );
    }

    depth-- ;

    return list;
}
