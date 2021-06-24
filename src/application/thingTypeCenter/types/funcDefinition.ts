/*
 * @Author:
 * @Date: 2020-04-20 14:05:01
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-29 11:05:24
 */

export type PageType = 'CREATE' | 'EDIT' | 'VIEW';
export interface StepInfo {
  unit?: string;
  unitdesc?: string;
  min: string;
  max: string;
  step: string;
}
export interface ArrInfo {
  size: string;
  item: {
    type: string;
    specs?: StepInfo | StrucInfo | StringInfo;
    length?: string;
  };
}
export interface StrucInfo {
  members: {
    type: string;
    key: string;
    specs?: StepInfo;
    length?: string;
  }[];
}
export interface StringInfo {
  length: string;
}
export interface EnumInfo {
  values: {
    [propName: string]: string;
  };
}
export interface BooleanInfo {
  '0': false;
  '1': true;
}
export interface DateInfo {
  [propName: string]: string;
}

export type AllInfo =
  | StepInfo
  | ArrInfo
  | StrucInfo
  | EnumInfo
  | StringInfo
  | BooleanInfo
  | DateInfo;

export interface TypeConfig {
  displayName?: string;
  description?: string;
  specInfo: AllInfo;
}
// 一条属性的数据结构物
export interface PropertyInfo {
  'display-name': string;
  required?: boolean;
  description: string;
  id: string;
  key?: string;
  access: string;
  valuedef: {
    type: string;
    specs: AllInfo;
  };
  [propName: string]: any;
}

export interface StrcutParamsInfo {
  key: string;
  type: string;
  specs: AllInfo;
  [propName: string]: any;
}

// 新建，编辑，查看的抽屉参数 -属性
export interface OperationInfo {
  visible: boolean;
  title: string;
  item: any;
  itemIndex: number;
  pageType: PageType;
  paramList?: any[];
  needRequire?: boolean;
}

// 删除二次弹框确认信息
export interface DelInfo {
  displayName: string;
  visible: boolean;
  index: number;
}

/**
 *以下是事件相关
 */
// 事件的属性，之所以单独定义出来，是为了减少耦合性，防止后端接口变更，代码间会互相影响
export interface EventParam {
  'display-name': string;
  required?: boolean;
  description: string;
  id: string;
  key?: string;
  access: string;
  valuedef: {
    type: string;
    specs?: AllInfo;
  };
}

// Json代码中事件结构的定义 一个事件的数据结构物
export interface EventInfo {
  id: string;
  key?: string;
  code?: string; // 标识符
  name?: string; // 功能名称 （后端无）
  description: string; // 描述（后端无）
  parameters: EventParam[]; // 输出参数
  [propName: string]: any;
  'display-name': string;
}

export interface EventOperationInfo {
  visible: boolean;
  title: string;
  itemInfo?: EventInfo;
  itemIndex: number;
  eventList: EventInfo[];
  hasModelKey: boolean;
  pageType: PageType;
  needRequire?: boolean;
}

export interface EPropertyModalInfo {
  visible: boolean;
  trigger: string;
  title: string;
  itemInfo: EventParam;
  id: string;
  type: string; // create-添加，edit-编辑
}

/**  以下是服务的相关的类型定义 */

// Json代码中服务的结构
export interface FunctionInfo {
  id: string;
  key?: string;
  'display-name'?: string; // 功能名称
  code?: string; // 标识符
  required?: boolean;
  description: string; //
  in: PropertyInfo[];
  out: PropertyInfo[];
}
// 新建，编辑，查看的抽屉参数 -属性
export interface FuncOperationInfo {
  visible: boolean;
  title: string;
  itemInfo: FunctionInfo | undefined;
  itemIndex: number;
  functionList: FunctionInfo[];
  hasModelKey: boolean;
  pageType: PageType;
  needRequire?: boolean;
}

// 新建，编辑输入参数/输出参数的属性
export interface SPropertyModalInfo {
  visible: boolean;
  title: string;
  itemInfo: FunctionInfo;
  id: string;
  type: string; // create-添加，edit-编辑
  trigger: string; // in-输入参数，2-输出参数
}

// 标注物模型的的功能内容数据结构
export interface ModelInfo {
  id: string;
  key?: string;
  'display-name': string;
  type: 'entity' | 'service';
  description: string;
  properties: PropertyInfo[]; // Property[]; // 属性是必填的
  events: EventInfo[];
  functions: FunctionInfo[];
  [propName: string]: any;
}

/** 查询属性、事件、方法的参数和返回类型 */

export interface QueryPropertyParam {
  pageSize?: number; // 每页条数
  pageNo?: number; // 分页起始位置
  order?: string; // 排序方式;升序-ASC,降序-DESC
  propDisplayName?: string;
  isStd?: number; // 是否标准模型 1-是  0-否
}

export interface QueryPropertyRes {
  id: number;
  specName: string;
  propName: string;
  propDisplayName: string;
  objCode?: string;
  access: string;
  description: string;
  valueDef: { type: string; specs: AllInfo } | string;
  createTime: string;
  updateTime: string;
  isStd: number;
  [propName: string]: any;
}

export interface QueryEventParam {
  pageSize?: number; // 每页条数
  pageNo?: number; // 分页起始位置
  order?: string; // 排序方式;升序-ASC,降序-DESC
  eventDisplayName?: string;
  isStd?: number; // 是否标准模型 1-是  0-否
}

export interface QueryEventRes {
  id: number;
  specName: string;
  eventName: string;
  eventDisplayName: string;
  objCode?: string;
  description: string;
  parameters: string;
  createTime: string;
  updateTime: string;
  isStd: number;
  [propName: string]: any;
}

export interface QueryFuncParam {
  pageSize?: number; // 每页条数
  pageNo?: number; // 分页起始位置
  order?: string; // 排序方式;升序-ASC,降序-DESC
  funcDisplayName?: string;
  isStd?: number; // 是否标准模型 1-是  0-否
}

export interface QueryFuncRes {
  id: number;
  specName: string;
  funcName: string;
  funcDisplayName: string;
  objCode?: string;
  description: string;
  in: string;
  out: string;
  createTime: string;
  updateTime: string;
  isStd: number;
  [propName: string]: any;
}

// 请求响应类型
export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}
