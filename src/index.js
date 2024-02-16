import { transform } from '@babel/core'
import { babel as rollupPluginBabel } from '@rollup/plugin-babel'
import { parseVueRequest } from '@vitejs/plugin-vue'
import { parse } from '@vue/compiler-sfc'
import { runCommand } from 'nuxi'
import vitePluginBabel from 'vite-plugin-babel'
import vueSfcDescriptorToString from 'vue-sfc-descriptor-to-string'
import { generateCodeFrame } from '@vue/compiler-dom'
import { endent } from '@dword-design/functions'

export default (command, args) =>
  runCommand(command, [...args, '--no-fork'], {
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
                    try {
                      const { code } = await transform(
                        sfc.descriptor[section].content,
                        {
                          filename: query.filename,
                        },
                      )
                      sfc.descriptor[section].content = code
                    } catch (error) {
                      error.message = endent`[vue/compiler-sfc] ${error.message.split('\n')[0]}

                        ${query.filename}
                        ${generateCodeFrame(
                          sfc.descriptor.source,
                          error.pos + sfc.descriptor[section].loc.start.offset,
                          error.pos + sfc.descriptor[section].loc.start.offset + 1
                        )}
                      `
                      throw error
                    }
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
