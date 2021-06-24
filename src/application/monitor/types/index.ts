export interface MessageLog {
  deviceId: string;
  flow: string;
  type: string;
  rowKey: string;
  timestamp: number;
  topic: string;
  message: string;
}
export interface MessageQueryParam {
  deviceId: string;
  deviceName: string;
  startTime: number;
  endTime: number;
  pageSize: number;
  pageNo: number;
  messageLoggingVO: Partial<MessageLog>;
}
export interface RequestResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}

export interface ThingType {
  name: string;
  id: string;
  ownerSource: string;
}
export interface ThingTypeListResponse {
  code: number;
  message: string;
  success: boolean;
  data: ThingType[];
}

export * from './firmwareUpgrade';
export * from './job';
