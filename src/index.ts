import Transform from "./lib/Transform";
import {Transform as TransformStream} from "stream";
import {ModuleKind} from "typescript";
import {EventEmitter} from "events";

import type {BrowserifyObject} from "browserify";
import type {CompilerOptions} from "typescript";
import type {CustomOptions} from "browserify";

export type Options = CustomOptions & {
    global?: boolean
};

/**
 * @internal
 */
export interface TransformEventEmitter {
    on(event: 'file', listener: (fileName: string, id: string) => void): this;

    on(event: 'error', listener: (error: Error) => void): this;

    emit(event: 'file', fileName: string): boolean;

    emit(event: 'error', error: Error): boolean;
}

/**
 * Unfortunately, there is no documentation for TypeScript CompilerOptions type.
 * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * @see https://www.typescriptlang.org/docs/handbook/compiler-options.html
 */
const Tsify = (compilerOptions: CompilerOptions = {}): (browserify: BrowserifyObject | string, options: Options) => void => {
    compilerOptions.module = compilerOptions.module || ModuleKind.CommonJS;

    /**
     * Having both sourceMap and inlineSourceMap options set is an invalid options combination.
     * We only handle the case where sourceMap is set but not inlineSourceMap.
     */
    if (compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
        compilerOptions.inlineSourceMap = true;

        delete compilerOptions.sourceMap;
    }

    const eventEmitter: TransformEventEmitter = new EventEmitter();
    const transform = Transform(compilerOptions, eventEmitter);

    return (browserify, options): void => {
        if (typeof browserify === 'string') {
            throw new Error('tsify2 appears to have been configured as a transform; it must be configured as a plugin.');
        }

        eventEmitter.on('error', (error) => {
            browserify.pipeline.emit('error', error);
        });

        eventEmitter.on('file', (file, id) => {
            browserify.emit('file', file, id);
        });

        const gatherEntryPoints = () => {
            const rows: Array<any> = [];

            return new TransformStream({
                objectMode: true,
                transform(row: any, enc, next) {
                    rows.push(row);

                    next();
                },
                flush(next) {
                    for (let row of rows) {
                        this.push(row);
                    }

                    this.push(null);

                    next();
                }
            });
        }

        const setupPipeline = () => {
            browserify.pipeline.get('record').push(gatherEntryPoints());
        }

        setupPipeline();

        browserify.transform<CustomOptions>(transform, options);
    };
};

export default Tsify;
