import request from 'utils/request';
import { Response } from 'typings/type';
import { RequestResponse, MessageQueryParam } from '../types';
import { ThingTypeListResponse } from '../types/index';

// 查询设备日志接口
export const getDeviceMessageList = async (params: MessageQueryParam) => {
  let res;
  try {
    res = await request<Response<RequestResponse>>({
      url: 'message/list',
      method: 'POST',
      data: params,
    });
  } catch (error) {
    console.log(error);
  }
  return res && res.data;
};
// 查询物类型接口
export const getThingTypeListRequest = () => {
  return request<ThingTypeListResponse>({
    url: 'v2/thingtype/listAll',
    method: 'GET',
    params: {},
  });
};
export * from './firmwareUpgradeApi';

export * from './jobApi';
