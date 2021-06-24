import 'react-app-polyfill/ie9'; // 兼容ie9
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import favicon from 'static/favicon.ico';
import * as serviceWorker from './serviceWorker';
import './index.less';

/**切换网站icon */
const switchWebsiteIcon = () => {
  const REGION = process.env.REGION_ENV;
  const link: HTMLLinkElement =
    document.querySelector("link[rel*='icon']") ||
    document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  switch (REGION) {
    case 'jdiot':
    case 'yqcity':
      link.href = favicon;
      break;
    default:
      link.href = 'https://storage.jd.com/industry-webconsole/favicon2.ico';
      break;
  }
};

switchWebsiteIcon();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
