import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, Empty } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import Table from 'components/Table';
import Toast from 'components/SimpleToast/index';

import { REGION } from 'utils/constants';

import iconNull from 'static/pic/icon-null.png';
import { EditContext, SET_EDIT_LIST } from '../context';
import { DeviceInfo, UpdateDeviceListParam } from '../../types/index';
import { getDeviceListRequest } from '../../services';
import { selectDevices, updateDeviceList } from '../../services/deviceGroup';

import './index.less';

function GroupSelect(props: any) {
  const { state, dispatch } = useContext(EditContext);
  const { editInfo, editList } = state;

  const initDeviceList: DeviceInfo[] = [];

  const [deviceList, setDeviceList] = useState(initDeviceList);
  const [queryParam, setQueryParam] = useState({
    pageNo: 1,
    pageSize: 20,
  });
  const [pagination, setPagination] = useState({
    pageSize: 20,
    pageNo: 1,
    total: 0,
    lastPage: 1,
  });
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>(
    []
  );
  const statusMapDes = (status: number) => {
    switch (status) {
      case 0:
        return '停用';
      case 1:
        return '未激活';
      case 2:
        return '离线';
      case 3:
        return '在线';
      default:
        return '异常';
    }
  };
  // 获取设备列表
  const fetchData = useCallback(() => {
    if (editInfo.level === 0) return;
    // 丽水 磐石物管平台每一级都可以添加分组设备
    if (['lishui', 'panshi'].includes(REGION as string)) {
      const param = {
        pageNo: queryParam.pageNo,
        pageSize: queryParam.pageSize,
        deviceInfo: {},
      };
      getDeviceListRequest(param).then((res) => {
        if (res && res.data) {
          setDeviceList(res.data.list);
          setPagination({
            total: res.data.pageVO.total ? res.data.pageVO.total : 0,
            pageNo: res.data.pageVO.pageNo,
            pageSize: res.data.pageVO.pageSize,
            lastPage: Math.ceil(
              res.data.pageVO.total / res.data.pageVO.pageSize
            ),
          });
        } else {
          setDeviceList([]);
          setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
        }
      });
    } else {
      if (editInfo.level === 1) {
        const param = {
          pageNo: queryParam.pageNo,
          pageSize: queryParam.pageSize,
          deviceInfo: {},
        };
        getDeviceListRequest(param).then((res) => {
          if (res && res.data) {
            setDeviceList(res.data.list);
            setPagination({
              total: res.data.pageVO.total ? res.data.pageVO.total : 0,
              pageNo: res.data.pageVO.pageNo,
              pageSize: res.data.pageVO.pageSize,
              lastPage: Math.ceil(
                res.data.pageVO.total / res.data.pageVO.pageSize
              ),
            });
          } else {
            setDeviceList([]);
            setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
          }
        });
      } else {
        const { id, level, parentId } = editInfo;
        const param = {
          groupId: id,
          level,
          pageNO: queryParam.pageNo,
          pageSize: queryParam.pageSize,
          parentId,
        };
        selectDevices(param)
          .then((res) => {
            if (res && res.list) {
              setDeviceList(res.list);
              setPagination({
                total: res.pageVO.total ? res.pageVO.total : 0,
                pageNo: res.pageVO.pageNo,
                pageSize: res.pageVO.pageSize,
                lastPage: Math.ceil(res.pageVO.total / res.pageVO.pageSize),
              });
            } else {
              setDeviceList([]);
              setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
            }
          })
          ['catch']((err) => {
            console.log(err);
            setDeviceList([]);
            setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
          });
      }
    }
  }, [editInfo, queryParam]);
  // 点击分页
  const pageChange = (pageNo: number) => {
    setQueryParam({ ...queryParam, pageNo });
  };
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  // 添加设备
  const onAddDeviceClick = async () => {
    if (selectedDevice.length === 0) {
      Toast('请至少勾选一款设备');
      return;
    }
    const res = selectedDevice.filter((k) => {
      let flag = true;
      editList.forEach((v) => {
        if (k.deviceId === v.deviceId) {
          flag = false;
        }
      });
      return flag;
    });
    const $deviceInfoVOList = res.concat(editList);
    const $deviceNames = $deviceInfoVOList.map((item) => item.deviceName);
    const deviceParam: UpdateDeviceListParam = {
      deviceIds: res.concat(editList).map((item) => item.deviceId),
      groupId: editInfo.id,
      deviceGroupName: editInfo.groupName,
      deviceNames: $deviceNames,
    };
    try {
      const updateRes = await updateDeviceList(deviceParam);
      if (updateRes && updateRes.code == 200) {
        Toast('添加成功');
        dispatch({
          type: SET_EDIT_LIST,
          editList: res.concat(editList),
        });
      }
    } catch (error) {
      console.log(error);
    }
    props.closeSlideBox();
    setSelectedRowKeys([]);
    setSelectedDevice([]);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnProps<Partial<DeviceInfo>>[] = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      ellipsis: true,
      // align: 'center',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '物类型',
      dataIndex: 'thingTypeName',
      key: 'thingTypeName',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '设备状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      ellipsis: true,
      render: (status) => {
        return (
          <span className={status ? 'primary-color' : 'red'}>
            {statusMapDes(status)}
          </span>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeysArr: string[] | number[], selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeysArr);
      setSelectedDevice(selectedRows);
    },
  };

  return (
    <div className="device-group-select">
      <div className="device-group-select-header">
        <span className="title">选择设备</span>
        {deviceList.length > 0 && (
          <Button type="primary" className="btn f-r" onClick={onAddDeviceClick}>
            添加
          </Button>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={deviceList}
        pagination={pagination}
        pageChange={pageChange}
        onShowSizeChange={onShowSizeChange}
        rowKey={(record) => record.deviceId}
        scrollHeight={props.height - 220}
        locale={{
          emptyText: (
            <Empty
              image={iconNull}
              imageStyle={{
                height: 80,
              }}
              description={<span>您没有未设置分组的设备了</span>}
            />
          ),
        }}
      />
    </div>
  );
}
export default GroupSelect;
