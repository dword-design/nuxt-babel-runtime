import babelRegister from '@babel/register'
import * as cli from '@nuxt/cli'

export default args =>
  cli.run(args, {
    hooks: {
      'run:before': () => babelRegister(),
    },
  })
