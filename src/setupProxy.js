const {
    createProxyMiddleware
} = require('http-proxy-middleware');

const iotCoreInterfaceName = ['/dataanalysis',
    '/v1',
    '/audit',
    '/auth',
    '/signRight',
    '/batch',
    '/deviceGroup',
    '/v2',
    '/device',
    '/event',
    '/function',
    '/property',
    '/area',
    '/deviceProfileConfig',
    '/dictionary',
    '/message',
    '/meta',
    '/thingtype',
    '/rule',
    '/shadow',
    '/modelevent',
    '/modelfunc',
    '/model',
    '/modelprop',
    '/thingmodel',
    '/deviceTopo',
    '/jdcloud/user',
    '/role',
    '/user',
]
// 配置对象存储地址
const OSSURL = 'https://s3.cn-north-1.jdcloud-oss.com'
module.exports = function (app) {
    app.use(
        iotCoreInterfaceName,
        createProxyMiddleware({
            target: 'http://jichang.iot.com/',
            changeOrigin: true,
        }),
    );
    app.use(
        ['/iotcore-dev'],
        createProxyMiddleware({
            target: OSSURL,
            changeOrigin: true,
        }),
    );
};