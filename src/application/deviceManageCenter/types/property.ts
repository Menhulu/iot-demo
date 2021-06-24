export interface UpdateShadowInfoParams {
  deviceId: string;
  deviceName?: string;
  thingTypeName?: string;
  version: number;
  cmd: {
    [key: string]: any;
  };
}

export interface GetSnapshotParams {
  deviceId: string;
  deviceName?: string;
  thingTypeName?: string;
  params: string[];
}

// 查询属性返回格式
export interface PropertyDataRes {
  metadata?: {
    desired: {
      [propName: string]: {
        timestamp: number;
      };
    };
    reported: {
      [propName: string]: {
        timestamp: number;
      };
    };
  };
  state?: {
    desired: { [propName: string]: any };
    reported: { [propName: string]: any };
  };
  version?: number;
}
