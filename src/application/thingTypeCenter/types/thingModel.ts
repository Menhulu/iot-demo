import { ModelInfo } from './funcDefinition';

// 根据物模型Id 查询版本列表参数
export interface QueryVersionListParams {
  thingModelCode: string;
  order: string;
  changeLogReturned: boolean;
}

// 版本列表数据类型
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
// 查询版本列表返回
export type VersionListResponse = {
  data: VersionItem[];
  msg: string;
};

// 历史版本数据

// 历史版本数据
export type VersionHistoryResponse = {
  data: VersionItem[];
  msg: string;
};

// 根据物类型编码 查询物模型版本列表参数胡
export interface QueryThingModelVersionListParams {
  thingTypeId: string;
  order: string;
  changeLogReturned: boolean;
}
export interface ThingModelContent {
  models: ModelInfo[];
}

// 标准物模型数据类型
export interface ThingModelInfo {
  changeLog?: string;
  createdTime?: string;
  createdUserId?: string;
  latest?: number;
  publishedStatus?: number;
  publishedTime?: string;
  thingModelContent?: any;
  content: ThingModelContent;
  id?: string;
  limitVersion?: string;
  source?: string;
  thingTypeId?: string;
  thingTypeCode?: string;
  updateTime?: string;
  updateUserId?: string;
  thingModelVersion: string;
  description?: string;
  spec?: string;
  [propName: string]: any;
}
// 保存物模型参数
export interface ThingModelNewParam {
  thingModelContent?: string;
  content?: string;
  thingModelDesc?: string;
  thingModelName?: string;
  thingTypeCode?: string;
  thingTypeId?: string;
  thingModelVersion?: string | null;
  changeLog?: string;
}
