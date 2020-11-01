import * as tape from "tape";
import {run} from "../../index";

tape('options', (test) => {
    test.test('global', (test) => {
        test.test('false', (test) => {
            let transformedFiles: Array<string> = [];

            run({
                compilerOptions: {
                    allowJs: true
                },
                browserifyOptions: {
                    entries: ['test/plugin/options/main.ts'],
                },
                onTransform: (transform, file) => {
                    transformedFiles.push(file);
                }
            }).then(({data}) => {
                test.same(data.default, 'foo');
                test.same(transformedFiles.length, 3);
            }).catch((error) => {
                test.fail(error);
            }).finally(() => {
                test.end();
            });
        });

        test.test('true', (test) => {
            let transformedFiles: Array<string> = [];

            run({
                tsifyOptions: {
                    global: true
                },
                compilerOptions: {
                    allowJs: true
                },
                browserifyOptions: {
                    entries: ['test/plugin/options/main.ts']
                },
                onTransform: (transform, file) => {
                    transformedFiles.push(file);
                }
            }).then(({data}) => {
                test.same(data.default, 'foo');
                test.same(transformedFiles.length, 4);

                test.end();
            });
        });
    });
});