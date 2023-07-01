import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginPuppeteer from '@dword-design/tester-plugin-puppeteer'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import axios from 'axios'
import packageName from 'depcheck-package-name'
import { execa } from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'
import nuxtDevReady from 'nuxt-dev-ready'
import outputFiles from 'output-files'
import portReady from 'port-ready'
import kill from 'tree-kill-promise'

const _require = createRequire(import.meta.url)

export default tester(
  {
    api: async () => {
      await fs.outputFile(
        'server/api/foo.get.js',
        endent`
          import { defineEventHandler } from '#imports'

          export default defineEventHandler(() => 1 |> x => x * 2)
        `,
      )

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()

        const result =
          axios.get('http://localhost:3000/api/foo')
          |> await
          |> property('data')
        expect(result).toEqual(2)
      } finally {
        await kill(nuxt.pid)
      }
    },
    babel: async () => {
      await fs.outputFile(
        'modules/foo/index.js',
        'export default () => console.log(1 |> (x => x * 2))',
      )
      await execa(_require.resolve('./cli'), ['build'])
    },
    async build() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      )
      await execa(_require.resolve('./cli'), ['build'])

      const nuxt = execa(_require.resolve('./cli'), ['start'])
      try {
        await portReady(3000)
        await this.page.goto('http://localhost:3000')
        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    'build errors': async () => {
      await fs.outputFile('modules/foo/index.js', 'foo bar')
      await expect(execa(_require.resolve('./cli'), ['build'])).rejects.toThrow(
        'Missing semicolon.',
      )
    },
    async component() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          const foo = 1 |> x => x * 2
          </script>
        `,
      )

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    async composable() {
      await outputFiles({
        'composables/foo.js': 'export const foo = 1 |> x => x * 2',
        'pages/index.vue': endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          import { foo } from '#imports'
          </script>
        `,
      })

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    async dev() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      )

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
    'do not transpile vue in node_modules': async () => {
      await outputFiles({
        'node_modules/foo': {
          'index.vue': endent`
            <template>
              <div class="foo">{{ foo }}</div>
            </template>

            <script setup>
            const foo = 1 |> x => x * 2
            </script>
          `,
          'package.json': JSON.stringify({
            main: 'index.vue',
            name: 'foo',
            type: 'module',
          }),
        },
        'package.json': JSON.stringify({
          dependencies: { foo: '*' },
          type: 'module',
        }),
        'pages/index.vue': endent`
          <template>
            <foo />
          </template>

          <script setup>
          import Foo from 'foo'
          </script>
        `,
      })
      await expect(execa(_require.resolve('./cli'), ['build'])).rejects.toThrow(
        'This experimental syntax requires enabling the parser plugin: "pipelineOperator".',
      )
    },
    async 'file imported from api'() {
      await outputFiles({
        'model/foo.js': 'export default 1 |> x => x * 2',
        'pages/index.vue': endent`
          <template>
            <div class="foo" />
          </template>
        `,
        'server/api/foo.get.js': endent`
          import { defineEventHandler } from '#imports'

          import foo from '@/model/foo.js'

          export default defineEventHandler(() => foo)
        `,
      })

      const oldNodeOptions = process.env.NODE_OPTIONS
      process.env.NODE_OPTIONS = ''

      const nuxt = execa(_require.resolve('./cli'), ['dev'], {
        env: { NODE_OPTIONS: '--experimental-loader=babel-register-esm' },
      })
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        await this.page.waitForSelector('.foo')
      } finally {
        await kill(nuxt.pid)
        process.env.NODE_OPTIONS = oldNodeOptions
      }
    },
    async 'pipeline operator await in component'() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          const foo = Promise.resolve(1) |> await |> x => x * 2
          </script>
        `,
      )

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')

        const foo = await this.page.waitForSelector('.foo')
        expect(await foo.evaluate(el => el.innerText)).toEqual('2')
      } finally {
        await kill(nuxt.pid)
      }
    },
    async plugin() {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          import { useNuxtApp } from '#imports'

          const nuxtApp = useNuxtApp()
          const foo = nuxtApp.$foo
          </script>
        `,
        'plugins/foo.js': endent`
          import { defineNuxtPlugin } from '#imports'

          export default defineNuxtPlugin(() => ({ provide: { foo: 1 |> x => x * 2 } }))
        `,
      })

      const nuxt = execa(_require.resolve('./cli'), ['dev'])
      try {
        await nuxtDevReady()
        await this.page.goto('http://localhost:3000')
        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        )
      } finally {
        await kill(nuxt.pid)
      }
    },
  },
  [
    testerPluginTmpDir(),
    testerPluginPuppeteer(),
    {
      beforeEach: () =>
        fs.outputFile(
          '.babelrc.json',
          JSON.stringify({
            plugins: [
              [
                packageName`@babel/plugin-proposal-pipeline-operator`,
                { proposal: 'fsharp' },
              ],
            ],
          }),
        ),
    },
  ],
)
