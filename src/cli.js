#!/usr/bin/env node

import packageName from 'depcheck-package-name'
import { execa } from 'execa'
import { createRequire } from 'module'

const resolver = createRequire(import.meta.url)
try {
  await execa(
    'node',
    [
      `--experimental-loader=${packageName`babel-register-esm`}`,
      `--require=${packageName`suppress-experimental-warnings`}`,
      `--require=${packageName`@dword-design/suppress-babel-register-esm-warning`}`,
      resolver.resolve('./inner-cli.js'),
      ...process.argv.slice(2),
    ],
    { stdio: 'inherit' },
  )
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
