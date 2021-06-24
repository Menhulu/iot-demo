export interface DictionaryInfo {
  type: string; // 字典类型 例如：专业、台区
  name: string; // 名称 例如：配电
  code: string; // 编码
  dictOrder: number; // 序号
  id: number; // 记录id
  createTime?: number; // 创建时间
  updateTime?: number; // 更新时间
}
export interface Pagination {
  pageNo: number; // 页码
  pageSize: number; // 每页显示条数
  total: number; // 数据总量
  lastPage?: number; // 最后的页码
}
// 查询通用字典参数
export interface QueryDictParams {
  type: string;
  pageNo: number;
  pageSize: number;
}
export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}

// 查询
export interface QueryList {
  pageVO: Pagination;
  list: DictionaryInfo[];
}

export interface QueryRequestResponse extends RequestResponse {
  data: QueryList;
}

export interface QueryRequestParams {
  type: string;
  pageNo: number;
  pageSize: number;
}

// 查询字典类型
export interface FindAllTypeRequestResponse extends RequestResponse {
  data: string[];
}

// 编辑的信息
export interface CreateEditDataDicInfo {
  type: string; // 字典类型 例如：专业、台区
  name: string; // 名称 例如：配电
  code: string; // 编码
  dictOrder: number; // 序号
  id?: number | string; // 记录id, 如果是新建没有
}
