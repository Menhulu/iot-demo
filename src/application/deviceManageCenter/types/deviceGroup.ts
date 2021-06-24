// 设备分组信息
export interface DeviceGroupInfo {
  id: number;
  groupName: string;
  parentId: number; // 0 代表根节点
  level: number;
  rootFlag?: boolean; // true 代表根节点， false 非根节点
  children: DeviceGroupInfo[];
  description?: string;
  selected?: boolean; // 是否选中
  createTime?: number;
  deviceNum?: number;
  onlineNum?: number;
  groupNameChangeFlag?: boolean; // 编辑分组的时候，是否分组的名字发生了变化
  disabled?: boolean;
  isLeaf?: boolean;
}
export interface Pagination {
  pageSize: number; // 每页条数
  pageNo: number; // 分页起始位置
  total: number; // 总量
  lastPage: number;
}
// 查询分组内设备列表入参
export interface DeviceGroupListParam {
  groupId: number;
  pageNo: number;
  pageSize: number;
}

// 添加的接口
export interface AddDeviceGroupInfo {
  groupName: string;
  parentId: number; // 0 代表根节点
  level?: number;
  rootFlag?: boolean; // true 代表根节点， false 非根节点
  children?: DeviceGroupInfo[];
  description?: string;
  selected?: boolean; // 是否选中
  createTime?: number;
  deviceNum?: number;
  onlineNum?: number;
}

// 从父分组选择设备接口的参数
export interface SelectDevicesParam {
  groupId: number;
  level: number;
  pageNO: number;
  pageSize: number;
  parentId: number;
}

// 校验设备是否可被删除参数
export interface CheckDeleteDevicesParam {
  deviceIdList: string[];
  deviceNames?: string[];
  groupId: number;
  deviceGroupName?: string;
  subGroupIdList: number[];
}
