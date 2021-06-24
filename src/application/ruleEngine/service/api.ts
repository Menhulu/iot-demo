import request from 'utils/request';
import {
  QueryRuleListParams,
  RuleListResponse,
  QueryRuleInfoParam,
  EditRuleParams,
  RuleInfoResponse,
  OwnerSourcesResponse,
  QueryFuncResponse,
} from '../types/index';
// 查询规则列表
export const getRuleEngineList = async (params: QueryRuleListParams) => {
  const res = await request<RuleListResponse>({
    url: 'v1/ruleengine/query',
    method: 'POST',
    data: params,
  });
  return res;
};

// 查询规则详情
export const getRuleInfo = async (params: QueryRuleInfoParam) => {
  const res = await request<RuleInfoResponse>({
    url: 'v1/ruleengine/findById',
    method: 'GET',
    params: params,
  });
  return res && res.data;
};

// 创建&编辑规则
export const editRule = async (url: string, params: EditRuleParams) => {
  const res = await request<{ data: number; msg: string }>({
    url,
    method: 'POST',
    data: params,
  });
  return res;
};

// 设置规则上线
export const startRule = async (params: { ruleId: string; name?: string }) => {
  const res = await request<{ data: boolean; msg: string }>({
    url: `v1/ruleengine/start?ruleId=${params.ruleId}&name=${params.name}`,
    method: 'POST',
    data: params,
  });
  return res;
};
// 设置规则下线
export const cancelRule = async (params: { ruleId: string; name: string }) => {
  const res = await request<{ data: boolean; msg: string }>({
    url: `v1/ruleengine/stop?ruleId=${params.ruleId}&name=${params.name}`,
    method: 'POST',
    data: params,
  });
  return res;
};

// 删除规则
export const deleteRule = async (params: { ruleId: string; name?: string }) => {
  const res = await request<{ data: boolean; msg: string }>({
    url: `v1/ruleengine/delete`,
    method: 'GET',
    params: params,
  });
  return res;
};
// 恢复规则
export const resume = async (params: { ruleId: string; name: string }) => {
  const res = await request<{ data: boolean; msg: string }>({
    url: `rule/resume?id=${params.ruleId}`,
    method: 'POST',
    data: params,
  });
  return res;
};
// 校验规则名称是否重复
export const checkNameRepeat = async (params: { ruleName: string }) => {
  const res = await request<{ data: boolean; msg: string }>({
    url: `v1/ruleengine/checkName?ruleName=${params.ruleName}`,
    method: 'POST',
    data: params.ruleName,
  });
  return res;
};
// 校验Sql语句
export const validateSql = (params: { sqlStr: string }) => {
  return request<{ data: boolean; msg: string }>({
    url: `v1/ruleengine/checkSql?sqlStr=${params.sqlStr}`,
    method: 'POST',
    data: params.sqlStr,
  });
};

// 拉取设备所属渠道信息
export const getOwnerSources = async () => {
  const res = await request<OwnerSourcesResponse>({
    url: 'thingtype/getOwnerSources',
    method: 'POST',
    data: {},
  });
  return res && res.data;
};
// 获取自定义函数信息

export const getCustomFunc = async () => {
  const res = await request<QueryFuncResponse>({
    url: 'rule/getUdfs',
    method: 'GET',
    params: {},
  });
  return res && res.data;
};

// 获取Topic列表
export const getTopicList = () => {
  return request<{ data: Record<string, any> }>({
    url: 'v1/ruleengine/getTopicList',
    method: 'GET',
    params: {},
  });
};
