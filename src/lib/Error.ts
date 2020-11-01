import {
    formatDiagnostic,
    getLineAndCharacterOfPosition
} from "typescript";
import type {Diagnostic, DiagnosticWithLocation, FormatDiagnosticsHost} from "typescript";

export class Error extends SyntaxError {
    private readonly _fileName: string;
    private readonly _line: number;
    private readonly _column: number;

    constructor(diagnostic: Diagnostic | DiagnosticWithLocation) {
        const formatDiagnosticsHost: FormatDiagnosticsHost = {
            getCanonicalFileName(fileName: string): string {
                return fileName;
            },
            getCurrentDirectory(): string {
                return process.cwd();
            },
            getNewLine(): string {
                return '';
            }
        };

        const message = formatDiagnostic(diagnostic, formatDiagnosticsHost);

        super(message);

        if (diagnostic.file) {
            const location = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);

            this._fileName = diagnostic.file.fileName;
            this._line = location.line + 1;
            this._column = location.character + 1;
        }
    }

    get fileName(): string {
        return this._fileName;
    }

    get line(): number {
        return this._line;
    }

    get column(): number {
        return this._column;
    }
}
