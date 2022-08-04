const path = require('path');

module.exports = {
    entry: { app: ['babel-polyfill', './src/app.js'] },
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
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    devtool: 'source-map',
};
