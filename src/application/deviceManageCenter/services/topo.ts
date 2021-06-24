import request from 'utils/request';

import {
  RequestResponse,
  DeviceTopoParams,
  QuerySimpleDeviceListParams,
  SimpleDeviceItem,
  UnboundDeviceParams,
  DeviceInfo,
} from '../types';

// 获取边缘设备拓扑关系
export const getDeviceTopo = (params: {
  deviceId: string;
  pageNo: number;
  pageSize: number;
}) => {
  return request<RequestResponse>({
    url: 'deviceTopo/get',
    method: 'POST',
    data: params,
  });
};

// 删除边缘设备拓扑关系
export const deleteDeviceTopo = (params: DeviceTopoParams) => {
  return request<RequestResponse>({
    url: 'v2/deviceTopo/delete',
    method: 'POST',
    data: params,
  });
};
// 添加边缘设备拓扑关系
export const addDeviceTopo = (params: DeviceTopoParams) => {
  return request<RequestResponse>({
    url: 'v2/deviceTopo/add',
    method: 'POST',
    data: params,
  });
};

// 下发拓扑
// export const sendDeviceTopo = async (params: {
//   deviceId: string;
//   deviceName?: string;
//   deviceMetaName?: string;
// }) => {
//   const res = await request<RequestResponse>({
//     url: `deviceTopo/send`,
//     method: 'GET',
//     params: params,
//   });
//   return res && res.data;
// };

// 查询设备列表信息
export const getDeviceListSimples = async (
  params: QuerySimpleDeviceListParams
) => {
  const res = await request<{
    code: number;
    data: {
      list: SimpleDeviceItem[];
      pageVO: {
        pageNo: number;
        pageSize: number;
        total: number;
        lastPage: number;
      };
    };
  }>({
    url: 'device/listSimples',
    method: 'POST',
    data: params,
  });
  return res;
};

// 查询设备列表信息
export const updateDeviceTopo = async (params: DeviceTopoParams) => {
  console.log(params);
  const res = await request<RequestResponse>({
    url: 'v2/deviceTopo/update',
    method: 'POST',
    data: params,
  });
  return res;
};

// 查询未绑定拓扑关系的设备
export const queryUnboundDevices = (params: UnboundDeviceParams) => {
  return request<{ data: { data: DeviceInfo[] } }>({
    url: '/v2/device/listUnboundDevices',
    method: 'POST',
    data: params,
  });
};
