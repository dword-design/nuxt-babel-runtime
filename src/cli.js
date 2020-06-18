#!/usr/bin/env node

import api from '.'

const run = async () => {
  try {
    await api()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
run()
