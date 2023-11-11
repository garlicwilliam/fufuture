const path = require('path');
const _ = require('lodash');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('react-scripts/config/paths');
const isProduction = process.env.NODE_ENV === 'production';

function addMultipleEntry(entries) {
  return config => {
    const entryDefines = entries.map(one => {
      one.name = one.isReplaceMain ? 'main' : one.outPath.split('/').pop().split('.')[0];
      one.template = path.resolve(__dirname, one.template);
      one.outPath = _.trim(one.outPath, '/');
      one.entry = path.resolve(__dirname, one.entry);

      return one;
    });

    // @1 entry -----
    const entryMap = entryDefines.reduce((acc, entryDef) => {
      return Object.assign(acc, { [entryDef.name]: entryDef.entry });
    }, {});

    const hasMainReplace = _.has(entryMap, 'main');

    if (!hasMainReplace) {
      entryMap.main = config.entry;
    }
    config.entry = entryMap;

    // @2 plugin -----
    const entryPlugins = entryDefines.map(entryDef => {
      return new HtmlWebpackPlugin({
        filename: entryDef.outPath,
        template: entryDef.template,
        chunks: [entryDef.name],
        inject: true,
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : undefined,
      });
    });

    if (hasMainReplace) {
      removeHtmlWebpackPlugin(config.plugins);
    } else {
      completeMainHtmlWebpackPlugin(config.plugins);
    }
    config.plugins.push(...entryPlugins);

    // @3 output -----
    if (config.output.filename.indexOf('[name].') < 0) {
      config.output.filename = config.output.filename
        .split('/')
        .map((part, index, arr) => {
          return index + 1 === arr.length ? '[name].' + part : part;
        })
        .join('/');
    }

    return config;
  };
}

// customize-cra util function is not compliant
function addLessLoader(loaderOptions = {}, customCssModules = {}) {
  return config => {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const postcssNormalize = require('postcss-normalize');

    const cssLoaderOptions = loaderOptions.cssLoaderOptions || {};
    const lessLoaderOptions = { lessOptions: loaderOptions.lessOptions } || {};

    const { localIdentName } = loaderOptions;
    let cssModules = loaderOptions.cssModules || { localIdentName };

    if (!cssModules.localIdentName) {
      cssModules = customCssModules;
    }

    cssModules.localIdentName = cssModules.localIdentName || '[local]--[hash:base64:5]';

    const lessRegex = /\.less$/;
    const lessModuleRegex = /\.module\.less$/;

    const webpackEnv = process.env.NODE_ENV;
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';
    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
    const publicPath = config.output.publicPath;
    const shouldUseRelativeAssetPaths = publicPath === './';

    // copy from react-scripts
    const getStyleLoaders = (cssOptions, preProcessor) => {
      const loaders = [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
          loader: MiniCssExtractPlugin.loader,
          options: shouldUseRelativeAssetPaths ? { publicPath: '../../' } : {},
        },
        {
          loader: require.resolve('css-loader'),
          options: cssOptions,
        },
        {
          loader: require.resolve('postcss-loader'),
          options: {
            postcssOptions: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('postcss-preset-env')({
                  autoprefixer: {
                    flexbox: 'no-2009',
                  },
                  stage: 3,
                }),
                postcssNormalize(),
              ],
            },
            sourceMap: isEnvProduction && shouldUseSourceMap,
          },
        },
      ].filter(Boolean);

      if (preProcessor) {
        loaders.push({
          loader: require.resolve(preProcessor),
          // not the same as react-scripts
          options: Object.assign(
            {
              sourceMap: true,
            },
            lessLoaderOptions
          ),
        });
      }
      return loaders;
    };

    const loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;

    // Insert less-loader as the penultimate item of loaders (before file-loader)
    loaders.splice(
      loaders.length - 1,
      0,
      {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: getStyleLoaders(
          Object.assign(
            {
              importLoaders: 2,
              sourceMap: isEnvProduction && shouldUseSourceMap,
            },
            cssLoaderOptions
          ),
          path.resolve(paths.appNodeModules, 'less-loader')
        ),
      },
      {
        test: lessModuleRegex,
        use: getStyleLoaders(
          Object.assign(
            {
              importLoaders: 2,
              sourceMap: isEnvProduction && shouldUseSourceMap,
            },
            cssLoaderOptions,
            {
              modules: cssModules,
            }
          ),
          path.resolve(paths.appNodeModules, 'less-loader')
        ),
      }
    );

    return config;
  };
}

const modifyVars = {
  '@primary-color': '#1346FF',
  '@border-radius-base': '4px',
};

module.exports = { addMultipleEntry, addLessLoader, modifyVars };

function removeHtmlWebpackPlugin(plugins) {
  const mainIndex = plugins.findIndex(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');

  if (mainIndex >= 0) {
    return plugins.splice(mainIndex, 1);
  }

  return plugins;
}

function completeMainHtmlWebpackPlugin(plugins) {
  const mainIndex = plugins.findIndex(plugin => plugin.constructor.name === 'HtmlWebpackPlugin');
  if (mainIndex >= 0) {
    plugins[mainIndex].userOptions.chunks = ['main'];
    plugins[mainIndex].userOptions.filename = 'index.html';
  }
}
