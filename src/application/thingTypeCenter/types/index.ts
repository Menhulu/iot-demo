/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-10 17:11:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-05 17:19:34
 * @LastEditors  : zhaohongyun2
 * @LastEditTime : 2019-12-20 10:10:38
 */

import { ThingModelInfo, VersionItem, ThingModelContent } from './thingModel';
// 自定义档案格式
export interface ConfigProfile {
  scope?: number; // 1-全局设备，2-全局物类型，3-物类型设备
  deviceMetaId?: string; // 档案作用域为3=物类型设备物类型类型类型id
  profileDesc?: string; // 档案描述
  profileName: string; // 档案名称
  profileValue: string; // 档案值
  profileCode?: string; // 档案编号
  dataTypes?: number; // 档案数据类型，1=布尔，2=整型，3=浮点型，4=字符串，5=DICT
  mandatory?: number; // 是否必填,1=必填，0非必填
  editable?: number; // 是否可修改，1=可修改，0=不可修改
  dictType?: string; // 档案数据类型为DICT时的字典名称
  dictDatas?: string[]; // 档案数据类型为DICT时的字典数据
  [propName: string]: any;
}
// 档案配置的档案格式
export interface CustomProfile {
  profileDesc: string;
  profileName: string;
  profileValue: string;
  profileCode?: string;
  [propName: string]: any;
}

export interface ThingTypeItem {
  connectTypes: string;
  desc: string;
  code?: string;
  name: string;
  nodeType: number | string | undefined;
  canDirectlyConnect?: boolean | number;
  isEdge?: boolean | number;
  customProfiles: CustomProfile[];
  globalProfiles: ConfigProfile[];
  authType: number;
  createTime?: number;
  source: string;
  [propName: string]: any;
}

export interface ThingTypeState {
  thingModelInfo: ThingModelInfo;
  deviceList: ThingTypeItem[];
}

// 查询物类型返回类型
export type QueryMetaResponse = {
  data: ThingTypeItem;
  message: string;
  success: boolean;
};

// 查询物模型信息返回
export interface QueryThingModelInfo {
  createdTime: string; // 创建时间
  createdUserId: string; // 创建用户ID
  id: number; // 数据记录唯一ID
  limitVersion: string; // 物模型限制版本，用于区分不同版本的物模型和物的版本之间的关系，格式为JSON
  source: string; // 物模型定义来源：1.平台 2.外部系统
  sourceId?: string; // 物模型来源ID，source为1时：为空，source为2时：物模型的来源方ID
  sourceModelId: any; // 来源方定义的物模型ID，source为1时：为平台物模型模板ID，source为2时：为国网物模型ID
  thingModelContent: string; // 物模型内容：属性、事件、服务定义，格式为JSON
  thingModelDesc?: string; // 物模型描述
  thingModelCode: string; // 物模型ID
  thingModelName: string; // 物模型名称
  thingModelVersion: string; // 物模型版本，从1开始递增
  thingType: string; // 所属品类：空调、灯。。。
  updateTime: string; // ($date-time) 最后一次更新时间
  updateUserId: string; // 最后一次更新用户ID
}

export type QueryThingModelResponse = {
  data: ThingModelInfo;
  message: string;
  success: boolean;
};

export type Pagination = {
  pageSize: number; // 每页条数
  pageNo: number; // 开始
  order?: string; // 排序方式
  total: number;
};

export type GetThingTypeListParam = {
  order?: number;
  pageNo: number;
  pageSize: number;
  code: string;
  name: string;
  nodeType: number | string;
};

export type GetThingTypeListResponseData = {
  list: ThingTypeItem[];
  pageVO: Pagination;
};
// /thingtype/list 查询物类型列表的接口返回参数的接口
export type GetThingTypeListResponse = {
  code: number;
  message: string;
  success: boolean;
  data: any;
};

// 删除物类型接口请求参数
export type DeleteThingTypeParam = {
  code: string;
  name?: string;
};

// 删除物类型接口返回
export type DeleteThingTypeResponse = {
  code: number;
  message: string;
  success: boolean;
  data: boolean;
};

// /meta/getOwnerSources拉取设备所属渠道信息 返回
export type OwnerSourcesResponse = {
  code: number;
  message: string;
  success: boolean;
  data: Record<string, any>;
};

export * from './thingModel';
export * from './funcDefinition';
