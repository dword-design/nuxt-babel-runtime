#!/usr/bin/env node

import { execa } from 'execa'
import { createRequire } from 'module'

const resolver = createRequire(import.meta.url)
try {
  await execa(
    'node',
    [resolver.resolve('./inner-cli.js'), ...process.argv.slice(2)],
    { stdio: 'inherit' },
  )
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
