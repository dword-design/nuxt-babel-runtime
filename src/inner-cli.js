import api from './index.js'

try {
  await api(process.argv[2], process.argv.slice(3))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
