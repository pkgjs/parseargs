<!-- omit in toc -->
# parseArgs

[![Coverage][coverage-image]][coverage-url]

Polyfill of proposal for `util.parseArgs()`

## `util.parseArgs([config])`

<!-- YAML
added: REPLACEME
-->

> Stability: 1 - Experimental

* `config` {Object} Used to provide arguments for parsing and to configure
  the parser. `config` supports the following properties:
  * `args` {string\[]} array of argument strings. **Default:** `process.argv`
    with `execPath` and `filename` removed.
  * `options` {Object} Used to describe arguments known to the parser.
    Keys of `options` are the long names of options and values are an
    {Object} accepting the following properties:
    * `type` {string} Type of argument, which must be either `boolean` or `string`.
      **Default:** `boolean`.
    * `multiple` {boolean} Whether this option can be provided multiple
      times. If `true`, all values will be collected in an array. If
      `false`, values for the option are last-wins. **Default:** `false`.
    * `short` {string} A single character alias for the option.
  * `strict`: {boolean} Should an error be thrown when unknown arguments
    are encountered, or when arguments are passed that do not match the
    `type` configured in `options`.
    **Default:** `true`.
  * `allowPositionals`: {boolean} Whether this command accepts positional arguments.
    **Default:** `false` if `strict` is `true`, otherwise `true`.

* Returns: {Object} The parsed command line arguments:
  * `values` {Object} A mapping of parsed option names with their {string}
    or {boolean} values.
  * `positionals` {string\[]} Positional arguments.

Provides a higher level API for command-line argument parsing than interacting
with `process.argv` directly. Takes a specification for the expected arguments and returns a structured object with the parsed options and positionals.

```mjs
import { parseArgs } from 'node:util';
const args = ['-f', '--bar', 'b'];
const options = {
  foo: {
    type: 'boolean',
    short: 'f'
  },
  bar: {
    type: 'string'
  }
};
const {
  values,
  positionals
} = parseArgs({ args, options });
```

```cjs
const { parseArgs } = require('node:util');
const args = ['-f', '--bar', 'b'];
const options = {
  foo: {
    type: 'boolean',
    short: 'f'
  },
  bar: {
    type: 'string'
  }
};
const {
  values,
  positionals
} = parseArgs({ args, options });
```

`util.parseArgs` is experimental and behavior may change. Join the
conversation in [pkgjs/parseargs][] to contribute to the design.

-----

