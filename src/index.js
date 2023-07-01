import { transform } from '@babel/core'
import { babel as rollupPluginBabel } from '@rollup/plugin-babel'
import { parseVueRequest } from '@vitejs/plugin-vue'
import { parse } from '@vue/compiler-sfc'
import { runCommand } from 'nuxi'
import vitePluginBabel from 'vite-plugin-babel'
import vueSfcDescriptorToString from 'vue-sfc-descriptor-to-string'

export default (command, args) =>
  runCommand(command, args, {
    overrides: {
      nitro: {
        rollupConfig: {
          plugins: [rollupPluginBabel({ babelHelpers: 'bundled' })],
        },
      },
      vite: {
        plugins: [
          {
            enforce: 'pre',
            transform: async (code, id) => {
              const query = parseVueRequest(id)
              if (
                query.filename.endsWith('.vue') &&
                query.query.type !== 'style' &&
                !query.filename.split('/').includes('node_modules')
              ) {
                const sfc = parse(code)
                for (const section of ['scriptSetup', 'script']) {
                  if (
                    sfc.descriptor[section] &&
                    sfc.descriptor[section].lang === undefined
                  ) {
                    sfc.descriptor[section].content = await transform(
                      sfc.descriptor[section].content,
                      {
                        filename: query.filename,
                      },
                    ).code
                  }
                }

                return vueSfcDescriptorToString(sfc.descriptor)
              }

              return code
            },
          },
          vitePluginBabel(),
        ],
      },
    },
  })
