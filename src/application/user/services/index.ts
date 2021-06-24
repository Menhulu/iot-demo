import request from 'utils/request';
import { REGION } from 'utils/constants';
import { LoginOutResponse } from '../types/index';
import { RequestResponse, AuthItem } from 'typings/type';

// 登录接口
export const loginService = async (params: {
  passWd: string;
  userName: string;
}) => {
  // const formData = new FormData();
  // formData.append('thingModelContent', params.thingModelContent);
  const res = await request<RequestResponse>({
    url: 'auth/login',
    method: 'POST',
    data: params,
  });
  return res;
};

// 定义权限接口
export const getAuth = async () => {
  const res = await request<{ code: number; data: AuthItem[] }>({
    url: 'signRight/listResourceAuth',
    method: 'POST',
  });
  return res;
};

// 定义退出登录的接口
export const logout = async () => {
  const url =
    REGION === 'jdcloud' ? 'auth/jdcloudPassport/loginOut' : 'auth/loginOut';
  const method = REGION === 'jdcloud' ? 'GET' : 'POST';

  const res = await request<LoginOutResponse>({
    url,
    method,
  });
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res;
};
// 定义获取用户名的api
export const getUserName = async () => {
  const res = await request<{ code: number; data: any }>({
    url: 'user/queryUserName',
    method: 'GET',
    params: {},
  });
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};

/** 乐清接口 */
// 乐清获取登录态及用户名
export const getLoginState = () => {
  return request<{
    data: {
      login: boolean;
      pin: string;
      nickName: string;
    };
  }>({
    url: 'auth/jdpassport/loginstate',
    method: 'GET',
  });
};

// 定义退出登录的接口
export const yqLogout = () => {
  return request<LoginOutResponse>({
    url: 'auth/jdpassport/loginOut',
    method: 'GET',
  });
};