<!-- omit in toc -->
## Table of Contents
- [`util.parseArgs([config])`](#utilparseargsconfig)
  - [Scope](#scope)
  - [Links & Resources](#links--resources)
- [🚀 Getting Started](#-getting-started)
- [🙌 Contributing](#-contributing)
- [💡 `process.mainArgs` Proposal](#-processmainargs-proposal)
  - [Implementation:](#implementation)
- [💡 `util.parseArgs([config])` Proposal](#-utilparseargsconfig-proposal)
- [📃 Examples](#-examples)
  - [F.A.Qs](#faqs)

-----

## Scope

It is already possible to build great arg parsing modules on top of what Node.js provides; the prickly API is abstracted away by these modules. Thus, process.parseArgs() is not necessarily intended for library authors; it is intended for developers of simple CLI tools, ad-hoc scripts, deployed Node.js applications, and learning materials.

It is exceedingly difficult to provide an API which would both be friendly to these Node.js users while being extensible enough for libraries to build upon. We chose to prioritize these use cases because these are currently not well-served by Node.js' API.

## 🚀 Getting Started

1. **Install dependencies.**

   ```bash
   npm install
   ```

2. **Open the index.js file and start editing!**

3. **Test your code by calling parseArgs through our test file**

   ```bash
   npm test
   ```

----

## 🙌 Contributing

Any person who wants to contribute to the initiative is welcome! Please first read the [Contributing Guide](CONTRIBUTING.md)

Additionally, reading the [`Examples w/ Output`](#-examples-w-output) section of this document will be the best way to familiarize yourself with the target expected behavior for parseArgs() once it is fully implemented.

This package was implemented using [tape](https://www.npmjs.com/package/tape) as its test harness.

----

## 💡 `process.mainArgs` Proposal

> Note: This can be moved forward independently of the `util.parseArgs()` proposal/work.

### Implementation:

```javascript
process.mainArgs = process.argv.slice(process._exec ? 1 : 2)
```

----

## 💡 `util.parseArgs([config])` Proposal

* `config` {Object} (Optional) The `config` parameter is an
  object supporting the following properties:
  * `args` {string[]} (Optional) Array of argument strings; defaults
    to [`process.mainArgs`](process_argv)
  * `options` {Object} (Optional) An object describing the known options to look for in `args`; `options` keys are the long names of the known options, and the values are objects with the following properties:
    * `type` {'string'|'boolean'} (Required) Type of known option
    * `multiple` {boolean} (Optional) If true, when appearing one or more times in `args`, results are collected in an `Array`
    * `short` {string} (Optional) A single character alias for an option; When appearing one or more times in `args`; Respects the `multiple` configuration
  * `strict` {Boolean} (Optional) A `Boolean` for whether or not to throw an error when unknown options are encountered, `type:'string'` options are missing an options-argument, or `type:'boolean'` options are passed an options-argument; defaults to `true`
  * `allowPositionals` {Boolean} (Optional) Whether this command accepts positional arguments. Defaults `false` if `strict` is `true`, otherwise defaults to `true`.
* Returns: {Object} An object having properties:
  * `values` {Object}, key:value for each option found. Value is a string for string options, or `true` for boolean options, or an array (of strings or booleans) for options configured as `multiple:true`.
  * `positionals` {string[]}, containing [Positionals][]

----

## 📃 Examples

```js
const { parseArgs } = require('@pkgjs/parseargs');
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// specify the options that may be used
const options = {
  foo: { type: 'string'},
  bar: { type: 'boolean' },
};
const args = ['--foo=a', '--bar'];
const { values, positionals } = parseArgs({ args, options });
// values = { foo: 'a', bar: true }
// positionals = []
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// type:string & multiple
const options = {
  foo: {
    type: 'string',
    multiple: true,
  },
};
const args = ['--foo=a', '--foo', 'b'];
const { values, positionals } = parseArgs({ args, options });
// values = { foo: [ 'a', 'b' ] }
// positionals = []
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// shorts
const options = {
  foo: {
    short: 'f',
    type: 'boolean'
  },
};
const args = ['-f', 'b'];
const { values, positionals } = parseArgs({ args, options, allowPositionals: true });
// values = { foo: true }
// positionals = ['b']
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// unconfigured
const options = {};
const args = ['-f', '--foo=a', '--bar', 'b'];
const { values, positionals } = parseArgs({ strict: false, args, options, allowPositionals: true });
// values = { f: true, foo: 'a', bar: true }
// positionals = ['b']
```


### F.A.Qs

- Is `cmd --foo=bar baz` the same as `cmd baz --foo=bar`?
  - yes
- Does the parser execute a function?
  - no
- Does the parser execute one of several functions, depending on input?
  - no
- Can subcommands take options that are distinct from the main command?
  - no
- Does it output generated help when no options match?
  - no
- Does it generated short usage?  Like: `usage: ls [-ABCFGHLOPRSTUWabcdefghiklmnopqrstuwx1] [file ...]`
  - no (no usage/help at all)
- Does the user provide the long usage text?  For each option?  For the whole command?
  - no
- Do subcommands (if implemented) have their own usage output?
  - no
- Does usage print if the user runs `cmd --help`?
  - no
- Does it set `process.exitCode`?
  - no
- Does usage print to stderr or stdout?
  - N/A
- Does it check types?  (Say, specify that an option is a boolean, number, etc.)
  - no
- Can an option have more than one type?  (string or false, for example)
  - no
- Can the user define a type?  (Say, `type: path` to call `path.resolve()` on the argument.)
  - no
- Does a `--foo=0o22` mean 0, 22, 18, or "0o22"?
  - `"0o22"`
- Does it coerce types?
  - no
- Does `--no-foo` coerce to `--foo=false`?  For all options?  Only boolean options?
  - no, it sets `{values:{'no-foo': true}}`
- Is `--foo` the same as `--foo=true`?  Only for known booleans?  Only at the end?
  - no, they are not the same. There is no special handling of `true` as a value so it is just another string.
- Does it read environment variables?  Ie, is `FOO=1 cmd` the same as `cmd --foo=1`?
  - no
- Do unknown arguments raise an error?  Are they parsed?  Are they treated as positional arguments?
  - no, they are parsed, not treated as positionals
- Does `--` signal the end of options?
  - yes
- Is `--` included as a positional?
  - no
- Is `program -- foo` the same as `program foo`?
  - yes, both store `{positionals:['foo']}`
- Does the API specify whether a `--` was present/relevant?
  - no
- Is `-bar` the same as `--bar`?
  - no, `-bar` is a short option or options, with expansion logic that follows the
    [Utility Syntax Guidelines in POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html). `-bar` expands to `-b`, `-a`, `-r`.
- Is `---foo` the same as `--foo`?
  - no
  - the first is a long option named `'-foo'`
  - the second is a long option named `'foo'`
- Is `-` a positional? ie, `bash some-test.sh | tap -`
  - yes

## Links & Resources

* [Initial Tooling Issue](https://github.com/nodejs/tooling/issues/19)
* [Initial Proposal](https://github.com/nodejs/node/pull/35015)
* [parseArgs Proposal](https://github.com/nodejs/node/pull/42675)

[coverage-image]: https://img.shields.io/nycrc/pkgjs/parseargs
[coverage-url]: https://github.com/pkgjs/parseargs/blob/main/.nycrc
[pkgjs/parseargs]: https://github.com/pkgjs/parseargs
