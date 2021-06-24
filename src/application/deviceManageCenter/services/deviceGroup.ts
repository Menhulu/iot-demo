import request from 'utils/request';

import {
  RequestResponse,
  DeviceGroupListParam,
  DeviceGroupInfo,
  UpdateDeviceListParam,
  AddDeviceGroupInfo,
  SelectDevicesParam,
  CheckDeleteDevicesParam,
} from '../types';

// 获取设备分组列表
export const getGroupList = () => {
  return request<RequestResponse>({
    url: 'deviceGroup/list',
    method: 'GET',
    params: {},
  });
};

// 查询分组内设备列表
export const queryDevices = (param: DeviceGroupListParam) => {
  return request<RequestResponse>({
    url: 'v2/deviceGroup/queryDevices',
    method: 'GET',
    params: param,
  });
};

// /deviceGroup/query 查询分组详情
export const queryGroupInfo = async (param: { groupId: number }) => {
  return request<RequestResponse>({
    url: 'deviceGroup/query',
    method: 'GET',
    params: param,
  });
};
// deviceGroup/getDeviceOnlineNums 分组内在线设备总数;
export const getDeviceOnlineNums = (param: { groupId: number }) => {
  return request<RequestResponse>({
    url: 'deviceGroup/getDeviceOnlineNums',
    method: 'GET',
    params: param,
  });
};
// deviceGroup/getDeviceNums 分组内设备总数;
export const getDeviceNums = (param: { groupId: number }) => {
  return request<RequestResponse>({
    url: 'deviceGroup/getDeviceNums',
    method: 'GET',
    params: param,
  });
};
// /deviceGroup/update 编辑设备分组
export const updateGroupInfo = async (param: DeviceGroupInfo) => {
  return request<RequestResponse>({
    url: 'deviceGroup/update',
    method: 'POST',
    data: param,
  });
};

// /deviceGroup/del 删除设备分组;
export const delGroup = (param: {
  groupId: number;
  deviceGroupName: string;
}) => {
  return request<RequestResponse>({
    url: 'deviceGroup/del',
    method: 'GET',
    params: param,
  });
};

// /deviceGroup/add 添加设备分组
export const addGroup = (param: AddDeviceGroupInfo) => {
  return request<RequestResponse>({
    url: 'deviceGroup/add',
    method: 'POST',
    data: param,
  });
};
//  分组关联设备信息;
export const updateDeviceList = (param: UpdateDeviceListParam) => {
  return request<RequestResponse>({
    url: 'v2/deviceGroup/addDevices',
    method: 'POST',
    data: param,
  });
};

// deviceGroup/selectDevices 筛选分组设备,子分组只能从父分组设备中筛选
export const selectDevices = async (param: SelectDevicesParam) => {
  const res = await request<RequestResponse>({
    url: 'v2/deviceGroup/selectDevices',
    method: 'POST',
    data: param,
  });
  return res && res.data;
};

// 获取分组设备在子分组中存在的设备的数量
export const checkDeleteDevices = async (param: CheckDeleteDevicesParam) => {
  const res = await request<RequestResponse>({
    url: 'deviceGroup/checkDevicesNums',
    method: 'POST',
    data: param,
  });
  return res; // 返回设备数量 number
};

// 批量删除分组设备
export const delGroupDevice = async (param: CheckDeleteDevicesParam) => {
  const res = await request<RequestResponse>({
    url: 'deviceGroup/delGroupDevice',
    method: 'POST',
    data: param,
  });
  return res;
};
