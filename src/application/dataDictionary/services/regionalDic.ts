import request from 'utils/request';
import { AreaVO } from '../types';
//  查询全国的省
export const getAllProvince = async () => {
  const res = await request<{ code: number; data: AreaVO[] }>({
    url: 'area/allProvince',
    method: 'GET',
    params: {},
  });
  return res;
};

// 根据省名称查询某个省的所有市信息
export const getAllCityByProvince = async (params: {
  provinceName: string;
}) => {
  const res = await request<{ code: number; data: AreaVO[] }>({
    url: 'area/city',
    method: 'GET',
    params: params,
  });
  return res;
};

// 根据市名称查询某个市的所有县/区信息
export const getAllDistrictByCity = async (params: { cityName: string }) => {
  const res = await request<{ code: number; data: AreaVO[] }>({
    url: 'area/district',
    method: 'GET',
    params: params,
  });
  return res;
};
