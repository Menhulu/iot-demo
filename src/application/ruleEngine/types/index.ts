// 规则列表信息
export interface RuleListItem {
  id: string;
  name: string;
  pattern: string;
  createTime: string;
  desc: string;
  status: number;
}

// 分页数据
export interface RuleListPagination {
  current: number;
  pageSize: number;
  total: number;
  lastPage: number;
}

// 查询参数
export interface QueryRuleListParams {
  pageIndex: number;
  pageSize: number;
  name?: string;
  srcTopic?: string;
  targetType?: number | string;
  status?: 'running' | 'stopped';
}

// 查询列表响应类型
export interface RuleListResponse {
  data: {
    dataList: RuleInfo[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
  msg: string;
}

// 查询规则详情请求参数
export interface QueryRuleInfoParam {
  ruleId: string;
}
// 规则详情信息
export interface RuleInfo {
  createdTime?: string;
  dataSample: string; // 设备上报数据结构的例子,json字符串
  deviceMetaIds?: string; // 物类型
  thingTypeCodes?: string;
  ruleId?: string;
  name: string; // 规则名字，由中文、数字、英文组成，长度2~12
  // qps: number | null; // 每秒发送消息最大值数
  runState?: number; // 运行状态，1-运行，2-停止，3-异常
  status: 'running' | 'stopped' | 'deleted'; // 运行状态，running-运行，stopped-停止，deleted-删除
  sqlStr: string; // 类SQL语句，例如：select devicenName, voltage from topic where voltage>220
  srcTopic: string; // 设备上报的MQTT的Topic，支持通配符

  targetInfoVO: Record<string, any>;
  targetInfoTOStr?: string;
  targetInfoVOStr?: string;
  targetType: 'kafka' | 'mysql' | 'jcq'; // 路由目标地址类型，1000-MySql数据库，1001-kafka topic
  updateTime?: string;
  userId?: string;
  ownerSources?: string; // 归属渠道
  udfs?: string;
  tenantId?: string; // 租户Id，httpAPI 用
  projectId?: string; // 项目ID,httpAPI 用
  appId?: string; // APP ID, httpAPI 用
  [propName: string]: any;
}

export interface EditRuleParams {
  createTime?: string;
  deviceMetaIds?: string; // 物类型
  id?: string;
  name: string; // 规则名字，由中文、数字、英文组成，长度2~12
  // qps: number; // 每秒发送消息最大值数
  runState?: number; // 运行状态，1-运行，2-停止，3-异常
  sqlStr: string; // 类SQL语句，例如：select devicenName, voltage from topic where voltage>220
  srcTopic: string; // 设备上报的MQTT的Topic，支持通配符
  targetInfoTO?: Record<string, any>;

  targetInfoTOStr?: string;
  targetInfoVOStr?: string;
  targetType: number; // 路由目标地址类型，1000-MySql数据库，1001-kafka topic
  status?: number; // 状态：1 有效 0 无效
  updateTime?: string;
  userId?: string;
  description?: string;
}
// 查询规则详情返回信心
export interface RuleInfoResponse {
  data: RuleInfo;
  msg: string;
}

// /meta/getOwnerSources拉取设备所属渠道信息 返回
export type OwnerSourcesResponse = {
  code: number;
  message: string;
  success: boolean;
  data: Record<string, any>;
};
// 用户自定义函数数据结构
export interface FuncItem {
  id: string;
  name?: string;
  desc?: string;
  sub_list?: FuncItem[];
}

// 用户自定义函数数据结构
export interface UserFuncItem {
  id: string;
  name?: string;
  desc?: string;
  sub_list?: FuncItem[];
  subId?: string;
  rename?: string;
  [propName: string]: any;
}
// 查询用户自定义函数返回值
export interface QueryFuncResponse {
  code: number;
  message: string;
  success: boolean;
  data: FuncItem[];
}
