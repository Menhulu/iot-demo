export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}

export interface DataAnalysisList {
  totalProductCount: number;
  directConProductCount: number;
  edgeProductCount: number;
  unDirectConProductCount: number;
  totalDeviceCount: number;
  directConDeviceCount: number;
  edgeDeviceCount: number;
  unDirectConDeviceCount: number;
  totalOnlineDeviceCount: number;
  directConOnlineDeviceCount: number;
  edgeOnlineDeviceCount: number;
  unDirectConOnlineDeviceCount: number;
  edgeNodeDeviceCount: number;
  edgeNodeOnlineDeviceCount: number;
  edgeNodeProductCount: number;
  hourEventCountList: number[];
}
