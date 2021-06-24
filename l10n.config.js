// default config
module.exports = {
  middlewares: {
    summary: ['summary?sourcePattern=src/i18n/i18n-messages/**/*.json'],
    process: [
      'fetchLocal?source=locales,skip',
      'metaToResult?from=defaultMessage,to=zh',
      // 'youdao?apiname=iamatestmanx,apikey=2137553564',
      'google?from=zh-cn,to=en,tld=cn',
      'reduce?-autoPick,autoReduce[]=local,autoReduce[]=meta',
    ],
    emit: ['save?dest=src/i18n/trans'],
  },
};
