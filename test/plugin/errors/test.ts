import * as tape from "tape";
import {run} from "../../index";
import {resolve as resolvePath} from "path";

tape('tsify', (test) => {
    test.test('handles syntax errors', (test) => {
        run({
            browserifyOptions: {
                entries: ['test/plugin/errors/syntax.ts']
            }
        }).then(({compileErrors}) => {
            const error = compileErrors[0];

            test.same(error.line, 1);
            test.same(error.column, 14);
            test.same(error.message, 'test/plugin/errors/syntax.ts(1,14): error TS1005: \'from\' expected.');
            test.same(error.fileName, resolvePath('test/plugin/errors/syntax.ts'));

            test.end();
        })
    });

    test.test('handles semantic errors', (test) => {
        run({
            browserifyOptions: {
                entries: ['test/plugin/errors/semantic.ts']
            }
        }).then(({compileErrors}) => {
            const error = compileErrors[0];

            test.same(error.line, 1);
            test.same(error.column, 7);
            test.same(error.message, 'test/plugin/errors/semantic.ts(1,7): error TS2322: Type \'number\' is not assignable to type \'string\'.');
            test.same(error.fileName, resolvePath('test/plugin/errors/semantic.ts'));

            test.end();
        })
    });

    test.test('handles options errors', (test) => {
        run({
            compilerOptions: {
                sourceMap: true,
                inlineSourceMap: true
            },
            browserifyOptions: {
                entries: ['test/plugin/errors/options.ts']
            }
        }).then(({compileErrors}) => {
            const error = compileErrors[0];

            test.same(error.message, 'error TS5053: Option \'sourceMap\' cannot be specified with option \'inlineSourceMap\'.');

            test.end();
        })
    });
});