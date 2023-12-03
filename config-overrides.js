const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const git = require('git-rev-sync');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

const isProduction = process.env.NODE_ENV === 'production';

const { addMultipleEntry, addLessLoader, modifyVars } = require('./config-overrides.util');
const { entries } = require('./config-overrides.projects');

const {
  override,
  addBundleVisualizer,
  addWebpackPlugin,
  addWebpackResolve,
  addWebpackAlias,
  addDecoratorsLegacy,
  fixBabelImports,
  overrideDevServer,
  watchAll,
} = require('customize-cra');

module.exports = {
  webpack: override(
    addDecoratorsLegacy(),
    fixBabelImports('antd', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }),
    addLessLoader({
      cssLoaderOptions: {},
      cssModules: { mode: 'local' },
      lessOptions: {
        math: 'parens-division',
        javascriptEnabled: true,
        sourceMap: true,
        modifyVars: modifyVars,
      },
    }),
    addMultipleEntry(entries),
    addWebpackAlias({
      '~': path.resolve(__dirname, 'src/'),
      '@': path.resolve(__dirname, 'src/'),
      'src': path.resolve(__dirname, 'src/'),
      'locale': path.resolve(__dirname, 'src/locale'),
      'root': path.resolve(__dirname, 'src/'),
    }),
    addWebpackResolve({
      fallback: {
        https: false,
        http: false,
        url: false,
        os: false,
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.less', '.css', '.json', '.svg'],
    }),
    addWebpackPlugin(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    ),

    config => {
      const headScripts = [`<meta name="gitcommit" content="${git.long()}" />`].join('\n');

      const tsJSONPath = path.resolve(__dirname, 'tsconfig.json');
      const tsJson = JSON.parse(fs.readFileSync(tsJSONPath, 'UTF8'));

      tsJson.compilerOptions.paths = {
        '~/*': ['src/*'],
        '@/*': ['src/*'],
        'locale/*': ['src/locale/*'],
      };
      tsJson.compilerOptions.baseUrl = 'src';

      fs.writeFileSync(tsJSONPath, JSON.stringify(tsJson, null, 2));

      let _env = process.env.AppEnv || 'local';

      if (!isProduction) {
        config.plugins.push(
          new CircularDependencyPlugin({
            // exclude detection of files based on a RegExp
            exclude: /node_modules/,
            // add errors to webpack instead of warnings
            failOnError: true,
            // set the current working directory for displaying module paths
            cwd: process.cwd(),
          })
        );
      }

      config.plugins.push(
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
          REACT_APP_GIT_COMMIT: JSON.stringify(git.long()),
        }),
        new webpack.DefinePlugin({
          'process.env.ENV_NAME': JSON.stringify(_env),
          'process.env.LANGUAGE': JSON.stringify(process.env.LANGUAGE),
        })
      );
      // Object.keys(dllWebpacks.entry).forEach(name => {
      //   config.plugins.push(new webpack.DllReferencePlugin({
      //     context: path.join(__dirname),
      //     manifest: require(`./public/dll/${name}-manifest.json`), // eslint-disable-line
      //   }));
      // })

      config.plugins.forEach(element => {
        if (element.constructor.name === 'HtmlWebpackPlugin') {
          element.userOptions.HEAD_SCRIPTS = headScripts;
        }
      });

      return config;
    }
  ),
  devServer: overrideDevServer(config => {
    return {
      ...config,
      historyApiFallback: {
        // rewrites: [{ from: /^\/v2/, to: '/dds2.html' }],
      },
    };
  }),
};
