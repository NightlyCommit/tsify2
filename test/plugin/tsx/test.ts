import * as tape from "tape";
import {run} from "../../index";
import {JsxEmit} from "typescript";

tape('tsify', (test) => {
    test.test('handles .tsx sources', (test) => {
        run({
            browserifyOptions: {
                entries: ['test/plugin/tsx/main.ts']
            },
            compilerOptions: {
                jsx: JsxEmit.React
            }
        }).then((result) => {
            test.same(result.data, 'div with children: This is a cool component');

            test.end();
        });
    });
});