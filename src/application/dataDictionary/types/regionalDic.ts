export interface AreaVO {
  name: string;
  code: string;
  level: number; // 层级1=省(自治区)、2=市、3=县/区
  provinceName: string; // 省名称
  cityName: string;
  [propName: string]: any;
}
