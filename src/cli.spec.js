import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import execa from 'execa'
import kill from 'tree-kill-promise'
import { outputFile } from 'fs-extra'
import portReady from 'port-ready'
import puppeteer from '@dword-design/puppeteer'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await outputFile(
        'pages/index.vue',
        endent`
      <template>
        <div>Hello world</div>
      </template>

    `
      )
      await execa(require.resolve('./cli'), ['build'])
      const childProcess = execa(require.resolve('./cli'), ['start'])
      await portReady(3000)
      await page.goto('http://localhost:3000')
      expect(await page.$eval('div', div => div.textContent)).toEqual(
        'Hello world'
      )
      await Promise.all([kill(childProcess.pid), browser.close()])
    }),
  babel: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'modules/foo/index.js': endent`
        export default () => console.log(1 |> (x => x * 2))

      `,
        'nuxt.config.js': endent`
        export default {
          modules: [
            '~/modules/foo',
          ],
        }

      `,
      })
      await execa(require.resolve('./cli'), ['build'])
    }),
  'build errors': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'modules/foo/index.js': 'foo bar',
        'nuxt.config.js': endent`
        export default {
          modules: [
            '~/modules/foo',
          ],
        }

      `,
      })
      try {
        await expect(
          execa(require.resolve('./cli'), ['build'])
        ).rejects.toThrow('Unexpected token, expected ";"')
      } catch (error) {
        console.log(error.message)
      }
    }),
}
