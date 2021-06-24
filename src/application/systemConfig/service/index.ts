/*
 * @Author: shaoym
 * @Date: 2021-03-09 11:00:09
 * @LastEditTime: 2021-03-10 18:50:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 */
import request from 'utils/request';
import { Response } from 'typings/type';

import { QueryOSSParam, OSS } from '../types';
// 获取OSS列表
export const getOSSList = (params: QueryOSSParam) =>
  request<{ data: { list: OSS[] } }>({
    url: '/v1/oss/findByPage',
    method: 'POST',
    data: params,
  });

// 查询详情
export const findById = async (params: Object) => {
  const res = await request<Response<any>>({
    url: '/v1/oss/findById',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 删除OSS
export const deleteOss = async (params: Object) => {
  const res = await request<Response<any>>({
    url: '/v1/oss/delete',
    method: 'DELETE',
    params: params,
  });
  return res;
};

// 添加OSS
export const saveOss = async (params: OSS) => {
  return request<Response<any>>({
    url: '/v1/oss/save',
    method: 'POST',
    data: params,
  });
};

// 编辑OSS
export const modifyOss = async (params: OSS) => {
  return request<Response<any>>({
    url: '/v1/oss/modify',
    method: 'POST',
    data: params,
  });
};

// 测试OSS
export const testOss = async (params: OSS) => {
  return request<Response<any>>({
    url: '/v1/oss/test',
    method: 'POST',
    data: params,
  });
};
