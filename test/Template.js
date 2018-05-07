import Template from '../source/Template';


/**
 * @test {Template}
 */
describe('Template',  () => {

    /**
     * @test {Template#constructor}
     */
    it('Parsing',  () => {

        const template = new Template(
            '[ ${(new Date()).getFullYear()} ]  Hello, ${this.name} !'
        );

        template[0].should.be.equal('name');

        template.toString().should.be.equal(
            `[ ${(new Date()).getFullYear()} ]  Hello,  !`
        );
    });

    /**
     * @test {Template#evaluate}
     */
    it('Evaluation',  () => {

        const template = new Template(
            '[ ${this.time} ]  Hello, ${scope.creator}\'s ${view.name} !',
            ['view', 'scope']
        );

        template.length.should.be.equal( 3 );

        template.evaluate(
            {time: '2015-07-23'},  {name: 'EasyWebApp.js'},  {creator: 'TechQuery'}
        ).should.be.equal(
            '[ 2015-07-23 ]  Hello, TechQuery\'s EasyWebApp.js !'
        );
    });

    /**
     * @test {Template#onChange}
     */
    it('Changed callback',  () => {

        const empty = `[ ${(new Date()).getFullYear()} ]  Hello,  !`;

        const template = new Template(
            '[ ${(new Date()).getFullYear()} ]  Hello, ${this.name} !',
            (newValue, oldValue, ...bindData)  =>  {

                if (oldValue === null)
                    newValue.should.be.equal( empty );
                else {
                    oldValue.should.be.equal( empty );

                    newValue.should.be.equal(
                        `[ ${(new Date()).getFullYear()} ]  Hello, EWA !`
                    );
                }

                bindData.should.be.eql([1, 2, 3]);
            },
            [1, 2, 3]
        );

        template.evaluate({name: 'EWA'});
    });
});
