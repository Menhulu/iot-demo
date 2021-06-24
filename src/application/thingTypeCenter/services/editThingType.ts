/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-10 18:27:15
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-05 16:30:14
 */
import request from 'utils/request';

import {
  ThingTypeItem,
  QueryMetaResponse,
  OwnerSourcesResponse,
  ConfigProfile,
} from '../types';

// 创建物类型
export const addThingType = (params: any) => {
  return request<{ data: string }>({
    url: 'v2/thingtype/add',
    method: 'POST',
    data: params,
  });
};

// 编辑物类型
export const editThingType = (params: ThingTypeItem) => {
  return request<{ data: boolean; message: string }>({
    url: 'v2/thingtype/update',
    method: 'POST',
    data: params,
  });
};
// 查询单条物类型信息
export const queryThingType = (params: { code: string }) => {
  return request<QueryMetaResponse>({
    url: 'v2/thingtype/query',
    method: 'GET',
    params: params,
  });
};
// 拉取设备所属渠道信息
export const getOwnerSources = async () => {
  const res = await request<OwnerSourcesResponse>({
    url: 'thingtype/getOwnerSources',
    method: 'POST',
    data: {},
  });
  return res && res.data;
};

// 拉取全局物类型档案
export const getGlobalProfiles = async (param: { scope: number }) => {
  const res = await request<{ code: number | string; data: ConfigProfile[] }>({
    url: 'v2/thingtype/findGlobalProfiles',
    method: 'GET',
    params: param,
  });
  return res && res.data;
};

export const getConnectWay = (params: { nodeType: number }) => {
  return request<{ data: '' }>({});
};
