/*
 * @Author:
 * @Date: 2020-06-18 11:33:18
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-09 18:39:39
 */

//  完整的 node.js 命令行解决方案https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md#%e8%ae%be%e7%bd%ae%e5%8f%82%e6%95%b0
const { Command } = require('commander');
const program = new Command();

const {
  override,
  fixBabelImports,
  addLessLoader,
  addWebpackPlugin,
  addWebpackAlias,
  disableEsLint,
  setWebpackOptimizationSplitChunks,
  useBabelRc,
  addBundleVisualizer,
  adjustWorkbox,
  overrideDevServer,
} = require('customize-cra');
const themes = require('./theme');
const path = require('path');
const paths = require('react-scripts/config/paths');

const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin'); // gzip js和css
const LodashWebpackPlugin = require('lodash-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier'); // 补充：对开发友好，打包完成桌面提醒

// 命令行设置地区 jdiot为默认值
program.option(
  '-r, --region <type>, Distinguish deployment environments',
  'jdiot'
);
// 命令行设置 是否前后端完全分离部署
program.option(
  '-s, --isSeparate <type>, Distinguish deployment environments',
  'false'
);
// 命令行设置 是否微前端集成 默认true
program.option(
  '-m, --isMicro <type>, Distinguish deployment environments',
  'false'
);
// 通过program.parse(arguments)方法处理参数，没有被使用的选项会存放在program.args数组中
program.parse(process.argv);

console.log('program-----', program.region);
//  找到需修改的plugin
const findWebpackPlugin = (plugins, pluginName) =>
  plugins.find((plugin) => plugin.constructor.name === pluginName);
// 修改plugin配置
const overrideProcessEnv = (value) => (config) => {
  const plugin = findWebpackPlugin(config.plugins, 'DefinePlugin');
  const processEnv = plugin.definitions['process.env'] || {};

  plugin.definitions['process.env'] = {
    ...processEnv,
    ...value,
  };

  return config;
};
// 热更新
const hotLoader = () => (config, env) => {
  config = rewireReactHotLoader(config, env);
  return config;
};
// 输出文件配置
const appBuildOutput = () => (config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('env is development,skip build path change……');
  } else {
    console.log('env is production, change build path……');
    // 关闭sourceMap
    config.devtool = false;
    process.env.GENERATE_SOURCEMAP = 'false';

    // 更改生产模式输出的文件名
    // main.js 不带hash
    // 按需引入的文件带有hash
    config.output = {
      ...config.output,
      path: paths.appBuild,
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
    };
    config.optimization.runtimeChunk = false;
    config.plugins.forEach((item, index, self) => {
      if (item instanceof MiniCssExtractPlugin) {
        self[index] = new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].css',
          chunkFilename: 'static/css/[name].[contenthash:4].chunk.css',
          ignoreOrder: true,
        });
      }
    });
  }
  return config;
};
// 生产环境去除console.log
const dropConsole = () => (config) => {
  if (config.mode === 'production') {
    if (config.optimization.minimizer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }
  }
  return config;
};

module.exports = {
  webpack: override(
    // disable eslint in webpack
    disableEsLint(),
    addWebpackAlias({
      '@': path.resolve(__dirname, 'src'),
      typings: path.resolve(__dirname, 'src/typings'),
      utils: path.resolve(__dirname, 'src/utils'),
      components: path.resolve(__dirname, 'src/components'),
      application: path.resolve(__dirname, 'src/application'),
      container: path.resolve(__dirname, 'src/container'),
      static: path.resolve(__dirname, 'src/static'),
      common: path.resolve(__dirname, 'src/common'),
      styles: path.resolve(__dirname, 'src/styles'),
      i18n: path.resolve(__dirname, 'src/i18n'),
      // 处理警告  React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
      'react-dom': '@hot-loader/react-dom',
      // 解决antd 的icon图标打包体积大
      // '@ant-design/icons': 'purched-antd-icons',
    }),
    fixBabelImports('antd', {
      libraryDirectory: 'es',
      style: true,
    }),
    fixBabelImports('lodash', {
      libraryDirectory: '',
      camel2DashComponentName: false,
    }),

    addLessLoader({
      lessOptions: {
        javascriptEnabled: true,
        modifyVars: themes,
      },
    }),
    // removeModuleScopePlugin(),
    // 允许使用.babelrc进行babel配置
    useBabelRc(),
    dropConsole(),
    hotLoader(),
    appBuildOutput(),
    // 添加环境变量
    overrideProcessEnv({
      REGION_ENV: JSON.stringify(program.region),
      IS_MICRO: JSON.stringify(program.isMicro),
      IS_SEPARATE: JSON.stringify(program.isSeparate),
    }),
    // 给html 的模板inject城操作的jssdk
    process.env.NODE_ENV === 'development'
      ? addWebpackPlugin(
          new HtmlWebpackPlugin({
            title: '//10.241.241.58/libs/unified/nav-with-find-css.js',
            template: `${__dirname}/public/index.html`, //create-react-app默认创建的html文件路径，且build写死了必须使用此文件，故直接以它作为模板
          })
        )
      : addWebpackPlugin(
          new HtmlWebpackPlugin({
            title: '/libs/unified/nav-with-find-css.js',
            template: `${__dirname}/public/index.html`, //create-react-app默认创建的html文件路径，且build写死了必须使用此文件，故直接以它作为模板
          })
        ),
    addWebpackPlugin(
      new CompressionWebpackPlugin({
        test: /\.js$|\.css$/,
        threshold: 1024,
      })
    ),
    addWebpackPlugin(
      new LodashWebpackPlugin({
        collections: true,
        paths: true,
      })
    ),
    addWebpackPlugin(new AntdDayjsWebpackPlugin({ preset: 'antdv3' })),
    addWebpackPlugin(
      new WebpackBuildNotifierPlugin({
        title: '',
        suppressSuccess: true,
      })
    ),
    setWebpackOptimizationSplitChunks({
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true, //'commons',
      cacheGroups: {
        commons: {
          // test: /[\\/]node_modules[\\/]/,
          test(module) {
            // any required modules inside node_modules are extracted to vendor
            return (
              module.resource &&
              /\.(ts||js)$/.test(module.resource) &&
              module.resource.indexOf(path.join(__dirname, 'node_modules')) ===
                0
            );
          },
          name: 'commons',
          chunks: 'initial',
          filename: 'static/js/[name].js',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    }),
    // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
    process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer(),
    console.log(process.env.BUNDLE_VISUALIZE == 1),
    // adjust the underlying workbox
    adjustWorkbox((wb) =>
      Object.assign(wb, {
        skipWaiting: true,
        exclude: (wb.exclude || []).concat('index.html'),
      })
    )
  ),
  devServer: overrideDevServer(
    // dev server plugin
    (config) => {
      return {
        ...config,
        disableHostCheck: true,
        proxy: {
          '/api': {
            target: 'http://10.241.241.58/',
            changeOrigin: true,
            pathRewrite: {
              '^/api': '/api',
            },
          },
          '/': {
            target: 'http://dev-iotcore.jd.com/',
            // target: 'http://10.241.242.28:31640/',
            changeOrigin: true,
          },
        },
      };
    }
  ),
};
