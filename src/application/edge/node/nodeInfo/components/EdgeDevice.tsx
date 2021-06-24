import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Form, Input, Drawer } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { FormComponentProps } from 'antd/lib/form';
import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';
import Table from 'components/Table';
import { getElementTop } from 'utils/tools';
import { REGION } from 'utils/constants';
import AddDevices from 'application/deviceManageCenter/topology/addDevice';

import {
  DeviceInfo,
  QueryTopoParams,
  SubDeviceIdsParams,
} from 'application/deviceManageCenter/types/index';
import {
  deleteDeviceTopo,
  getDeviceTopo,
} from 'application/deviceManageCenter/services/topo';
import { EditContext } from 'application/deviceManageCenter/editDevice/context';
import 'application/deviceManageCenter/topology/index.less';
import AddTopo from 'application/deviceManageCenter/topology/addTopo';

/**
 * @description: 组定义hook, 当参数变化时重新拉去数据，并更新数据
 * @param {type}
 * @return: querParams 查询参数，页面查询条件显示的值
 * pagination 分页相关参数
 * deviceList 表示个数据
 * setQueryParams 更新查询参数的方法，请求列表数据的方法依赖querParams， 通过setQueryParams更新querParams时会自动调用拉取列表数据的方法
 */
function useFetch(
  initialParams: QueryTopoParams,
  initialDeviceList: DeviceInfo[]
) {
  const [queryParams, setQueryParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    pageSize: 20,
    pageNo: 1,
    total: 0,
    lastPage: 1,
  });
  const [deviceList, setDeviceList] = useState<DeviceInfo[]>(initialDeviceList);
  useEffect(() => {
    const fetchDeviceList = async () => {
      try {
        const res = await getDeviceTopo(queryParams);
        if (res && res.code === 200) {
          const { data } = res;
          setDeviceList(data.list);
          const paginationInfo = {
            pageNo: data.pageVO.pageNo,
            pageSize: data.pageVO.pageSize,
            total: data.pageVO.total,
            lastPage: Math.ceil(data.pageVO.total / data.pageVO.pageSize),
          };
          setPagination(paginationInfo);
        } else {
          setDeviceList([]);
          setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
        }
      } catch (error) {
        setDeviceList([]);
        setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
      }
    };
    fetchDeviceList();
  }, [queryParams]);

  return [{ queryParams, deviceList, pagination }, setQueryParams] as const;
}

