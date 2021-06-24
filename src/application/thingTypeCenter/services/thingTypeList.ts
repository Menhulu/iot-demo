import request from 'utils/request';
import {
  GetThingTypeListResponse,
  GetThingTypeListParam,
  DeleteThingTypeParam,
  DeleteThingTypeResponse,
} from '../types/index';

// 查询物类型列表
export const getThingTypeList = async (params: GetThingTypeListParam) => {
  const res = await request<GetThingTypeListResponse>({
    url: 'v2/thingtype/list',
    method: 'GET',
    params: params,
  });
  // 发生非业务异常时res为null 非业务异常时直接reject了，不会执行到这 而是到业务代码的catch
  // 详情见`@/utils/request.ts`
  return res;
};

// 删除物类型;
export const deleteThingType = async (params: DeleteThingTypeParam) => {
  const res = await request<DeleteThingTypeResponse>({
    url: 'v2/thingtype/delete',
    method: 'DELETE',
    params: params,
  });
  return res && res.data;
};
