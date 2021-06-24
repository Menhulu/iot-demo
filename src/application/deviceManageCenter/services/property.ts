import request from 'utils/request';

import { RequestResponse } from '../types';
import {
  UpdateShadowInfoParams,
  GetSnapshotParams,
  PropertyDataRes,
} from '../types/property';
// 获取设备影子信息
export const getShadowQuery = (params: { deviceId: string }) => {
  return request<RequestResponse>({
    url: `property/query`,
    method: 'GET',
    params: params,
  });
};

// 批量更新设备影子信息
export const updateShadowInfo = async (params: UpdateShadowInfoParams) => {
  let res;
  try {
    res = await request<RequestResponse>({
      url: `property/desired`,
      method: 'POST',
      data: params,
    });
  } catch (data) {
    console.log('业务error', data);
    // Toast(data.message);
  }
  return res;
};

// 批量召测
export const getSnapshot = (params: GetSnapshotParams) => {
  return request<RequestResponse>({
    url: `property/getSnapshot`,
    method: 'POST',
    data: params,
  });
};
// 获取属性值
export const getProperty = async (params: { deviceId: string }) => {
  const res = await request<{ data: PropertyDataRes }>({
    url: 'property/acquire',
    method: 'GET',
    params: params,
  });

  return res;
};
// /property/removeDesiredProperty
export const clearDesiredProperty = (params: {
  deviceId: string;
  keys: string[];
}) =>
  request<{ data: boolean; message: string; success: boolean }>({
    url: 'property/removeDesiredProperty',
    method: 'POST',
    data: params,
  });