function Topo(props: FormComponentProps) {
  const { id } = useParams<{ id: string }>();
  const history = useHistory()
  // 边缘计算复用
  const { nodeId } = useParams<{ nodeId: string }>();
  const { state } = useContext(EditContext);
  const { deviceInfo } = state;
  const [ravelLoading, setRavelLoading] = useState<boolean>(false);
  const { getFieldDecorator } = props.form;
  const initQuerParam: QueryTopoParams = {
    deviceId: id || nodeId,
    pageNo: 1,
    pageSize: 20,
    subDeviceId: '',
    subDeviceName: '',
  };
  const [{ queryParams, deviceList, pagination }, setQueryParams] = useFetch(
    initQuerParam,
    []
  );
  const [subDeviceNames, setSubDeviceNames] = useState<string[]>([]);
  const [subDeviceIds, setSubDeviceIds] = useState<SubDeviceIdsParams[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [associateModalVisible, setAssociateModal] = useState<boolean>(false);

  const [selectedSubDevices, setSubDevices] = useState<DeviceInfo[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const boxWrap = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(500);
  const [subDeviceId, setEditSubDeviceId] = useState<string>();

  const setObtainHeight = () => {
    const contentDom: HTMLDivElement | null = boxWrap.current;
    const top = getElementTop(contentDom as HTMLDivElement);
    const clientHeight = document.documentElement.clientHeight - top - 20;
    setHeight(clientHeight);
  };

  useEffect(() => {
    setObtainHeight();
    window.onresize = () => {
      setObtainHeight();
    };
    return () => {
      window.onresize = null;
    };
  }, []);
  /** 解除代理关系 */
  const handleRavel = (subDevice?: DeviceInfo) => {
    setVisible(true);
    if (subDevice) {
      setSubDeviceIds([{ subDeviceId: subDevice.deviceId }]);
      setSubDeviceNames([subDevice.name as string]);
    } else {
      const ids: SubDeviceIdsParams[] = [];
      const names: string[] = [];
      selectedSubDevices.forEach((device) => {
        ids.push({ subDeviceId: device.deviceId });
        names.push(device.name as string);
      });
      setSubDeviceIds(ids);
      setSubDeviceNames(names);
    }
  };
  /** 关闭解除代理关系确认弹框 */
  const cancelRavel = () => {
    setVisible(false);
  };
  // 解除代理关系
  const ravel = async () => {
    setRavelLoading(true);
    try {
      const res = await deleteDeviceTopo({
        deviceId: id || nodeId,
        deviceName: deviceInfo.deviceName,
        thingTypeName: deviceInfo.thingTypeName,
        subDeviceIds,
      });
      if (res.code === 200) {
        Toast('解除关联成功');
        setQueryParams({ ...queryParams });
        cancelRavel();
        setSubDevices([]);
        setSelectedKeys([]);
        setRavelLoading(false);
      } else {
        setRavelLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 添加代理关系 弹出层
  const handleAssociate = () => {
    setEditSubDeviceId('');
    setAssociateModal(true);
  };

  // 关闭添加代理关系 弹出层
  const closeAssociateModal = () => {
    setAssociateModal(false);
    setQueryParams({ ...queryParams });
  };

  // 查询子设备
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.form.validateFields((err, values) => {
      console.log(values);
      if (!err) {
        setQueryParams({
          ...queryParams,
          pageNo: 1,
          subDeviceId: values.subDeviceId ? values.subDeviceId.trim() : '',
          subDeviceName: values.subDeviceName
            ? values.subDeviceName.trim()
            : '',
        });
      }
    });
  };
  // 清空查询条件
  const resetParams = () => {
    props.form.resetFields();
    setQueryParams({
      ...queryParams,
      pageNo: 1,
      subDeviceId: '',
      subDeviceName: '',
    });
  };
  // 翻页
  function pageChange(current: number) {
    setQueryParams({ ...queryParams, pageNo: current });
    setSubDevices([]);
    setSubDeviceIds([]);
    setSelectedKeys([]);
  }
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParams({ ...queryParams, pageNo: current, pageSize });
  };

  const columns: ColumnProps<DeviceInfo>[] = [
    {
      key: 'name',
      title: '设备名称',
      dataIndex: 'name',
      align: 'center',
      render: (text: string, record: DeviceInfo) => (
        <Button onClick={() => {
          history.push(
            {
              pathname: `/deviceManage/editDevice/${record.deviceId}`,
              state: {
                backUrl: `/edge/node/edit/${nodeId}`,
                tabKey: 'device'
              }
            }
          )
        }}>{text}</Button>
      )
    },
    {
      key: 'deviceId',
      title: '设备ID',
      dataIndex: 'deviceId',
      align: 'center',
    },
    {
      key: 'uniqueId',
      title: '设备物理ID',
      dataIndex: 'uniqueId',
      align: 'center',
    },
    {
      key: 'online',
      title: '状态',
      dataIndex: 'online',
      align: 'center',
      render: (text: string) => (
        <span className={text === 'true' ? 'online' : 'offline'}>
          {text === 'true' ? '在线' : '离线'}
        </span>
      ),
    },
    {
      title: '操作',
      dataIndex: '',
      key: 'x',
      align: 'center',
      render: (text: any, record: DeviceInfo, index: number) => (
        <Button
          type="link"
          onClick={() => {
            handleRavel(record);
          }}
        >
          解除代理关系
        </Button>
      ),
    },
  ];
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (selectedRowKeys: any, selectedRows: DeviceInfo[]) => {
      setSubDevices(selectedRows);
      setSelectedKeys(selectedRowKeys);
    },
  };

  return (
    <div className="topo-list-wrap" ref={boxWrap}>
      <Form layout="inline" onSubmit={handleSubmit}>
        <Form.Item label="非直连设备名称">
          {getFieldDecorator('subDeviceName')(
            <Input className="basic-inp-s" />
          )}
        </Form.Item>
        <Form.Item label="非直连设备ID">
          {getFieldDecorator('subDeviceId')(<Input className="basic-inp-s" />)}
        </Form.Item>
        <Button htmlType="submit" type="primary">
          查询
        </Button>
        <Button htmlType="reset" type="primary" onClick={resetParams}>
          清空
        </Button>
      </Form>
      <div className="table-title clearfix">
        <h3 className="f-l">拓扑关系列表</h3>
        {/* <Button
            type="primary"
            className="f-r"
            disabled={deviceDetail!.syncStatus !== 0 || sendBtnDisabled}
            onClick={sendTopo}
          >
            <FormattedMessage id="下发拓扑" defaultMessage="下发拓扑" />
          </Button> */}
        <Button type="primary" className="f-r" onClick={handleAssociate}>
          添加代理关系
        </Button>
        <Button
          type="primary"
          className="f-r"
          disabled={!selectedSubDevices.length}
          onClick={() => handleRavel()}
        >
          解除代理关系
        </Button>
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={deviceList}
        rowSelection={rowSelection}
        rowKey={(record: DeviceInfo, index: number) => record.deviceId}
        pagination={pagination}
        pageChange={pageChange}
        onShowSizeChange={onShowSizeChange}
        locale={{
          emptyText: (
            <div className="list-empty-box">
              <span className="icon-null" />
              <p className="empty-text">当前暂无任何设备</p>
            </div>
          ),
        }}
      />

      <Modal
        title="提示"
        visible={visible}
        onOk={ravel}
        okButtonProps={{ loading: ravelLoading }}
        onCancel={cancelRavel}
        cancelText="不解除"
        okText="解除"
      >
        <div>确定要解除与 {subDeviceNames} 的关联关系吗 ？</div>
      </Modal>
      {/* <SlideBox
          visible={associateModalVisible}
          closeSlideBox={closeAssociateModal}
          style={{ height }}
        > */}
      <Drawer
        placement="right"
        closable={true}
        title="添加代理关系"
        visible={associateModalVisible}
        width={818}
        onClose={closeAssociateModal}
      >
        <AddDevices
          closeSlideBox={closeAssociateModal}
          visible={associateModalVisible}
          isEdgeNode={true}
        />
      </Drawer>
      {/* </SlideBox> */}
    </div>
  );
}

export default Form.create<FormComponentProps>()(Topo);
