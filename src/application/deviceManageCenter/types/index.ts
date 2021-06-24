// 导出分组的类型定义
export * from './deviceGroup';

// 档案配置
export interface ProfileConfig {
  scope: number; // 档案类型，1=全局设备，2=全局物类型，3=物类型设备
  profileCode: string; // 档案编号
  profileName: string; // 档案名称
  profileDesc: string; // 档案描述
  profileValue: string; // 档案值
  dataType: number; // 档案数据类型，1=布尔，2=整型，3=浮点型，4=字符串，5=DICT
  mandatory: number; // 是否必填,1=必填，0非必填
  editable: number; // 是否可修改，1=可修改，0=不可修改
  dictType?: string; // data_type=DICT时，字典表的type
  dictDatas?: string[]; // 档案数据类型为DICT时的字典数据
  deviceMetaId?: string; // 档案作用域为3=物类型设备物类型类型类型id
  createTime?: string;
  updateTime?: string;

  keyErrMsg?: string;
  valErrMsg?: string;
  initVal?: string; // 用来判断保存后不能修改的类型是否被修改过
  uniqueKey: string;
  id: any;
}
// 自定义档案信息
export interface CustomProfile {
  profileCode: string; // 档案编号
  profileName: string; // 档案名称
  profileValue: string; // 档案值
  profileDesc: string; // 档案描述
  uniqueKey: string;
  scope?: number;
  id: any;
  [propName: string]: any;
}
// 地域
export interface Area {
  name: string;
  code: string; // 编码
  level: number; // 层级1=省(自治区)、2=市、3=县/区
  provinceName: string;
  cityName: string;
}

// 标签
export interface Tag {
  key: string;
  value: string;
  description?: string;
  id?: any;
  name?: string;
  keyErrMsg?: string;
  valErrMsg?: string;
  [propName: string]: any;
}
export interface InputVal {
  [propName: string]: string;
}

export type DeviceInfoParam = Partial<DeviceInfo>;

export interface DeviceInfo {
  edgeEngineUrl?: string | undefined;
  description?: any; // 描述
  edgeEngineVersion?: string; // 边缘引擎版本
  deviceId: string; // 设备标识id
  deviceName: string; // 设备名称
  thingTypeCode: string; // 物类型code
  thingTypeName: string; // 物类型名称
  thingModelCode: string; // 物模型ID
  online?: boolean; // 设备在线状态,true-在线;false-离线，被删除
  agentStatus: boolean; // 代理状态
  syncStatus: number; // 边缘设备下发数据同步状态：1 已同步 0 未同步 2 同步中
  isEdge?: boolean; // 是否为边缘设备，被删除
  canDirectlyConnect?: boolean; // 是否为直连设备，被删除
  createTime: number; // 创建时间
  updateTime: number; // 更新时间
  nodeType: number; // 节点类型1:直连设备、2:边缘代理、3:非直连设备
  uniqueId: string; // 设备物理ID
  macAddress: string; // mac地址
  deviceTagsList: Tag[]; // 设备标签
  status: number; // 设备状态{0 停用； 1 未激活； 2 离线； 3 在线}
  areaProvince: string; // 地域（省名称）
  areaProvinceCode: string; // 地域（省编号）
  areaCity: string; // 地域（市名称）
  areaCityCode: string; // 地域（市编号）
  areaDistrict: string; // 地域（县名称）
  areaDistrictCode: string; // 地域（县编号）
  longitude: string; // 经度
  latitude: string; // 纬度
  ip: string; // 最近一次在线IP
  lastConnectTime: number; // 最近一次上线时间
  lastDisconnectTime: number; // 最近一次离线时间
  activateTime: number; // 激活时间
  reportedDataModifyTime?: number; // 非状态信息变化时的时间
  globalProfiles: ProfileConfig[]; // 配置档案信息
  customProfiles: CustomProfile[]; // 自定义档案信息
  name?: string; // topo 中使用
  thingModelVersion: string;
}

export interface DeviceManageState {
  deviceList: DeviceInfo[];
}

export interface PaginationParam {
  pageSize: number; // 每页条数
  pageNo: number; // 分页起始位置
  order?: string; // 排序方式;升序-ASC,降序-DESC
}

export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}

export interface DevcieInfoArr {
  name: string;
  deviceId: string;
}

export interface ThingType {
  name: string;
  id: string;
  ownerSource: string;
}

export interface SubDeviceIdsParams {
  edgeCommunicationId?: string | null;
  subDeviceId: string;
  subDeviceName?: string;
  protocolSpec?: string;
  serviceName?: string;
}
export interface DeviceTopoParams {
  deviceId: string;
  subDeviceIds: SubDeviceIdsParams[];
  deviceName?: string;
  thingTypeName?: string;
}

// 列表排序参数
export interface Orders {
  createTime?: string;
  activateTime?: string;
  lastConnectTime?: string;
}

export interface QueryDeviceListParams {
  pageNo: number;
  pageSize: number;
  deviceInfo: DeviceInfoParam;
  orders?: Orders;
}

// 设备影子-查看设备影子
export interface DeviceShadow {
  type: string; // 属性类型
  unit: string; // 属性单位
  reported: number | string; // 当前值
  desired: number | string; // 期望值
  reportedTime: number; // 当前值更新时间
  desiredTime: number; // 期望值更新时间
  pkey: string; // 属性ID
}

// 查询拓扑列表参数
export interface QueryTopoParams {
  deviceId: string;
  pageNo: number;
  pageSize: number;
  subDeviceName: string;
  subDeviceId: string;
}
// 更新分组设备列表
export interface UpdateDeviceListParam {
  groupId: number;
  deviceGroupName: string;
  deviceIds: string[];
  deviceNames: string[];
}

// 查询全量设备列表信息只返回id和name字段
export interface QuerySimpleDeviceListParams {
  deviceInfo: {
    nodeType?: number | string;
    deviceId?: string;
    deviceName?: string;
  };
  pageNo: number;
  pageSize: number;
}
// 查询全量设备列表信息只返回id和name字段
export interface SimpleDeviceItem {
  deviceId: string;
  deviceName: string;
}

// 查询未绑定拓扑关系的设备参数
export interface UnboundDeviceParams {
  thingTypeCode: string;
  deviceName: string;
  pageSize: number;
  pageNum: number;
}
