import * as Browserify from "browserify";
import Tsify from "../src";

import type {BrowserifyObject, Options as BrowserifyOptions} from "browserify";
import type {Error as CompileError} from "../src/lib/Error";
import type {Options} from "../src";
import type {CompilerOptions} from "typescript";

type BeforeBundleCallback = (browserify: BrowserifyObject) => void;
type OnTransformCallback = (transform: NodeJS.ReadWriteStream, file: string) => void;

type RunConfig = {
    tsifyOptions?: Options,
    compilerOptions?: CompilerOptions,
    browserifyOptions?: BrowserifyOptions,
    beforeBundle?: BeforeBundleCallback,
    onTransform?: OnTransformCallback
};

type RunResult = {
    bundle: string,
    data: any,
    files: Array<string>,
    bundleErrors: Array<Error>
    compileErrors: Array<CompileError>
};

export const run = (config: RunConfig = {}) => {
    return new Promise<RunResult>((resolve) => {
        const tsify = Tsify(config.compilerOptions);
        const tsifyOptions = config.tsifyOptions || {};
        const browserifyOptions = config.browserifyOptions || {};

        browserifyOptions.standalone = '__';
        browserifyOptions.extensions = [
            '.ts', '.tsx'
        ];

        let beforeBundle = config.beforeBundle;

        if (!beforeBundle) {
            beforeBundle = () => undefined;
        }

        const files: Array<string> = [];
        const bundleErrors: Array<Error> = [];
        const compileErrors: Array<CompileError> = [];

        const browserify = Browserify(browserifyOptions)
            .on('file', (file) => {
                files.push(file);
            })
            .on('transform', (transform, file) => {
                if (config.onTransform) {
                    config.onTransform(transform, file);
                }
            })
            .plugin<Options>(tsify, tsifyOptions);

        beforeBundle(browserify);

        browserify
            .bundle((error, data) => {
                if (error) {
                    compileErrors.push(error);
                } else {
                    const evaluator = new Function(`${data.toString()}return __;`);

                    resolve({
                        bundle: data.toString(),
                        data: evaluator(),
                        files,
                        bundleErrors,
                        compileErrors
                    });
                }
            });

        return browserify;
    });
};