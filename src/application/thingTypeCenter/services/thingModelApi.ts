import request from 'utils/request';
import {
  QueryVersionListParams,
  VersionListResponse,
  ThingModelInfo,
  VersionHistoryResponse,
  QueryThingModelVersionListParams,
  ThingModelNewParam,
} from '../types/thingModel';
import {
  QueryPropertyParam,
  QueryPropertyRes,
  RequestResponse,
  QueryEventParam,
  QueryEventRes,
  QueryFuncParam,
  QueryFuncRes,
  ModelInfo,
} from '../types/funcDefinition';

// 根据物类型编码查询物模型版本列表
export const getVersionListByThingType = async (
  params: QueryThingModelVersionListParams
) => {
  const res = await request<VersionListResponse>({
    url: 'v2/thingmodel/listAllVersions',
    method: 'GET',
    params: params,
  });
  console.log(res);
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};
// 编辑物类型
export const deleteThingModelVersion = (params: {
  modelId: string;
  modelVersion: string;
}) => {
  return request<{ data: boolean }>({
    url: 'v2/thingmodel/del',
    method: 'DELETE',
    params: params,
  });
};

// 根据版本id 和版本号查询当前物模型包版本的信息
export const queryThingModelInfo = async (params: {
  thingModelId: string;
  modelVersion: string;
}) => {
  const res = await request<QueryModelInfoResponse>({
    url: 'v2/thingmodel/findByThingModelId',
    method: 'GET',
    params: params,
  });
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};

// 发布版本
export const pubVersion = async (params: {
  thingModelId: string;
  thingTypeCode: string;
  thingModelVersion: string;
  changeLog: string;
}) => {
  const res = await request<VersionListResponse>({
    url: 'v2/thingmodel/publish',
    method: 'POST',
    data: params,
  });
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};

// 查询单个物模型信息返回
export type QueryModelInfoResponse = {
  data: ThingModelInfo;
  msg: string;
};

// 创建物标准模型版本
export const createVersion = async (params: ThingModelNewParam) => {
  const res = await request<VersionListResponse>({
    url: 'v2/thingmodel/createNewVersion',
    method: 'POST',
    data: params,
  });

  console.log(res);
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};

// 检查物模型数据格式
export const checkThingModelContent = async (params: any) => {
  // const formData = new FormData();
  // formData.append('thingModelContent', params.thingModelContent);
  const res = await request<{ msg: string; data: any }>({
    url: 'v2/thingmodel/checkContent',
    method: 'POST',
    data: params,
  });
  return res;
};
// 编辑标准物模型
export const editThingModel = async (params: ThingModelNewParam) => {
  const res = await request({
    url: 'v2/thingmodel/edit',
    method: 'POST',
    data: params,
  });

  return res;
};

// 查询属性列表
export const getPropertyList = async (params: QueryPropertyParam) => {
  const res = await request<RequestResponse>({
    url: 'modelprop/listModelProperty',
    method: 'GET',
    params: params,
  });
  return res;
};

// 查询物模型信息
export const queryPropertyInfo = async (params: {
  propName: string;
  specName: string;
}) => {
  const res = await request<{ data: QueryPropertyRes }>({
    url: 'modelprop/queryModelPropDetail',
    method: 'GET',
    params: params,
  });
  return res;
};
// 查询事件列表
export const getEventList = async (params: QueryEventParam) => {
  const res = await request<RequestResponse>({
    url: 'modelevent/listModelEvent',
    method: 'GET',
    params: params,
  });
  return res;
};

// 查询物模型信息
export const queryEventInfo = async (params: {
  eventName: string;
  specName: string;
}) => {
  const res = await request<{ data: QueryEventRes }>({
    url: 'modelevent/queryModelEventDetail',
    method: 'GET',
    data: params,
  });
  return res;
};

// 查询事件列表
export const getFuncList = async (params: QueryFuncParam) => {
  const res = await request<RequestResponse>({
    url: 'modelfunc/listModelfunction',
    method: 'GET',
    data: params,
  });
  return res;
};

// 查询物模型信息
export const queryFuncInfo = async (params: {
  funcName: string;
  specName: string;
}) => {
  const res = await request<{ data: QueryFuncRes }>({
    url: 'modelfunc/queryModelFuncDetail',
    method: 'GET',
    params: params,
  });
  return res;
};

export const queryAllServiceModel = () => {
  return request<{ data: ModelInfo[] }>({
    url: '/model/listAllServiceModel',
    method: 'GET',
    params: {},
  });
};
