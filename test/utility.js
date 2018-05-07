import { mapTree } from '../source/utility';


describe('Utility',  () => {

    /** @test {mapTree} */
    it('mapTree()',  () => {

        mapTree({
            id:        0,
            children:  [
                {
                    id:        1,
                    children:  [
                        {
                            id:        3,
                            children:  []
                        }
                    ]
                },
                {
                    id:        2,
                    children:  []
                }
            ]
        },  'children',  function (child, index, depth) {

            if (depth < 2)  return child.id;

        }).should.be.eql([1, 2]);
    });
});
