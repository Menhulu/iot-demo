import request from 'utils/request';
import { Response } from 'typings/type';
import Toast from 'components/SimpleToast';
import {
  RequestResponse,
  ModelNamesParam,
  ModelNamesResponse,
} from '../types/index';
import { AddParams } from '../types/services';
// 获取物模型列表
export const listSimple = async () => {
  let res;
  try {
    res = await request<Response<RequestResponse>>({
      url: `thingmodel/listSimple`,
      method: 'GET',
      // params: params,
    });
  } catch (data) {
    console.log('业务error', data);
    Toast(data.message);
  }
  return res && res.data;
};

// 获取设备型号列表
export const listAll = async () => {
  return request<RequestResponse>({
    url: `v2/thingtype/listAll`,
    method: 'GET',
    // data: params,
  });
};

// 获取已创建配置的信息接口
export const listExistConfig = (param: { scope: number }) => {
  return request<RequestResponse>({
    url: `deviceProfileConfig/listExistConfig`,
    method: 'GET',
    params: param,
  });
};

// 批量增加档案配置
export const addProfileConfig = (params: AddParams) => {
  return request<RequestResponse>({
    url: `v2/profileConfig/add`,
    method: 'POST',
    data: params,
  });
};

// 请求关联物模型的数据
export const getModelNamesParam = async (params: ModelNamesParam) => {
  const res = await request<Response<ModelNamesResponse>>({
    url: 'v2/thingmodel/searchLatest',
    method: 'GET',
    params,
  });

  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res && res.data;
};

// 查询档案
export const queryList = (data: any) => {
  return request<RequestResponse>({
    url: 'v2/profileConfig/query',
    method: 'POST',
    data,
  });
};

// 更新档案
export const updateProfileConfig = (params: any) => {
  return request<RequestResponse>({
    url: `v2/profileConfig/update`,
    method: 'POST',
    data: params,
  });
};

// 删除某一条档案
export const deleteArchive = async (params: any) => {
  let res;
  try {
    res = await request<RequestResponse>({
      url: `v2/profileConfig/delete`,
      method: 'POST',
      data: params,
    });
  } catch (data) {
    console.log('业务error', data);
    Toast(data.message);
  }
  return res;
};

// 查询所有字典类型接口
export const findAllType = async () => {
  let res;
  try {
    res = await request<RequestResponse>({
      url: `dictionary/findAllType`,
      method: 'GET',
    });
  } catch (data) {
    console.log('业务error', data);
    if (data.code === 201) {
      Toast('字典类型无数据');
    } else {
      Toast(data.message);
    }
  }
  return res && res.data;
};
