/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2020-05-26 14:12:41
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-06-28 15:29:03
 */

import { PageVo } from 'typings/type';

// 档案信息字段
export interface ProfileInfo {
  id?: string;
  scope: number; // 档案类型，1=全局设备，2=全局产品，3=物类型设备   这里只有3
  profileName: string; // 配置档案名称
  thingTypeCode: string; // 物类型编码
  profileDesc: string; // 配置档案说明
  mandatory: number; // 是否必填
  dataType: number; // 档案数据类型，1=布尔，2=整型，3=浮点型，4=字符串，5=DICT  这里只有4
  dictType?: string; // data_type=DICT时，字典表的type
  editable?: number; // 是否可编辑 1可编辑  0 不可编辑
  maxValue?: string; // 数字类型最大值
  minValue?: string; // 数字类型最小值
  profileCode?: string; // 配置档案编码
  updateTime?: string; // 更新时间
  createTime?: string; // 创建时间
}
export type ProfileFormInfo = Pick<
  ProfileInfo,
  | 'id'
  | 'dataType'
  | 'thingTypeCode'
  | 'editable'
  | 'mandatory'
  | 'profileName'
  | 'profileCode'
  | 'scope'
  | 'profileDesc'
>;
// 查询档案列表参数化
export interface QueryProfileParam {
  pageNo: number;
  pageSize: number;
  scope: number;
  thingTypeCode: string;
}

// 查询档案列表结果
export interface QueryProfileRes {
  data: {
    list: ProfileInfo[];
    pageVo: PageVo;
  };
  message: string;
}

// 删除档案参数
export interface DelProfileParam {
  id: string;
  thingTypeCode: string;
  profileName: string;
  scope: number;
}
