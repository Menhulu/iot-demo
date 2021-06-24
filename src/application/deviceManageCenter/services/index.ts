import { Response } from 'typings/type';
import request from 'utils/request';
import {
  DeviceInfo,
  DeviceInfoParam,
  PaginationParam,
  QueryDeviceListParams,
  RequestResponse,
} from '../types';

export interface VersionItem {
  content?: string;
  description?: string;
  thingModelVersion: string;
  changeLog?: string;
  createdTime?: number;
  createdUserId?: string;
  latest?: number;
  id: string;
  'display-name': string;
  publishedLatest?: number;
  publishedStatus?: number;
  publishedTime?: string;
  publishedUserId?: string;
  updateTime?: number;
  updateUserId?: string;
  [propName: string]: any;
}
// 历史版本数据
export type VersionHistoryResponse = {
  data: VersionItem[];
  msg: string;
};

// 查询设备列表信息
export const getDeviceListRequest = (params: QueryDeviceListParams) => {
  return request<RequestResponse>({
    url: 'v2/device/list',
    method: 'POST',
    data: params,
  });
};

// 根据物类型编码获取档案信息
export const getProfilesByDeviceMetaId = async (params: {
  thingTypeCode: string;
}) => {
  const res = await request<RequestResponse>({
    url: 'meta/getProfilesByDeviceMetaId',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 查询全局设备档案配置和物类型设备档案配置接口
export const loadProfile = async (params: { thingTypeCode?: string }) => {
  const res = await request<RequestResponse>({
    url: 'v2/profileConfig/findGlobalProfiles',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 设备注册接口
export const deviceRegisterRequest = async (params: DeviceInfoParam) => {
  const res = await request<RequestResponse>({
    url: 'v2/device/register',
    method: 'POST',
    data: params,
  });
  return res;
};

// 设备编辑接口
export const deviceEditRequest = async (params: DeviceInfoParam) => {
  const res = await request<RequestResponse>({
    url: 'v2/device/edit',
    method: 'POST',
    data: params,
  });
  return res;
};

// 设备删除接口
export const deviceDelRequest = async (params: DeviceInfoParam) => {
  const res = await request<RequestResponse>({
    url: 'v2/device/delete',
    method: 'DELETE',
    params: params,
  });
  return res;
};

// 查询物类型接口
export const getThingTypeListRequest = async () => {
  const res = await request<RequestResponse>({
    url: 'v2/thingtype/listAll',
    method: 'GET',
    params: {},
  });
  return res && res.data;
};

// 查询物模型列表信息
export const getThingmodelListRequest = async (params: PaginationParam) => {
  const res = await request<Response<any>>({
    url: 'model/list',
    method: 'GET',
  });
  return res && res.data;
};
// 查询设备详情
export const queryDeviceInfo = async (params: { deviceId: string }) => {
  const res = await request<
    Response<{ data: DeviceInfo; message: string; success: boolean }>
  >({
    url: 'v2/device/query',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

export { getDeviceListSimples } from './topo';

// 查询全国所有省/自治区信息
export const getProvince = async () => {
  const res = await request<Response<any>>({
    url: 'area/allProvince',
    method: 'GET',
  });
  return res && res.data;
};

// 根据省名称查询某个省的所有市信息
export const getCityByProvinceName = async (params: {
  provinceName: string;
}) => {
  const res = await request<Response<any>>({
    url: 'area/city',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 根据市名称查询某个市的所有县/区信息
export const getDistrictByCityName = async (params: { cityName: string }) => {
  const res = await request<Response<any>>({
    url: 'area/district',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// deviceProfileConfig/queryProfileDict 分页查询档案字典编码
export const queryProfileDict = async (
  params: PaginationParam & { type: string }
) => {
  const res = await request<Response<any>>({
    url: 'deviceProfileConfig/queryProfileDict',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 根据模板id 是否包含发布版本记录说明;排序方式;升序-ASC,降序-DESC。默认降序 查询版本记录
export const queryHistoryVersion = (params: {
  thingTypeId: string;
  publishedStatus: number;
  changeLogReturned?: boolean;
  order?: string;
}) => {
  return request<VersionHistoryResponse>({
    url: 'v2/thingmodel/listAllVersions',
    method: 'GET',
    params: params,
  });
};
