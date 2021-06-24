import request from 'utils/request';
import { Response, RequestResponse } from 'typings/type';

// 获取统计看板数据列表
export const getCityToken = async () => {
  const res = await request<Response<RequestResponse>>({
    url: 'cityos/currentToken',
    method: 'GET',
    params: {},
  });
  return res && res.data;
};
