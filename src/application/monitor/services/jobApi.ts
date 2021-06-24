import request from 'utils/request';

import {
  FirmwareData,
  QueryJobParams,
  JobListResponse,
  DeviceGroupInfo,
  JobInfo,
  JobProgressDetailRes,
} from '../types';
// 查询固件任务列表
export const getJobList = (params: QueryJobParams) => {
  return request<JobListResponse>({
    url: '/v1/ota/job/list',
    method: 'POST',
    data: params,
  });
};

// 启动任务
export const startJob = (params: { jobId: string }) => {
  return request<{ data: boolean }>({
    url: '/v1/ota/job/cmd/start',
    method: 'GET',
    params: params,
  });
};
// 暂停任务
export const stopJob = (params: { jobId: string }) => {
  return request<{ data: boolean }>({
    url: '/v1/ota/job/cmd/stop',
    method: 'GET',
    params: params,
  });
};
// 取消任务
export const cancelJob = (params: { jobId: string }) => {
  return request<{ data: boolean }>({
    url: '/v1/ota/job/cmd/cancel',
    method: 'GET',
    params: params,
  });
};
// 删除任务
export const deleteJob = (params: { jobId: string }) => {
  return request<{ data: boolean }>({
    url: '/v1/ota/job/delete',
    method: 'DELETE',
    params: params,
  });
};

// 根据物类型查询固件ID
export const queryFirmwareListByThingTypeCode = (params: any) => {
  return request<{ data: FirmwareData[] }>({
    url: '/v1/ota/listAll',
    method: 'GET',
    params: params,
  });
};

// 获取设备分组列表
export const getGroupList = async () => {
  const res = await request<{
    code: string | number;
    data: DeviceGroupInfo[];
    message: string;
  }>({
    url: 'deviceGroup/list',
    method: 'GET',
    params: {},
  });
  return res && res.data;
};

// 查询固件任务列表
export const editJobInfo = (url: string, params: JobInfo) => {
  return request<any>({
    url,
    method: 'POST',
    data: params,
  });
};

// 获取任务详情

export const getJobDetail = (params: { jobId: string }) => {
  return request<{ data: JobInfo }>({
    url: '/v1/ota/job/get',
    method: 'GET',
    params: params,
  });
};

// 获取任务进度详情

export const getJobProcess = (params: { jobId: string }) => {
  return request<JobProgressDetailRes>({
    url: '/v1/ota/jobdetail/list',
    method: 'POST',
    data: params,
  });
};
