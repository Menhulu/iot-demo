import request from 'utils/request';
import {
  ModuleListResponse,
  QueryUBAuditListParams,
  UBAuditListResponse,
} from '../types/index';

// 查询用户行为审计列表
export const getUserBehaviorAuditList = async (
  params: QueryUBAuditListParams
) => {
  const res = await request<UBAuditListResponse>({
    url: 'audit/list',
    method: 'POST',
    data: params,
  });
  return res && res.data;
};

// 查询操作模块的数据
export const getUserModuleList = async () => {
  const res = await request<ModuleListResponse>({
    url: 'audit/getModuleList',
    method: 'GET',
  });
  console.log(res, 'getUserModuleList');
  return res && res.data;
};
