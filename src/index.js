import * as cli from '@nuxt/cli'
import babelRegister from '@babel/register'

export default args =>
  cli.run(args, {
    hooks: {
      'run:before': () => babelRegister(),
    },
  })
