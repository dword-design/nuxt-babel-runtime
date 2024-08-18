import vitePluginVueBabel from '@dword-design/vite-plugin-vue-babel';
import { babel as rollupPluginBabel } from '@rollup/plugin-babel';
import { runCommand } from 'nuxi';
import vitePluginBabel from 'vite-plugin-babel';

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
          { enforce: 'pre', ...vitePluginVueBabel() },
          vitePluginBabel(),
        ],
      },
    },
  });
