# tsify 2  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> Browserify plugin for TypeScript sources

## Installation

```bash
npm install tsify2 --save-dev
```

## Basic Usage

```typescript
import * as Browserify from "browserify";
import Tsify from "tsify2";
  
const tsify = Tsify({
    // TypeScript compiler options
});

let browserify = Browserify()
    .add('main.ts')
    .plugin(tsify, {})
    .bundle((error, data) => {
        // do something with error and data
    });
;
```

## API

Read the [documentation](https://nightlycommit.github.io/tsify2) for more information.

## License

Apache-2.0 © [Eric MORAND]()

[npm-image]: https://badge.fury.io/js/tsify2.svg
[npm-url]: https://npmjs.org/package/tsify2
[travis-image]: https://travis-ci.com/NightlyCommit/tsify2.svg?branch=master
[travis-url]: https://travis-ci.com/NightlyCommit/tsify2
[coveralls-image]: https://coveralls.io/repos/github/NightlyCommit/tsify2/badge.svg
[coveralls-url]: https://coveralls.io/github/NightlyCommit/tsify2