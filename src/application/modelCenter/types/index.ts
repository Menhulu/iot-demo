// 模型查询接口返回数据类型
export interface QueryModelInfoRes {
  code: number;
  data: QueryModelRes;
  messages: string;
}
export type Pagination = {
  pageSize: number; // 每页条数
  pageNo: number; // 开始
  order?: string; // 排序方式
  total: number;
};

// -------模型列表--------

// 模型查询参数
export interface ModelListQueryParam {
  pageSize?: number; // 每页条数
  pageNo?: number; // 分页起始位置
  order?: string; // 排序方式;升序-ASC,降序-DESC
  modelDisplayName?: string;
  isStd?: number; // 是否标准模型 1-是  0-否
}

// 删除标准物模型参数
export interface DelModelParam {
  modelName: string;
  specName: string;
}

// 请求响应类型
export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}
// 创建模型参数
export interface CreateModelParams {
  specName: string;
  modelName: string;
  modelDisplayName: string;
  modelType: string;
  topic?: string;
  description: string;
  modelContent: string;
}
// // 创建模型返回

export interface QueryModelRes {
  id: string;
  specName: string;
  modelName: string;
  modelDisplayName: string;
  modelType: string;
  topic?: string;
  description: string;
  modelContent: string;
  objCode?: string;
  createTime?: string;
  updateTime?: string;
  isStd: number;
  [propName: string]: any;
}

export * from 'application/thingTypeCenter/types';
