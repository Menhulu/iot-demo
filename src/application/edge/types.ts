/*
import { type } from './constants';
 * @Author: zhaohongyun1@jd.com
 * @Date: 2021-01-03 11:48:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-08 14:38:09
 */

// 查询应用列表参数
export interface QueryEdgeAppParam {
  condition: {
    code?: string; // 应用编码
    name?: string; // 应用名称
    type?: string; //应用类型  1.设备应用，2.业务应用
  };
  pageNo: number;
  pageSize: number;
}

//  边缘应用列表项
export interface EdgeAppItem {
  code: string; // 应用编码
  createTime: string;
  createUserId: string;
  description: string;
  id: string;
  name: string; // 应用名称
  recordStatus: number;
  type: string; //应用类型  1.设备应用，2.业务应用
  updateTime: string;
  updateUserId: string;
}

export interface EdgeAppVersionInfo {
  id: string;
  appId: string;
  appName: string; // 应用名称
  description: string;
  type: string; //应用类型  1.设备应用，2.业务应用
  appConfig: string;
  hardware: string;
  packageName: string; // 镜像包名称
  packageSize: number; // 镜像包大小
  packageType: string; // packageType [ OSS, DOCKER_REGISTRY ]
  packageUrl: string;
  portMapping: PortMappingItem[];
  restartPolicy: string;
  digestAlgorithm: string;
  runtime: 'NVIDIA';
  useHosts: boolean;
  version: string;
  cpuShares: string; //  LOWER, NORMAL, HIGHER
  env: EnvVal[];
  isPrivileged: boolean;
  memoryLimit: number;
  volume: VolumeItem[];
  os?: string; // Linux
  mirrorPackage?: string;
  [propName: string]: any;
}

export type ContainerParamsInfo = Omit<
  EdgeAppVersionInfo,
  'id' | 'appName' | 'description' | 'type' | 'appConfig'
>;

export interface QueryDeployParam {
  condition: {
    type?: string; //应用类型  1.设备应用，2.业务应用
    appId?: string;
    edgeOid?: string;
  };

  pageNo: number;
  pageSize: number;
}

export interface QueryParam {
  // appId: string;
  condition: { id: string };
  pageNo: number;
  pageSize: number;
}
export interface QueryAppVersionParam {
  // appId: string;
  condition: { appId: string };
  pageNo: number;
  pageSize: number;
}

// 环境变量
export interface EnvVal {
  key: string;
  value: string;
  id: string;
}

// 端口映射
export interface PortMappingItem {
  containerPort: any;
  hostPort: any;
  protocol: string;
  id: string;
}

// 卷映射
export interface VolumeItem {
  source: string;
  target: string;
  access: string;
  id: string;
}

/** 应用部署列表项 */
export interface AppDeploymentItem extends EdgeAppVersionInfo {
  name: string;
  code: string;
  appId: string;
  edgeOid: string;
  versionId: string;
  appState: string;
}
// 边缘节点监控查询
export interface QueryMetricsParam {
  edgeOid: string;
  endTime: string | number;
  startTime: string | number;
}
export interface QueryMetricsRes {
  cpu: Array<Object>;
  memory: Array<Object>;
  network_inflow_rate: Array<Object>;
  network_outflow_rate: Array<Object>;
}

// 边缘节点部署应用列表

export interface NodeAppItem {
  name: string;
  appId: string;
  versionId: string | number;
  appState: string;
  deployTime: string;
  edgeOid: string;
  code: string;
}

// 边缘节点部署应用列表请求参数
export interface NodeAppParam {
  condition?: {
    appId?: string | number;
    edgeOid?: string;
  };
  pageNo: number;
  pageSize: number;
}

// 边缘节点删除部署应用参数
export interface NodeUnDeployAppParam {
  appCodes: Array<string>;
  edgeOid: string;
}

// 边缘节点操作应用启停
export interface NodeControlAppParam {
  appCode: string;
  appId: number | string;
  edgeOid: string;
  status: string;
  versionId: number | string;
}

// 对象存储预签名
export interface PresignUrlParam {
  appId: number | string;
  fileName: string;
}