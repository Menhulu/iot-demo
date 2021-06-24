import React, { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Select } from 'antd';

import Table from 'components/Table';
import Toast from 'components/SimpleToast';

import useInitialList from 'common/customHooks/useInitialList';
import SearchForm from './components/SearchForm';

import { REGION } from 'utils/constants';
import { addDeviceTopo, queryUnboundDevices } from '../services/topo';
import {
  DeviceTopoParams,
  SubDeviceIdsParams,
  UnboundDeviceParams,
} from '../types';
import { DeviceInfo } from '../types/index';
import { ColumnProps } from 'antd/lib/table';
import {
  EditContext,
  REFRESH_DEVICE_INFO,
  SET_WHEN,
} from '../editDevice/context';
import { getEdgeAppDeploymentList } from 'application/edge/service';
import { AppDeploymentItem } from 'application/edge/types';
const { Option } = Select;
interface AddDeviceProps {
  closeSlideBox: () => void;
  visible: boolean;
  isEdgeNode?: boolean; // 是否为边缘应用，是的话列表中展示设备应用，且添加时必选。2/2新增需求
}
export default function AddDevices(props: AddDeviceProps) {
  const history = useHistory();
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo } = state;
  const { isEdgeNode } = props;
  const { nodeId } = useParams<{ nodeId: string }>();
  const [selectedRows, setSelectedRows] = useState<
    { deviceId: string; deviceName: string }[]
  >([]);

  const [deviceAppList, setDeviceAppList] = useState<Array<AppDeploymentItem>>(
    []
  );

  // 设备和应用映射
  const [deviceAppMap, setDeviceAppMap] = useState<
    Array<{ deviceId: string; code: string }>
  >([]);
  const [addTopoBtn, setAddTopoBtn] = useState<boolean>(true);
  const [
    { queryParam, list, pagination, loading },
    setQueryParam,
  ] = useInitialList<DeviceInfo, UnboundDeviceParams>(
    queryUnboundDevices,
    {
      deviceName: '',
      thingTypeCode: '',
      pageNum: 1,
      pageSize: 20,
    },
    []
  );
  const handleSubmit = (values: UnboundDeviceParams) => {
    setQueryParam({
      ...queryParam,
      ...values,
    });
  };
  // 分页改变
  function pageChange(current: number) {
    setQueryParam({ ...queryParam, pageNum: current });
  }
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNum: current, pageSize });
  };
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('deviceStorage', JSON.stringify(queryParam));
    dispatch({
      type: REFRESH_DEVICE_INFO,
      refreshing: true,
    });
    history.push(destination);
  };
  const rowSelection = {
    onChange: (selectedKeys: any, selectedRows: any) => {
      console.log(selectedKeys, selectedRows);
      setSelectedRows(selectedRows);
      // 添加保存按钮校验
      if (isEdgeNode) {
        validApp(selectedRows);
      }
    },
  };

  // 是否每个选中的设备都有app
  const validApp = (
    selectedRowsList: any = selectedRows,
    deviceAppMapList: any = deviceAppMap
  ) => {
    let validAppDisable: boolean = true;
    if (deviceAppMapList.length > 0) {
      selectedRowsList.map((subDevice: any) => {
        deviceAppMapList.map((mapItem: any) => {
          if (subDevice.deviceId === mapItem.deviceId && mapItem.code) {
            validAppDisable = false;
          }
        });
      });
    }
    setAddTopoBtn(validAppDisable);
  };
  const addOrUpdateTopo = async (params: DeviceTopoParams) => {
    try {
      let result;
      result = await addDeviceTopo(params);
      if (result.code === 200) {
        const { data } = result;
        let errMsg = '';
        Object.keys(data.errorTerminalDevice).forEach((key) => {
          errMsg += `${key}${data.errorTerminalDevice[key]}`;
        });

        if (!errMsg) {
          dispatch({
            type: SET_WHEN,
            when: false,
          });
          Toast('关联成功');

          props.closeSlideBox();
        } else {
          Toast(errMsg);
        }
      }
    } catch (error) {
      console.log(error);
      Toast(error.message);
    }
  };

  const saveAssociation = () => {
    const subDeviceIds: SubDeviceIdsParams[] = selectedRows.map((item) => ({
      subDeviceId: item.deviceId,
      subDeviceName: item.deviceName,
    }));
    if (isEdgeNode && deviceAppMap.length > 0) {
      subDeviceIds.map((subDevice: SubDeviceIdsParams, index: number) => {
        deviceAppMap.map((map) => {
          if (subDevice.subDeviceId === map.deviceId) {
            subDeviceIds[index].serviceName = map.code;
          }
        });
      });
    }

    const addOrUpdateTopoParam = {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      thingTypeName: state.deviceInfo.thingTypeName,
      subDeviceIds,
    };
    addOrUpdateTopo(addOrUpdateTopoParam);
  };
  const columns: ColumnProps<DeviceInfo>[] = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    isEdgeNode
      ? {
          title: '设备应用',
          dataIndex: 'appId',
          key: 'appId',
          align: 'center',
          render: (text: string, record: DeviceInfo) => (
            <Select
              style={{ width: 160 }}
              onChange={(val: any) => {
                changeApp(val, record);
              }}
            >
              {deviceAppList.map((app: AppDeploymentItem) => {
                return (
                  <Option key={app.code} value={app.code}>
                    {app.name}
                  </Option>
                );
              })}
            </Select>
          ),
        }
      : { width: '0' }, // 不是边缘节点设备即隐藏
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      align: 'center',
    },

    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (text: string, record: DeviceInfo) => (
        <Button
          title="配置设备协议档案"
          type="link"
          className="handle-btn"
          onClick={() => {
            goSubPage(`/deviceManage/editDevice/${record.deviceId}/1`);
          }}
        >
          配置设备协议档案
        </Button>
      ),
    },
  ];

  // 选择应用
  const changeApp = (val: string, device: DeviceInfo) => {
    const newDeviceAppMap = [
      ...deviceAppMap,
      {
        code: val,
        deviceId: device.deviceId,
      },
    ];
    setDeviceAppMap(newDeviceAppMap);
    validApp(selectedRows, newDeviceAppMap);
  };

  // 查询所有设备应用
  const getDeviceAppList = async () => {
    try {
      const res = await getEdgeAppDeploymentList({
        condition: {
          type: 'device-app', //应用类型  device-app 设备应用
          edgeOid: nodeId,
        },
        pageNo: 1,
        pageSize: 200,
      });
      if (res && res.code === 200) {
        setDeviceAppList(res.data?.list || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isEdgeNode) {
      getDeviceAppList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {/* 查询 start */}
      {!['lishui'].includes(REGION as string) && (
        <SearchForm
          onSubmit={handleSubmit}
          queryUnboundDevicesParam={queryParam}
        />
      )}

      {/* 查询 end */}
      <div className="table-title clearfix">
        <Button
          className="f-r"
          type="primary"
          onClick={saveAssociation}
          // disabled={!selectedRows.length}
          disabled={
            isEdgeNode
              ? !selectedRows.length || addTopoBtn
              : !selectedRows.length
          }
        >
          保存代理关系
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.deviceId}
        onShowSizeChange={onShowSizeChange}
        rowSelection={rowSelection}
      />
    </>
  );
}
