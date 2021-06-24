import request from 'utils/request';
import { Response } from 'typings/type';
import { RequestResponse } from '../types';

// 获取统计看板数据列表
export const getDataAnalysisList = async () => {
  const res = await request<Response<RequestResponse>>({
    url: 'dataanalysis/list',
    method: 'GET',
    params: {},
  });
  return res && res.data;
};
