import {Error as TransformError} from "./Error";
import {lstatSync} from "fs";
import {
    CompilerHost,
    createIncrementalCompilerHost,
    createIncrementalProgram,
    EmitAndSemanticDiagnosticsBuilderProgram,
    SourceFile
} from "typescript";
import {PassThrough, Transform as TransformStream} from "stream";

import type {CompilerOptions, Diagnostic} from "typescript";
import type {TransformCallback} from "stream";
import type {TransformEventEmitter, Options} from "../index";

/**
 * @internal
 */
type CompiledFileOutput = {
    fileName: string,
    content: string
};

/**
 * @internal
 */
class CompiledFile {
    private _etag: number;
    private _source: SourceFile;
    private _output: CompiledFileOutput;

    set etag(value: number) {
        this._etag = value;
    }

    get etag(): number {
        return this._etag;
    }

    set source(value: SourceFile) {
        this._source = value;
    }

    get source(): SourceFile {
        return this._source;
    }

    set output(value: CompiledFileOutput) {
        this._output = value;
    }

    get output(): CompiledFileOutput {
        return this._output;
    }
}

const Transform = (compilerOptions: CompilerOptions, eventEmitter: TransformEventEmitter): (fileName: string, options: Options) => TransformStream => {
    /**
     * TypeScript refuses to emit files that have the same path as their source.
     * It means that JavaScript files are not emitted if outDir is not set.
     */
    compilerOptions.outDir = '|tsify|';

    const cache: Map<string, CompiledFile> = new Map();

    const isTypeScript = (fileName: string): boolean => {
        return (/\.tsx?$/i).test(fileName);
    };

    const isJavaScript = (fileName: string): boolean => {
        return (/\.jsx?$/i).test(fileName);
    };

    return (fileName, options) => {
        const host = createIncrementalCompilerHost(compilerOptions);

        /**
         * Write or update the cache
         */
        host.writeFile = (destinationFileName, data, writeByteOrderMark, onError, sourceFiles) => {
            if (isBuildInfoFile(destinationFileName)) {
                // noop, not supported
            } else {
                const writeFile = (fileName: string) => {
                    let compiledFile: CompiledFile;

                    compiledFile = getCompiledFile(fileName);

                    compiledFile.output = {
                        content: data,
                        fileName: destinationFileName,
                    };

                    cacheCompiledFile(fileName, compiledFile);
                }

                for (let sourceFile of sourceFiles) {
                    writeFile(sourceFile.fileName);
                }
            }
        };

        const getSourceFile = host.getSourceFile;

        host.getSourceFile = (fileName: string, languageVersion): SourceFile => {
            eventEmitter.emit('file', fileName);

            let compiledFile: CompiledFile = getCompiledFile(fileName);

            if (compiledFile) {
                return compiledFile.source;
            }

            const source: SourceFile = getSourceFile(fileName, languageVersion);

            const {mtimeMs} = lstatSync(fileName);

            compiledFile = new CompiledFile();
            compiledFile.etag = mtimeMs;
            compiledFile.source = source;

            cacheCompiledFile(fileName, compiledFile);

            return source;
        };

        const isBuildInfoFile = (fileName: string): boolean => {
            return fileName === compilerOptions.tsBuildInfoFile;
        };

        const createProgram = (options: CompilerOptions, rootNames: Array<string>, host: CompilerHost): EmitAndSemanticDiagnosticsBuilderProgram => {
            return createIncrementalProgram({rootNames, options, host});
        };

        const getCache = (key: string): CompiledFile => {
            if (!cache.has(key)) {
                cache.set(key, new CompiledFile());
            }

            return cache.get(key);
        };

        const cacheCompiledFile = (key: string, compiledFile: CompiledFile) => {
            cache.set(key, compiledFile);
        };

        const getCompiledFile = (fileName: string): CompiledFile | undefined => {
            const compiledFile = getCache(fileName);
            const {mtimeMs} = lstatSync(fileName);

            if (compiledFile.etag === mtimeMs) {
                return compiledFile;
            }

            return undefined;
        };

        const compile = (fileName: string): CompiledFile => {
            const program = createProgram(compilerOptions, [fileName], host);

            let diagnostics: readonly Diagnostic[] = [
                ...program.getSyntacticDiagnostics(),
                ...program.getOptionsDiagnostics(),
                ...program.getGlobalDiagnostics(),
                ...program.getSemanticDiagnostics()
            ];

            if (diagnostics.length) {
                for (let diagnostic of diagnostics) {
                    eventEmitter.emit('error', new TransformError(diagnostic));
                }

                return undefined;
            }

            program.emit();

            return getCompiledFile(fileName);
        };

        if (isTypeScript(fileName) || (isJavaScript(fileName) && compilerOptions.allowJs)) {
            return new TransformStream({
                transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
                    callback();
                },
                flush(callback: TransformCallback) {
                    let compiledFile: CompiledFile = getCompiledFile(fileName);

                    if (!compiledFile) {
                        compiledFile = compile(fileName);
                    }

                    if (compiledFile) {
                        this.push(compiledFile.output.content);
                    }

                    this.push(null);

                    callback();
                }
            })
        }

        return new PassThrough();
    };
}

export default Transform;
