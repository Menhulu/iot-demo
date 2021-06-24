/*
 * @Author:
 * @Date: 2020-05-31 14:49:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-06-01 18:02:00
 */

export interface FuncList {
  deviceId: string;
  displayName: string;
  eventType: string;
  reqTimestamp: string;
  respTimestamp: string;
  code: string;
  messageId: string;
  message: string;
  in: string;
  out: string;
}
export interface EventList {
  deviceId: string;
  displayName: string;
  eventType: string;
  messageId: string;
  parameters: string;
  timestamp: string;
}

export type QueryParam = {
  pageSize: number;
  pageNo: number;
  deviceId: string;
};
