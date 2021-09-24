'use strict';

const parseArgs = (
  argv = process.argv.slice(require.main ? 2 : 1),
  options = {}
) => {
  if (typeof options !== 'object' || options === null) {
    throw new Error('Whoops!')
  }
  if(options.withValue && !Array.isArray(options.withValue)) {
    throw new Error('Whoops! options.withValue should be an array.')
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
        //If withValue option isn't specified, set value as undefined
        const val = options.withValue && options.withValue.includes(argParts[0]) ? argParts[1] : undefined
        //Append value to previous arg values array for case of multiples option, else add to empty array
        result.values[argParts[0]] = [...(options.multiples && options.multiples.includes(argParts[0]) && result.values[argParts[0]] ? result.values[argParts[0]] : []), val]
      } else if (pos + 1 < argv.length) {
        //withValue option should also support setting values when '=' isn't used
        //ie. both --foo=bar and --foo bar should work

        result.args[arg] = true
        //If withValue option isn't specified, set value as undefined
        const val = options.withValue && options.withValue.includes(arg) ? argv[++pos] : undefined
        //Append value to previous arg values array for case of multiples option, else add to empty array
        result.values[arg] = [...(options.multiples && options.multiples.includes(arg) && result.values[arg] ? result.values[arg] : []), val]
      } else {
        result.args[arg] = true
        //Append undefined to previous arg values array for case of multiples option, else add to empty array
        result.values[arg] = [...(options.multiples && options.multiples.includes(arg) && result.values[arg] ? result.values[arg] : []), undefined]
      }

    } else {
      //Arguements without a dash prefix are considered "positional"
      result.positionals.push(arg)
    }

    pos++
  }

  return result
}

module.exports = {
  parseArgs
}
