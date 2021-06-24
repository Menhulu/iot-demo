import request from 'utils/request';

import {
  QueryFirmwareParams,
  QueryFirmwareInfoParam,
  FirmwareData,
  FirmwareInfoResponse,
  DelFirmwareParam,
  DelFirmwareResponse,
  QueryFirmwareInfoResponse,
} from '../types';

// 查询固件列表
export const getFirmwareList = async (params: QueryFirmwareParams) => {
  const res = await request<FirmwareInfoResponse>({
    url: 'v1/ota/list',
    method: 'POST',
    data: params,
  });
  return res;
};

// 删除固件版本
export const delFirmware = async (params: DelFirmwareParam) => {
  let res;
  try {
    res = await request<DelFirmwareResponse>({
      url: 'v1/ota/delete',
      method: 'DELETE',
      params: params,
    });
  } catch (error) {
    console.log(error);
  }
  return res && res.data;
};
// 查询支持的固件签名  v1/ota/getSupportSignatureAlgorithm
export const getSupportSignatureAlgorithm = () => {
  return request<{ data: { code: string; name: string }[] }>({
    url: 'v1/ota/getSupportSignatureAlgorithm',
    method: 'GET',
  });
};
// 查询固件信息
export const getFirmwareInfo = async (params: QueryFirmwareInfoParam) => {
  const res = await request<QueryFirmwareInfoResponse>({
    url: 'v1/ota/get',
    method: 'GET',
    params: params,
  });

  return res;
};

// 创建&编辑固件包
export const editFirmwareInfo = async (
  url: string,
  params: Partial<FirmwareData>
) => {
  const res = await request<{ data: number; msg: string }>({
    url,
    method: 'POST',
    data: params,
  });
  return res;
};

// 根据物类型编码生成固件id
export const generateVersion = async (params: { thingTypeCode: string }) => {
  const res = await request<{ data: number; msg: string }>({
    url: `v1/ota/generateVersion`,
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 发布版本
export const publishedFirmwareVersion = async (params: {
  deviceMetaId: string;
  deviceMetaName: string;
  version: number;
  versionNo: string;
}) => {
  const res = await request<{
    code: number | string;
    data: boolean;
    message: string;
    success: boolean;
  }>({
    url: 'v1/ota/publish',
    method: 'PUT',
    data: params,
  });

  return res && res.data;
};
