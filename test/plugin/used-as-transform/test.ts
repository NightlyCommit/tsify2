import * as tape from "tape";
import Tsify from "../../../src";

tape('tsify', (test) => {
    test.test('used as transform', (test) => {
        const tsify = Tsify();

        try {
            tsify('foo', {});

            test.fail('should throw an error')
        }
        catch (error) {
            test.same(error.message, 'tsify2 appears to have been configured as a transform; it must be configured as a plugin.');
        }
        finally {
            test.end();
        }
    });
});