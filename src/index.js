import vitePluginVueBabel from '@dword-design/vite-plugin-vue-babel';
import { runCommand } from '@nuxt/cli';
import { babel as rollupPluginBabel } from '@rollup/plugin-babel';
import vitePluginBabel from 'vite-plugin-babel';

export default (command, args) =>
  runCommand(command, [...args, '--no-fork'], {
    overrides: {
      nitro: {
        /* hooks: {
          'rollup:before': ctx => {
            console.log(Object.keys(ctx));

            ctx.options.rollupConfig.plugins =
              ctx.options.rollupConfig.plugins || [];

            ctx.options.rollupConfig.plugins.push(
              rollupPluginBabel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.ts'], */
        // include: ['server/**/*'], // adjust this to your files
        /* }),
            );
          },
        }, */
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
