var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config');

var compiler = Webpack(webpackConfig);
var server = new WebpackDevServer(compiler, {
	hot: true,
    stats: {
        colors: true
    },
    headers: { 'access-control-allow-origin': '*' },
});

server.listen(8081, '127.0.0.1', function() {
    console.log('Starting server on http://localhost:8081');
});
