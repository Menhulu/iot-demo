/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2020-05-26 14:29:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-06-28 15:44:33
 */
import request from 'utils/request';
import {
  QueryProfileParam,
  ProfileInfo,
  ProfileFormInfo,
  QueryProfileRes,
  DelProfileParam,
} from '../types/protocolProfile';

// 查询档案列表
export const queryProfileList = (param: QueryProfileParam) => {
  return request<QueryProfileRes>({
    url: 'v2/profileConfig/query',
    method: 'POST',
    data: param,
  });
};

// 删除档案
export const deleteProfile = (param: DelProfileParam) => {
  return request({
    url: 'v2/profileConfig/delete',
    method: 'POST',
    data: param,
  });
};

// 新增档案
export const addProfile = (param: ProfileFormInfo[]) => {
  return request({
    url: 'v2/profileConfig/add',
    method: 'POST',
    data: param,
  });
};

// 新增档案
export const updateProfile = (param: ProfileFormInfo) => {
  return request({
    url: 'v2/profileConfig/update',
    method: 'POST',
    data: param,
  });
};
