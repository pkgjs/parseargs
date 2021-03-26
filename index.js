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

  console.log('argv is: ', argv)

  let pos = 0
  while (pos < argv.length) {
    const arg = argv[pos]

    if (arg.startsWith('-')) {
      // Everything after a bare '--' is considered a positional argument
      // and is returned verbatim
      if (arg === '--') {
        result.positionals.push(...argv.slice(++pos))

        console.log(result)
        return result
      }
    }

    pos++
  }


  console.log('final result if reached: ', result)
  return result
}

parseArgs()

module.exports = {
  parseArgs
}
