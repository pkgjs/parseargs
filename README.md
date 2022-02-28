<!-- omit in toc -->
# parseArgs

[![Coverage][coverage-image]][coverage-url]

> 
> 🚨  THIS REPO IS AN EARLY WIP -- DO NOT USE ... yet 🚨
> 

Polyfill of future proposal to the [nodejs/tooling](https://github.com/nodejs/tooling) repo for `util.parseArgs()`

### Scope

It is already possible to build great arg parsing modules on top of what Node.js provides; the prickly API is abstracted away by these modules. Thus, process.parseArgs() is not necessarily intended for library authors; it is intended for developers of simple CLI tools, ad-hoc scripts, deployed Node.js applications, and learning materials.

It is exceedingly difficult to provide an API which would both be friendly to these Node.js users while being extensible enough for libraries to build upon. We chose to prioritize these use cases because these are currently not well-served by Node.js' API.

### Links & Resources

* [Initial Tooling Issue](https://github.com/nodejs/tooling/issues/19)
* [Initial Proposal](https://github.com/nodejs/node/pull/35015)

----

<!-- omit in toc -->
## Table of Contents
- [🚀 Getting Started](#-getting-started)
- [🙌 Contributing](#-contributing)
- [💡 `process.mainArgs` Proposal](#-processmainargs-proposal)
  - [Implementation:](#implementation)
- [💡 `util.parseArgs([config])` Proposal](#-utilparseargsconfig-proposal)
- [📃 Examples](#-examples)
  - [F.A.Qs](#faqs)

----

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
    * `type` {'string'|'boolean'} (Optional) Type of known option; defaults to `'boolean'`; 
    * `multiples` {boolean} (Optional) If true, when appearing one or more times in `args`, results are collected in an `Array`
    * `short` {string} (Optional) A single character alias for an option; When appearing one or more times in `args`; Respects the `multiples` configuration
  * `strict` {Boolean} (Optional) A `Boolean` on wheather or not to throw an error when unknown args are encountered
* Returns: {Object} An object having properties:
  * `flags` {Object}, having properties and `Boolean` values corresponding to parsed options passed
  * `values` {Object}, have properties and `String` values corresponding to parsed options passed
  * `positionals` {string[]}, containing [Positionals][]

----

## 📃 Examples

```js
const { parseArgs } = require('@pkgjs/parseargs');
```

```js
// unconfigured
const { parseArgs } = require('@pkgjs/parseargs');
const args = ['-f', '--foo=a', '--bar', 'b'];
const options = {};
const { flags, values, positionals } = parseArgs({ args, options });
// flags = { f: true, bar: true }
// values = { foo: 'a' }
// positionals = ['b']
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// withValue
const args = ['-f', '--foo=a', '--bar', 'b'];
const options = {
  foo: {
    type: 'string',
  },
};
const { flags, values, positionals } = parseArgs({ args, options });
// flags = { f: true }
// values = { foo: 'a', bar: 'b' }
// positionals = []
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// withValue & multiples
const args = ['-f', '--foo=a', '--foo', 'b'];
const options = {
  foo: {
    type: 'string',
    multiples: true,
  },
};
const { flags, values, positionals } = parseArgs({ args, options });
// flags = { f: true }
// values = { foo: ['a', 'b'] }
// positionals = []
```

```js
const { parseArgs } = require('@pkgjs/parseargs');
// shorts
const args = ['-f', 'b'];
const options = {
  foo: {
    short: 'f',
  },
};
const { flags, values, positionals } = parseArgs({ args, options });
// flags = { foo: true }
// values = {}
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
- Does `--no-foo` coerce to `--foo=false`?  For all flags?  Only boolean flags?
  - no, it sets `{args:{'no-foo': true}}`
- Is `--foo` the same as `--foo=true`?  Only for known booleans?  Only at the end?
  - no, `--foo` is the same as `--foo=`
- Does it read environment variables?  Ie, is `FOO=1 cmd` the same as `cmd --foo=1`?
  - no
- Do unknown arguments raise an error?  Are they parsed?  Are they treated as positional arguments?
  - no, they are parsed, not treated as positionals
- Does `--` signal the end of flags/options?
  - **open question**
  - If `--` signals the end, is `--` included as a positional?  is `program -- foo` the same as `program foo`?  Are both `{positionals:['foo']}`, or is the first one `{positionals:['--', 'foo']}`?
- Does the API specify whether a `--` was present/relevant?
  - no
- Is `-bar` the same as `--bar`?
  - no, `-bar` is a short option or options, with expansion logic that follows the
    [Utility Syntax Guidelines in POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html). `-bar` expands to `-b`, `-a`, `-r`.
- Is `---foo` the same as `--foo`?
  - no 
  - the first flag would be parsed as `'-foo'`
  - the second flag would be parsed as `'foo'`
- Is `-` a positional? ie, `bash some-test.sh | tap -`
  - yes

[coverage-image]: https://img.shields.io/nycrc/pkgjs/parseargs
[coverage-url]: https://github.com/pkgjs/parseargs/blob/main/.nycrc
