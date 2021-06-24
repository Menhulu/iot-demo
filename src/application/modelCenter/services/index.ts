/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-10 20:56:52
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-15 16:49:44
 */
import request from 'utils/request';

import {
  RequestResponse,
  QueryModelInfoRes,
  ModelListQueryParam,
  DelModelParam,
  CreateModelParams,
} from '../types';
// 查询模型列表
export const getModelList = async (params: ModelListQueryParam) => {
  const res = await request<RequestResponse>({
    url: 'model/listModel',
    method: 'GET',
    params: params,
  });
  return res;
};
// 删除模型
export const delModel = async (params: DelModelParam) => {
  const res = await request<RequestResponse>({
    url: 'model/delModel',
    method: 'DELETE',
    params: params,
  });
  return res && res.data;
};
// 创建标准物模型
export const createModel = async (params: CreateModelParams) => {
  const res = await request<RequestResponse>({
    url: 'model/createModel',
    method: 'POST',
    data: params,
  });

  return res && res.data;
};
// 编辑标准模型基本信息
export const editModel = async (params: CreateModelParams) => {
  const res = await request<RequestResponse>({
    url: 'model/editModel',
    method: 'POST',
    data: params,
  });

  return res;
};

// 查询物模型信息
export const queryModelInfo = async (params: {
  modelName: string;
  specName: string;
}) => {
  const res = await request<QueryModelInfoRes>({
    url: 'model/queryModelDetail',
    method: 'GET',
    params: params,
  });
  return res;
};

// 检查物模型数据格式
export const checkModelContent = async (params: any) => {
  // const formData = new FormData();
  // formData.append('thingModelContent', params.thingModelContent);
  const res = await request<RequestResponse>({
    url: 'model/checkModelContent',
    method: 'POST',
    data: params,
  });
  return res;
};
