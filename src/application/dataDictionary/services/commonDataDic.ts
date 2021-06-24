import request from 'utils/request';
import { Response } from 'typings/type';
import {
  QueryRequestResponse,
  QueryRequestParams,
  DictionaryInfo,
  RequestResponse,
  FindAllTypeRequestResponse,
  CreateEditDataDicInfo,
} from '../types/index';

// 查询通用字典列表
export const queryComDicList = async (data: QueryRequestParams) => {
  const res = await request<Response<QueryRequestResponse>>({
    url: 'dictionary/list',
    method: 'GET',
    params: data,
  });
  return res && res.data;
};

// 添加通用字典
export const createComDicList = async (data: CreateEditDataDicInfo) => {
  const res = await request<Response<RequestResponse>>({
    url: 'dictionary/add',
    method: 'POST',
    data,
  });
  return res;
};

// 编辑通用字典
export const updateComDicList = async (data: CreateEditDataDicInfo) => {
  const res = await request<Response<RequestResponse>>({
    url: 'dictionary/update',
    method: 'POST',
    data,
  });
  return res;
};

// 删除通用字典
export const delComDicList = async (data: {
  id: number;
  type: string;
  name?: string;
}) => {
  const res = await request<RequestResponse>({
    url: 'dictionary/delete',
    method: 'DELETE',
    params: data,
  });
  return res;
};

// 查询字典类型 t - 时间戳，防止缓存
export const findAllType = async (data: { t: string }) => {
  const res = await request<Response<FindAllTypeRequestResponse>>({
    url: 'dictionary/findAllType',
    method: 'GET',
    params: data,
  });
  return res && res.data;
};
