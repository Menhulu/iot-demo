// 查询用户行为审计的参数
export interface QueryUBAuditListParams {
  pageNo: number;
  pageSize: number;
  order: string;
  account?: string | null;
  module?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

// 查询用户行为审计每条记录的
export interface UBAuditList {
  accountName: string;
  id: number;
  logOnTime: string;
  logOutTime: string;
  operationModule: string;
  operationRecord: string;
  operationTime: string;
  organization: string;
  extra?: string[]; // 是一个数组，对于智睿的有可能会有多个设备，用于下面展开的那行显示
  isExtraShow?: boolean; // 展开收起的状态
  [propName: string]: any;
}

// 分页信息
export interface PageVo {
  order?: string;
  pageNo: number;
  pageSize: number;
  total: number;
  lastPage?: number;
}

// 查询用户行为审计返回的结果
export interface UBAuditListResponse {
  code: number;
  data: {
    list: UBAuditList[];
    pageVO: PageVo;
  };
  message: string;
  success: boolean;
}

// 用户行为审计-操作模块
export interface Model {
  name: string;
  value: string;
  children?: Model[] | null;
}

// 用户行为审计-查询模块
export interface ModuleListResponse {
  code: number;
  message: string;
  data: Model[];
}
