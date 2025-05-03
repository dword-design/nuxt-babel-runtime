import vitePluginVueBabel from '@dword-design/vite-plugin-vue-babel';
import { runCommand } from '@nuxt/cli';
import { babel as rollupPluginBabel } from '@rollup/plugin-babel';
import vitePluginBabel from 'vite-plugin-babel';

export default (command, args) =>
  runCommand(command, [...args, '--no-fork'], {
    overrides: {
      nitro: {
        rollupConfig: {
          plugins: [
            rollupPluginBabel({
              babelHelpers: 'bundled',
              exclude: /\/node_modules\//,
            }),
          ],
        },
      },
      vite: {
        plugins: [
          { enforce: 'pre', ...vitePluginVueBabel() },
          vitePluginBabel({ exclude: /\/node_modules\// }),
        ],
      },
    },
  });
