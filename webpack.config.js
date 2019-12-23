const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') // 压缩 css
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin') //自动引入dll文件
const WorkboxPlugin = require('workbox-webpack-plugin')// 引入 PWA 插件 服务器挂了页面有缓存不显示挂了

const configs = {
    devtool: 'source-map', //启用该项报错会定位到源文件，线上不建议启用
    entry: {
        index: './js/index.js',
    },
    output: {
        // publicPath: '/dist/',  //绝对路径，相对域名
        publicPath: './',  //相对路径，相对文件夹
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name].bundle.js'
    },
    // resolve: {
    //     alias: {
    //         jquery: path.join(__dirname, '/static/lib/jquery-3.3.1.min.js')
    //     }
    // },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['/node_modules/'],
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    }, 'css-loader'
                ]
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].min.[ext]',
                            outputPath: 'images/', //输出到 images 文件夹
                            limit: 20000, //把小于 20kb 的文件转成Base64 的格式
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            // 压缩 jpg/jpeg 图片
                            mozjpeg: {
                                progressive: true,
                                quality: 64 //压缩率
                            },
                            // 压缩 png 图片
                            pngquant: {
                                quality: [0.65, 0.90],
                                speed: 4
                            }
                        }
                    }
                ]
            },

        ]
    }
}

const makePlugins = configs => {
    const plugins = [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: '[name].min.css'
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'), //用于优化\最小化 CSS 的 CSS 处理器，默认为 cssnano
            cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, //传递给 cssProcessor 的选项，默认为{}
            canPrint: true //布尔值，指示插件是否可以将消息打印到控制台，默认为 true
        }),
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        })
        // new webpack.ProvidePlugin({
        //     $: 'jquery'
        // }),
        // new BundleAnalyzerPlugin(),        // 依赖可视化工具
    ]

    // 根据entry 自动生成HtmlWebpackPlugin 配置，配置多页面
    Object.keys(configs.entry).forEach(item => {
        plugins.push(
            new HtmlWebpackPlugin({
                hash: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                },
                filename: `/${item}.html`,
                template: `./${item}.html`,
                chunks: [item]
            })
        )
    })

    // 自动引入dll中的文件
    // const files = fs.readdirSync(path.resolve(__dirname, './dll'))
    // files.forEach(file => {
    //     if (/.*\.dll.js/.test(file)) {
    //         plugins.push(
    //             new AddAssetHtmlWebpackPlugin({
    //                 filepath: path.resolve(__dirname, './dll', file)
    //             })
    //         )
    //     }
    // })

    return plugins;
}

makePlugins(configs)
configs.plugins = makePlugins(configs)
module.exports = configs