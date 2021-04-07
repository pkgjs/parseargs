'use strict';

const parseArgs = (
  argv = process.argv.slice(require.main ? 2 : 1),
  options = {}
) => {
  if (typeof options !== 'object' || options === null) {
    throw new Error('Whoops!')
  }

  let result = {
    args: {},
    values: {},
    positionals: []
  }

  let pos = 0
  while (pos < argv.length) {
    let arg = argv[pos]

    if (arg.startsWith('-')) {
      // Everything after a bare '--' is considered a positional argument
      // and is returned verbatim
      if (arg === '--') {
        result.positionals.push(...argv.slice(++pos))

        return result
      }
      // look for shortcodes: -fXzy
      else if (arg.charAt(1) !== '-') {
        throw new Error('What are we doing with shortcodes!?!')
      }

      // Any number of leading dashes are allowed
      // remove all leading dashes
      arg = arg.replace(/^-+/, '')

      if (arg.includes('=')) {
        const argParts = arg.split('=')

        result.args[argParts[0]] = true
        if (options.withValue) {
          result.values[argParts[0]] = argParts[1]
        }
      }
      else {
        result.args[arg] = true

      }
    }

    pos++
  }

  return result
}

module.exports = {
  parseArgs
}
