import { isInteger } from 'lodash';

//  固件任务列表项数据
export interface JobQuery {
  thingTypeCode: string;
  firmwareId?: string; // 固件ID
  status?: number;
}
// 查询列表参数
export interface QueryJobParams {
  condition: JobQuery;
  pageNo: number;
  pageSize: number;
  order: string;
}

// 固件任务列表项
export interface JobInfo {
  firmwareId: string; // 固件ID
  jobId: string; // 任务Id
  status: number; // 任务状态 1： 已下发 2： 已取消
  thingTypeCode: string; // 所属物类型
  updateTime: string; // 最后一次更新时间
  customized: string;
  scope: string;
  upgradeSuccessCount?: number;
  upgradeFailCount?: number;
  upgradingCount?: number;
  [propName: string]: any; // 灰度方式字段不确定
}
// 查询固件任务列表返回数据格式
export interface JobListResponse {
  msg: string;
  data: {
    list: JobInfo[];
    pageVO: {
      order: string;
      pageNo: number;
      pageSize: number;
      total: number;
      lastPage: number;
    };
  };
}

export interface JobProgressDetailInfo {
  deviceId: string;
  jobId: string;
  status: string;
  srcVersion: string;
  destVersion: string;
  otaState: string;
  otaProgress: string;
  errorCode: string;
}
export interface JobProgressDetailRes {
  msg: string;
  data: {
    list: JobProgressDetailInfo[];
    pageVO: {
      order: string;
      pageNo: number;
      pageSize: number;
      total: number;
      lastPage: number;
    };
  };
}

export interface QueryJobProgress {
  jobId: string;
  pageNo: number;
  pageSize: number;
}
