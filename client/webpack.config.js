var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var enableMinification = arguments['p'];

module.exports = function (environment) {
    return {
        context: path.resolve(__dirname, '.'),
        entry: {
            'client': [
                'es6-shim',
                './src/index'
            ]
        },
        externals: [
            (context, request, callback) => {
                if (/^.*fonts.*$/.test(request)) {
                    return callback(null, 'commonjs ' + request);
                }

                callback();
            }
        ],
        module: {
            rules: [
                { test: /\.css?$/, use: ExtractTextPlugin.extract({ use: 'css-loader' }) },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: 'url-loader'
                }
            ]
        },
        output: {
            filename: '[name].packed.js',
            library: 'ef.lms365.[name]',
            libraryTarget: 'this',
            path: path.resolve(__dirname, '../server.web/dist/')
        },
        plugins: [
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': 'window.process.env.NODE_ENV' }),
            new webpack.ExtendedAPIPlugin(),
            new webpack.LoaderOptionsPlugin({
                options: {
                    context: __dirname,
                    postcss: [autoprefixer({ browsers: ['last 2 versions'] })]
                }
            }),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                minChunks: (x) => /node_modules/.test(x.context),
                name: 'client-vendors'
            }),
            new ExtractTextPlugin({ filename: './[name].packed.css' }),
            new StatsPlugin('stats.json', {
                chunkModules: true
            }),
            new UglifyJsPlugin(),
            new ForkTsCheckerWebpackPlugin({ tsconfig: './tsconfig.json' })
        ],
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
            modules: ['./node_modules']
        }
    };
};