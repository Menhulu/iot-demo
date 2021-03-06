import { notification } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import Toast from 'components/SimpleToast/index';
import qs from 'qs';
import { BusinessCode, Response } from 'typings/type';
import { getCityOsToken, IMPORTCITYOS, REGION } from 'utils/constants';
import { getCookie } from 'utils/tools';

// HTTP code码
const codeMessage: { [key: string]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '无数据',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户没有访问权限',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '方法不被允许',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

//  得到请求后端接口的前缀
const getBaseUrl = () => {
  if (IMPORTCITYOS && process.env.NODE_ENV !== 'development') {
    return '/jdiot';
  }
  return '/';
};

const instance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 超时时间  下发拓扑时间大概40s 暂时改成1min
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { indices: false }) + `&v=${Date.now()}`, // param=value1&param=value2
});

// 增加请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = getCookie('csrfToken');
    instance.defaults.headers['x-csrf-token'] = token;
    // 城操作的时候走jwt
    if (IMPORTCITYOS) {
      config.headers['Authorization'] = getCityOsToken();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 增加响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 存在业务异常 统一toast
    if (data.code != BusinessCode.SUCCESS) {
      if (data.code != BusinessCode.NO_DATA) {
        const message = data.msg || data.message || '';
        Toast(message);
      }
    }
    // 返回数据
    return data;
  },
  (error) => {
    if (error && error.response) {
      console.log(error, error.response);

      const { status } = error.response;
      console.warn(
        `http error: status-${status} message-${codeMessage[status]}`
      );
      if (status === 401) {
        // 重定向
        const jp = document.querySelector('meta[name="jp"]');
        const passportProtocol = jp
          ? jp.getAttribute('content')
          : '//passport.jd.com';

        const loginPath =
          REGION === 'jdcloud'
            ? `https://login.jdcloud.com/?returnUrl=${window.location.href}`
            : `${passportProtocol}/uc/login?ltype=login&ReturnUrl=//${window.location.hostname}`;
        window.location.href = loginPath;
      }
      if (
        status === 403 &&
        error.response.config.url.includes('signRight/listResourceAuth')
      ) {
        let redirectTo = '/user/login';
        let isIscLogin = false; // 是否使用统一权限管理登录
        const iscLoginMeta = document.querySelector('meta[name="login_isc"]'); // 是否使用统一权限管理登录
        if (!!iscLoginMeta && !!iscLoginMeta.getAttribute('content')) {
          isIscLogin = iscLoginMeta.getAttribute('content') === 'true';
        }
        redirectTo = isIscLogin ? '/login' : '/user/login';
        Toast('抱歉您没有访问权限,请登录');
        setTimeout(() => {
          window.location.href = `${window.location.origin}/#${redirectTo}`;
        }, 200);
        return;
      }

      if (codeMessage[status] !== null || undefined) {
        notification.warning({
          placement: 'topRight',
          duration: 3,
          message: '提示',
          description: `接口：${error.response.data.path}，${error.response.data.message}`,
        });
      } else {
        notification.warning({
          placement: 'topRight',
          duration: 3,
          message: '提示',
          description: error,
        });
      }
    }
    return Promise.reject(error); // 非业务异常无需抛出错误 内部吞掉
  }
);

function request<T>(config: AxiosRequestConfig): Promise<Response<T>> {
  return instance.request<Response<T>>(config) as any as Promise<Response<T>>;
}

export default request;
