import axios, { AxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import { Response } from 'typings/type';
import { BusinessCode } from 'typings/type';
import Toast from 'components/SimpleToast/index';

// HTTP code码
const codeMessage: { [key: string]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '无数据',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// 业务状态码
const businessErrMsg: { [key: number]: string } = {
  200: '成功',
  201: '无数据',
  202: '数据已存在',
  301: '参数错误',
  302: '服务器异常',
  303: '文件类型错误',
  400: '当前设备已挂在终端设备,无法删除!',
  401: '无权限',
  3001: '请求异常',
  3002: '相应异常',
  4001: '物模型类型错误',
  4002: '模板ID已经存在',
  4003: '物类型编码已存在',
  4004: '物模型ID已存在',
};

/**
 * 统一处理URL 添加前缀等统一操作
 * @param {*} url 原URL
 * 可以考虑把固定部分抽离成配置文件，根据需求来
 */
const trimURL = (url: string | undefined) => {
  if (process.env.NODE_ENV === 'development') {
    // 如果在开发环境的时候可以用于本地联调
    const baseUrl = `http://localhost:3101/proxy`;
    // const baseUrl = `http://localhost:3000/mock`;
    return `${baseUrl}/${url}`;
  }
  return `/${url}`;
};

const instance = axios.create({
  timeout: 3000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 增加请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 增加响应拦截器
instance.interceptors.response.use(
  (response) => {
    // const { data } = response;
    // // 存在业务异常 抛出给业务代码去捕获
    // if (data.code !== BusinessCode.SUCCESS) {
    //   if (data.code !== BusinessCode.NO_DATA) {
    //     Toast(`${data.code}: ${businessErrMsg[data.code]}`);
    //   }
    //   return Promise.reject(data);
    // }
    // // 不存在业务异常返回数据
    return response;
  },
  (error) => {
    console.log('wowereoor');
    if (error && error.response && error.response.status) {
      // return Promise.reject(error); 非业务异常无需抛出错误 内部吞掉
      const { status } = error.response;
      console.warn(
        `http error: status-${status} message-${codeMessage[status]}`
      );
      if (codeMessage[status] !== null || undefined) {
        notification.warning({
          placement: 'topRight',
          duration: 3,
          message: '提示',
          description: codeMessage[status],
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
    return null;
  }
);

// const addTimestamp = (config: AxiosRequestConfig) => {
//   let { params } = config;
//   if (Object.prototype.toString.call(params) === '[object Object]') {
//     params['_'] = Date.now();
//   } else {
//     params = { _: Date.now() };
//   }
//   config.params = params;
//   return config;
// };

function requestDown<T>(
  config: AxiosRequestConfig
): Promise<Response<T>> | null {
  // 如果是get请求的时候
  let newUrl = config.url;
  if ((config.method === 'GET' || config.method === 'DELETE') && config.data) {
    const param: string[] = [];
    Object.keys(config.data).map((v: string, k: number) => {
      param.push(`${v}=${config.data[v]}`);
    });
    const paramStr = param.join('&');
    newUrl = `${newUrl}?${paramStr}`;
  }

  const curConfig = { ...config, url: trimURL(newUrl) };
  console.log(instance.request, '我是--');

  return (instance.request<Response<T>>(curConfig) as any) as Promise<
    Response<T>
  >;
}

export default requestDown;
