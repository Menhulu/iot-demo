/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2021-01-03 11:49:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-02-07 20:51:54
 */

import request from 'utils/request';

import {
  QueryEdgeAppParam,
  EdgeAppItem,
  EdgeAppVersionInfo,
  ContainerParamsInfo,
  QueryDeployParam,
  AppDeploymentItem,
  QueryMetricsParam,
  QueryMetricsRes,
  NodeAppParam,
  NodeAppItem,
  NodeUnDeployAppParam,
  QueryAppVersionParam,
  NodeControlAppParam,
  PresignUrlParam
} from './types';
// 获取边缘应用列表
export const getEdgeAppList = (params: QueryEdgeAppParam) =>
  request<{ data: { list: EdgeAppItem[] } }>({
    url: 'v1/edge/app/findByApp',
    method: 'POST',
    data: params,
  });

// 删除边缘应用
export const delEdgeApp = (params: { appId: string }) =>
  request<{ data: boolean }>({
    url: 'v1/edge/app/delete',
    method: 'DELETE',
    params: params,
  });

// 保存边缘应用基本信息
export const addEdgeApp = (params: EdgeAppItem) =>
  request<{ data: boolean; success: boolean }>({
    url: 'v1/edge/app/save',
    method: 'POST',
    data: params,
  });

// 编辑边缘应用基本信息
export const modifyEdgeApp = (params: EdgeAppItem) =>
  request<{ data: boolean }>({
    url: 'v1/edge/app/modify',
    method: 'POST',
    data: params,
  });

// 获取边缘应用基本信息
export const queryEdgeAppInfo = (params: { appId: string }) =>
  request<{ data: EdgeAppItem }>({
    url: 'v1/edge/app/findById',
    method: 'GET',
    params: params,
  });

// 获取边缘应用版本列表
export const getEdgeAppVersionList = (params: any) =>
  request<{ data: { list: EdgeAppVersionInfo[] } }>({
    url: 'v1/edge/app/version/findByPage',
    method: 'POST',
    data: params,
  });

// 删除边缘应用版本
export const delEdgeAppVersion = (params: { appVersionId: string }) =>
  request<{ data: boolean }>({
    url: 'v1/edge/app/version/delete',
    method: 'DELETE',
    params: params,
  });

// 添加边缘应用版本
export const addEdgeAppVersion = (params: FormData) =>
  request<{ data: boolean; success: boolean }>({
    url: 'v1/edge/app/version/save',
    method: 'POST',
    data: params,
  });

// 编辑边缘应用版本
export const saveEdgeAppVersion = (params: FormData, id?: string) => {
  const url = id ? '/v1/edge/app/version/modify' : '/v1/edge/app/version/save';

  return request<{ data: boolean }>({
    url: url,
    method: 'POST',
    data: params,
  });
};

// 获取边缘应用版本信息
export const queryEdgeAppVersionInfo = (params: { appVersionId: string }) =>
  request<{ data: EdgeAppVersionInfo }>({
    url: 'v1/edge/app/version/findById',
    method: 'GET',
    params: params,
  });

// 获取应用部署列表
export const getEdgeAppDeploymentList = (params: QueryDeployParam) =>
  request<{ data: { list: AppDeploymentItem[] } }>({
    url: 'v1/edge/app/findInstallByCondition',
    method: 'POST',
    data: params,
  });

// 删除边缘应用版本
export const delEdgeAppDeployment = (params: { id: string }) =>
  request<{ data: boolean }>({
    url: 'v1/edge/app/version/delete',
    method: 'DELETE',
    params: params,
  });

// 边缘节点监控查询
export const queryDiskMetrics = (params: QueryMetricsParam) =>
  request<{ data: { list: NodeAppItem[] } }>({
    url: 'v1/edge/control/queryDiskMetrics',
    method: 'POST',
    data: params,
  });
// 边缘节点监控查询
export const queryMetrics = (params: QueryMetricsParam) =>
  request<{ data: QueryMetricsRes }>({
    url: 'v1/edge/control/queryMetrics',
    method: 'POST',
    data: params,
  });
// 获取节点部署应用列表
export const getNodeAppList = (params: NodeAppParam) =>
  request<{ data: { list: EdgeAppVersionInfo[] } }>({
    url: 'v1/edge/app/findInstallByCondition',
    method: 'POST',
    data: params,
  });
//删除节点部署应用
export const delEdgeNodeApp = (params: NodeUnDeployAppParam) =>
  request<{ data: boolean }>({
    url: 'v1/edge/control/deleteApps',
    method: 'POST',
    data: params,
  });
// 边缘节点部署应用
export const edgeNodeDeployApp = (params: ContainerParamsInfo) =>
  request<{ data: boolean }>({
    url: 'v1/edge/control/installApp',
    method: 'POST',
    data: params,
  });

// 边缘节点的应用配置更新
export const updateAppConfig = (params: ContainerParamsInfo) =>
  request<{ data: boolean }>({
    url: '/v1/edge/control/updateAppConfig',
    method: 'POST',
    data: params,
  });
// 边缘节点的应用升级
export const upgradeApp = (params: ContainerParamsInfo) =>
  request<{ data: boolean }>({
    url: '/v1/edge/control/upgradeApp',
    method: 'POST',
    data: params,
  });
// 边缘节点的应用配置
export const updateApp = (params: ContainerParamsInfo) =>
  request<{ data: boolean }>({
    url: '/v1/edge/control/updateApp',
    method: 'POST',
    data: params,
  });

// 控制边缘应用 启动/停止
export const controlApp = (params: NodeControlAppParam) =>
  request<{ data: boolean }>({
    url: '/v1/edge/control/controlApp',
    method: 'POST',
    data: params,
  });

// 生成预签名url
export const generatePresignedUrl = (params: PresignUrlParam) =>
  request<{ data: boolean }>({
    url: '/v1/oss/generatePresignedUrl',
    method: 'POST',
    data: params,
  })

// 生成预签名url
export const checkParams = (params: FormData, id?: string) =>
  request<{ data: boolean, message: string }>({
    url: '/v1/edge/app/version/checkParams',
    method: 'POST',
    data: params,
  })