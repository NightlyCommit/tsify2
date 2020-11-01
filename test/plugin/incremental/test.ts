import * as tape from "tape";
import {run} from "../../index";
import {writeFileSync} from "fs";

import type {CompilerOptions} from "typescript";

tape('tsify', (test) => {
    test.test('supports incremental builds', (test) => {
        const compilerOptions: CompilerOptions = {
            incremental: true,
            tsBuildInfoFile: 'foo.bar'
        };

        writeFileSync('test/plugin/incremental/number.ts', 'export default 1;');

        run({
            compilerOptions,
            browserifyOptions: {
                entries: ['test/plugin/incremental/main.ts']
            }
        }).then((result) => {
            test.same(result.data.default, 1);

            writeFileSync('test/plugin/incremental/number.ts', 'export default 2;');

            return run({
                compilerOptions,
                browserifyOptions: {
                    entries: ['test/plugin/incremental/main.ts']
                }
            })
        }).then((result) => {
            test.same(result.data.default, 2);

            test.end();
        });
    });
});