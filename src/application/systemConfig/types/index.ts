export interface QueryOSSParamCondition {
  bucket?: string;
  endpoint?: string;
  id?: string;
}
export interface QueryOSSParam {
  condition?: QueryOSSParamCondition;
  pageNo: number;
  pageSize: number;
}
export interface OSS {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  createTime?: string;
  endpoint: string;
  id?: string;
  updateTime?: string;
  description?: string;
}
