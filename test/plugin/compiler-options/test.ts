import * as tape from "tape";
import {run} from "../../index";

tape('compiler options', (test) => {
    test.test('allowJs', (test) => {
        test.test('false', (test) => {
            let transformedFiles: Array<string> = [];

            run({
                browserifyOptions: {
                    entries: ['test/plugin/compiler-options/main.js'],
                },
                onTransform: (transform, file) => {
                    transformedFiles.push(file);
                }
            }).then(({data}) => {
                test.same(data.default, 'foo');
                test.same(transformedFiles.length, 2);
            }).catch((error) => {
                test.fail(error);
            }).finally(() => {
                test.end();
            });
        });

        test.test('true', (test) => {
            let transformedFiles: Array<string> = [];

            run({
                compilerOptions: {
                    allowJs: true
                },
                browserifyOptions: {
                    entries: ['test/plugin/compiler-options/main.js']
                },
                onTransform: (transform, file) => {
                    transformedFiles.push(file);
                }
            }).then(({data}) => {
                test.same(data.default, 'foo');
                test.same(transformedFiles.length, 2);

                test.end();
            });
        });
    });

    test.test('inlineSourceMap', (test) => {
        test.test('false', (test) => {
            run({
                compilerOptions: {
                    sourceMap: true,
                    inlineSourceMap: false
                },
                browserifyOptions: {
                    entries: ['test/plugin/compiler-options/main.ts'],
                }
            }).then(({bundle, data}) => {
                test.same(data.main, '55');
            }).catch((error) => {
                test.fail(error);
            }).finally(() => {
                test.end();
            });
        });

        test.test('true', (test) => {
            run({
                compilerOptions: {
                    inlineSourceMap: true
                },
                browserifyOptions: {
                    entries: ['test/plugin/compiler-options/main.ts']
                }
            }).then(({bundle, data}) => {
                test.same(data.main, '55');

                test.end();
            });
        });
    });
});