import { endent, property } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import axios from 'axios';
import packageName from 'depcheck-package-name';
import { execa } from 'execa';
import fs from 'fs-extra';
import { createRequire } from 'module';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import P from 'path';
import { chromium } from 'playwright';
import portReady from 'port-ready';
import kill from 'tree-kill-promise';

const resolver = createRequire(import.meta.url);

export default tester(
  {
    api: async () => {
      await fs.outputFile(
        'server/api/foo.get.js',
        endent`
          import { defineEventHandler } from '#imports'

          export default defineEventHandler(() => 1 |> x => x * 2)
        `,
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();

        const result =
          axios.get('http://localhost:3000/api/foo')
          |> await
          |> property('data');

        expect(result).toEqual(2);
      } finally {
        await kill(nuxt.pid);
      }
    },
    async build() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      );

      await execa(resolver.resolve('./cli.js'), ['build']);
      const nuxt = execa(resolver.resolve('./cli.js'), ['start']);

      try {
        await portReady(3000);
        await this.page.goto('http://localhost:3000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    'build error in Vue': async () => {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div />
          </template>

          <script setup>
          foo bar
          </script>
        `,
      );

      await expect(
        execa(resolver.resolve('./cli.js'), ['build'], {
          env: { NODE_ENV: '' },
        }),
      ).rejects.toThrow(endent`
        [at position 6] [vue/compiler-sfc] ${P.resolve('pages', 'index.vue')}: Missing semicolon. (2:3)

        ${P.resolve('pages', 'index.vue').replace(/\\/g, '/')}
        4  |  
        5  |  <script setup>
        6  |  foo bar
           |     ^
        7  |  </script>
      `);
    },
    'build error in module': async () => {
      await fs.outputFile(
        'modules/foo.js',
        endent`
          import { defineNuxtModule } from '@nuxt/kit';

          export default defineNuxtModule({ setup: () => { throw new Error('This is an error') } });
        `,
      );

      await expect(
        execa(resolver.resolve('./cli.js'), ['build']),
      ).rejects.toThrow('This is an error');
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
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        );
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        );
      } finally {
        await kill(nuxt.pid);
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
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'dev NITRO_PORT env variable'() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { NITRO_PORT: 4000 },
      });

      try {
        await nuxtDevReady(4000);
        await this.page.goto('http://localhost:4000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'dev NUXT_PORT env variable'() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { NUXT_PORT: 4000 },
      });

      try {
        await nuxtDevReady(4000);
        await this.page.goto('http://localhost:4000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'dev PORT env variable'() {
      await fs.outputFile(
        'pages/index.vue',
        endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { PORT: 4000 },
      });

      try {
        await nuxtDevReady(4000);
        await this.page.goto('http://localhost:4000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'dev port config variable'() {
      await outputFiles({
        'nuxt.config.js': endent`
          export default {
            devServer: { port: 4000 },
          }
        `,
        'pages/index.vue': endent`
          <template>
            <div class="foo">Hello world</div>
          </template>
        `,
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady(4000);
        await this.page.goto('http://localhost:4000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          'Hello world',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
    'do not transpile browser js in node_modules': async () => {
      await outputFiles({
        'node_modules/foo': {
          'index.js': 'export default 1 |> x => x * 2;',
          'package.json': JSON.stringify({
            main: 'index.js',
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
            <div>{{ foo }}</div>
          </template>

          <script setup>
          import foo from 'foo'
          </script>
        `,
      });

      await expect(
        execa(resolver.resolve('./cli.js'), ['build']),
      ).rejects.toThrow('Expression expected');
    },
    'do not transpile server js in node_modules': async () => {
      await outputFiles({
        'node_modules/foo': {
          'index.js': 'export default 1 |> x => x * 2;',
          'package.json': JSON.stringify({
            main: 'index.js',
            name: 'foo',
            type: 'module',
          }),
        },
        'package.json': JSON.stringify({
          dependencies: { foo: '*' },
          type: 'module',
        }),
        'server/api/foo.js': endent`
          import foo from 'foo';

          export default defineEventHandler(() => foo);
        `,
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();

        await expect(
          axios.get('http://localhost:3000/api/foo'),
        ).rejects.toMatchObject({
          response: { data: { message: "Unexpected token '>'" } },
        });
      } finally {
        await kill(nuxt.pid);
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
      });

      await expect(
        execa(resolver.resolve('./cli.js'), ['build']),
      ).rejects.toThrow(
        'This experimental syntax requires enabling the parser plugin: "pipelineOperator".',
      );
    },
    async 'file imported from api dev'() {
      await outputFiles({
        'model/foo.js': 'export default 1 |> x => x * 2',
        'nuxt.config.js': endent`
          import { createResolver } from '@nuxt/kit';

          const resolver = createResolver(import.meta.url);

          export default {
            nitro: {
              externals: {
                inline: [resolver.resolve('./model')],
              },
            },
          };
        `,
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
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { NODE_OPTIONS: '' }, // Remove babel Node.js loader for tests temporarily
      });

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');
        await this.page.locator('.foo').waitFor({ state: 'attached' });
      } finally {
        await kill(nuxt.pid);
      }
    },
    async 'file imported from api no console warnings'() {
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
      });

      const oldNodeOptions = process.env.NODE_OPTIONS;
      // Remove babel Node.js loader for tests temporarily
      process.env.NODE_OPTIONS = '';
      const output = await execa(resolver.resolve('./cli.js'), ['build']);

      expect(output.stderr).not.toMatch(
        'ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time\n',
      );

      expect(output.stderr).not.toMatch(
        'DeprecationWarning: Obsolete loader hook(s) supplied and will be ignored: getFormat, transformSource\n',
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['start']);

      try {
        await portReady(3000);
        await this.page.goto('http://localhost:3000');
        await this.page.locator('.foo').waitFor({ state: 'attached' });
      } finally {
        await kill(nuxt.pid);
        process.env.NODE_OPTIONS = oldNodeOptions;
      }
    },
    async 'hot reload component'() {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          const foo = 1 |> x => x * 2;
          </script>
        `,
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { NODE_ENV: '' },
        stdio: 'inherit',
      });

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');
        await this.page.locator('.foo').waitFor({ state: 'attached' });

        await fs.outputFile(
          'pages/index.vue',
          endent`
            <template>
              <div class="bar">{{ foo }}</div>
            </template>

            <script setup>
            const foo = 1 |> x => x * 2;
            </script>
          `,
        );

        await this.page.locator('.bar').waitFor({ state: 'attached' });
      } finally {
        await kill(nuxt.pid);
      }
    },
    module: async () => {
      await fs.outputFile(
        'modules/foo.js',
        'export default () => console.log(1 |> (x => x * 2))',
      );

      await execa(resolver.resolve('./cli.js'), ['build']);
    },
    'non-testing env': async () => {
      await fs.outputFile(
        'server/api/foo.get.js',
        endent`
          import { defineEventHandler } from '#imports'

          export default defineEventHandler(() => 1 |> x => x * 2)
        `,
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev'], {
        env: { NODE_ENV: '' },
      });

      try {
        await nuxtDevReady();

        const result =
          axios.get('http://localhost:3000/api/foo')
          |> await
          |> property('data');

        expect(result).toEqual(2);
      } finally {
        await kill(nuxt.pid);
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
      );

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');
        const foo = await this.page.waitForSelector('.foo');
        expect(await foo.evaluate(el => el.innerText)).toEqual('2');
      } finally {
        await kill(nuxt.pid);
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
      });

      const nuxt = execa(resolver.resolve('./cli.js'), ['dev']);

      try {
        await nuxtDevReady();
        await this.page.goto('http://localhost:3000');

        expect(await this.page.$eval('.foo', div => div.textContent)).toEqual(
          '2',
        );
      } finally {
        await kill(nuxt.pid);
      }
    },
  },
  [
    testerPluginTmpDir(),
    {
      async after() {
        await this.browser.close();
      },
      async afterEach() {
        await this.page.close();
      },
      async before() {
        this.browser = await chromium.launch();
      },
      async beforeEach() {
        this.page = await this.browser.newPage();
      },
    },
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
);
