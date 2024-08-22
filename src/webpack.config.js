const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack'); 
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './WebExtension/ComfyUX.js', // 设置入口文件
  output: {
    filename: 'ComfyUX.js', // 输出文件名
    path: path.resolve(__dirname, 'ComfyUX-release/WebExtension'), // 输出路径
    library: {
      type: 'module'
    }
  },
  experiments: {
      outputModule: true
  },
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,  // 处理 JS 文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,  // 处理 CSS 文件
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,  // 处理图片文件
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'images'
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: true, // 启用最小化
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: true, // 删除注释
          beautify: true // 保持格式化
        },
        compress: {
          drop_console: false // 删除 console 语句
        }
      },
      extractComments: false, // 不提取注释到单独的文件
    })],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'PyComfyNode', to: path.resolve(__dirname, 'ComfyUX-release/PyComfyNode') }, // 复制整个文件夹
        { from: 'WebExtension/component/img', to: path.resolve(__dirname, 'ComfyUX-release/WebExtension/component/img') }, // 复制整个文件夹
        { from: 'WebExtension/component/css', to: path.resolve(__dirname, 'ComfyUX-release/WebExtension/component/css') }, // 复制整个文件夹
        // { from: 'WebExtension/ComfyUIConnector.js', to: path.resolve(__dirname, 'ComfyUX-release/WebExtension/ComfyUIConnector.js') }, // 复制单个文件
        { from: 'WebExtension/version.json', to: path.resolve(__dirname, 'ComfyUX-release/WebExtension/version.json') }, // 复制单个文件
        { from: '__init__.py', to: path.resolve(__dirname, 'ComfyUX-release/__init__.py') }, // 复制单个文件
        { from: 'pyproject.toml', to: path.resolve(__dirname, 'ComfyUX-release/pyproject.toml') } // 复制单个文件
      ]
    })
  ],
  
  //external all files in ComfyUI folder
  externals: {
    '../../scripts/app.js': '../../scripts/app.js',
    '../../scripts/api.js': '../../scripts/api.js',
    '../../scripts/ui.js': '../../scripts/ui.js'
  }
};
