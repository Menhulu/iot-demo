export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  lastPage: number;
}
//  固件升级列表项数据
export interface FirmwareQuery {
  thingTypeCode: string;
  versionNo?: string; // 版本号
}
// 查询列表参数
export interface QueryFirmwareParams {
  condition: FirmwareQuery;
  pageNo: number;
  pageSize: number;
  order: string;
}
// 查询固件升级返回数据格式
export interface FirmwareListResponse {
  msg: string;
  data: {
    list: FirmwareData[];
    pageNo: number;
    pageSize: number;
    totalCount: number;
  };
}

// 获取固件升级版本基础信息参数
export interface QueryFirmwareInfoParam {
  firmwareId: string;
}
// 获取固件升级版本基础信息返回
export interface QueryFirmwareInfoResponse {
  data: FirmwareData;
  code: number | string;
  msg: string;
}
// 固件升级版本基础信息
export interface FirmwareData {
  thingTypeCode: string;
  thingTypeName: string;
  firmwareId?: string;
  changeLog?: string; // 变更日志
  srcVersion: string; // 升级前版本号
  destVersion: string; // 升级后版本号
  versionNo: string; // 人工录入的版本编号
  packageType: number; // 升级包类型：1、全量升级；2、拆分升级
  signature?: string; // 固件签名
  algorithm?: string; // 签名算法
  packageSize?: number;
  packageUrl: string;
  packageName: string;
  createdTime?: number;
  createdUserId?: string;
  token?: string; // 下载固件需要的token信息
  [propName: string]: any; // 灰度方式字段不确定
}
// 获取固件升级版本基础信息返回
export interface FirmwareInfoResponse {
  msg: string;
  data: {
    list: FirmwareData[];
    pageVO: {
      pageNo: number;
      pageSize: number;
      total: number;
      order: string;
      lastPage: number;
    };
  };
}

// 删除固件Id参数
export interface DelFirmwareParam {
  firmwareId: string;
}

// 删除固件Id返回值
export interface DelFirmwareResponse {
  data: boolean;
  msg: string;
}

// 设备分组字段
export interface DeviceGroupInfo {
  id: string;
  level: number;
  parentId: number;
  groupName: string;
}
