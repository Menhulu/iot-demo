export interface ArchiveItem {
  id: string;
  profileName: string;
  profileCode: string;
  profileDesc: string;
  mandatory?: number;
  editable?: number;
  scope: number;
  thingTypeCode?: string;
  objectName: string;
  objectId: string;
  count: string;
  updateTime: string;
  createdTime?: string;
  enumerable?: number;
  enumValueList?: string;
  description?: string;
  dataType?: number;
}
export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}
export type ModelNamesParam = {
  pageSize?: number;
  pageIndex?: number;
  keyword?: string;
  order?: string;
  publishedStatus?: number;
};
export type ModelNamesResponse = {
  code: number;
  msg: string;
  data: ModelNamesData;
};
export type ModelNamesData = {
  dataList: ModelNamesItem[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
};
// /thingtype/list 查询物类型列表的接口返回参数的接口
export type ModelNamesItem = {
  createdTime: number;
  createdUserId: string;
  latest: number;
  publishedStatus: number;
  publishedTime: number;
  templateContent: string;
  templateDesc: string;
  templateId?: string;
  templateName?: string;
  thingType: string;
  updateTime: number;
  updateUserId: string;
  version: string;
  thingModelCode: string;
  thingModelName: string;
};

export interface FatherProps {
  listData?: Array<any>;
  closeParentView?: any;
  visable: 'hide' | 'show';
}

export interface ArchiveData {
  list: Array<ArchiveItem>;
  pageVO: Page;
}
export interface Page {
  order: any;
  pageNo: number;
  pageSize: number;
  total: number;
}

export interface InnerArchiveFormProps {
  formData: Record<string, any>;
  form?: any;
  closeSlideBox: any;
  archiveArr: any;
}

// 已配置物类型设备档案列表项数据结构
export interface ThingTypeConfigItem {
  count: number;
  objectId: string;
  objectName: string;
  scope: number;
  updateTime: string;
}

// 查询档案列表参数
export interface QueryProfileParams {
  scope?: number;
  pageNo: number;
  pageSize: number;
  thingTypeCode?: string;
}
