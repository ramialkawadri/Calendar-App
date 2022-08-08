const path = require('path');

module.exports = {
    entry: { index: ['babel-polyfill', './frontend/index.js'] },
    output: {
        path: path.resolve(__dirname, 'public/scripts'),
        publicPath: '/public/scripts/',
        filename: '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    devtool: 'source-map',
};
