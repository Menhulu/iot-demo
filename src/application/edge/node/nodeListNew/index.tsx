/* eslint-disable no-underscore-dangle */
import { Popover, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import AuthButton from 'components/AuthButton';
import Modal from 'components/Modal/index';

import Toast from 'components/SimpleToast/index';
import dayjs from 'dayjs';
import React, { createRef, useState } from 'react';
import { ColumnProps } from 'antd/es/table';
import Header from 'components/Header';
import useInitial from 'common/customHooks/useInitialList';
import Table from 'components/Table';
import {
  PaginationConfig,
  SorterResult,
  TableCurrentDataSource,
} from 'antd/lib/table';
import SearchForm from './components/SearchForm';
import { PREFIXOWN } from 'utils/constants';
import './index.less';

import {
  deviceDelRequest,
  getDeviceListRequest,
} from 'application/deviceManageCenter/services/index';

import {
  DeviceInfo,
  DeviceInfoParam,
  QueryDeviceListParams,
} from 'application/deviceManageCenter/types/index';

export const statusOption = {
  0: '停用',
  1: '未激活',
  2: '离线',
  3: '在线',
  4: '离线',
};
export const statusClassName = {
  0: 'default',
  1: 'default',
  2: 'offline',
  3: 'online',
  4: 'offline',
};

function DeviceList(props: any) {
  const formRef = createRef<FormComponentProps>();
  // 页面按钮权限
  const { authVOList } = props.route;

  const initQueryParam: QueryDeviceListParams = {
    deviceInfo: {
      nodeType: 4,
    },
    orders: {},
    pageNo: 1,
    pageSize: 20,
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    DeviceInfo,
    QueryDeviceListParams
  >(getDeviceListRequest, initQueryParam, [], 'deviceStorage');

  const [showDelModel, setShowDelModel] = useState(false);
  const [deviceToHandle, setDeviceToHandle] = useState<DeviceInfo>();

  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  // 点击删除设备时调用
  const delDevice = (item: DeviceInfo) => {
    setDeviceToHandle(item);
    setShowDelModel(true);
  };

  // 设备删除请求
  const delDeviceRequest = () => {
    // 删除设备
    const deviceId = deviceToHandle && deviceToHandle.deviceId;
    const deviceName = deviceToHandle && deviceToHandle.deviceName;
    const thingTypeName = deviceToHandle && deviceToHandle.thingTypeName;

    deviceDelRequest({ deviceId, deviceName, thingTypeName })
      .then((res: any) => {
        if (res.code == 200) {
          Toast('删除成功');
          setShowDelModel(false);
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
        } else {
          setShowDelModel(false);
          // Toast($t('删除失败'));
        }
      })
      ['catch']((err) => {
        console.log(err);
        setShowDelModel(false);
      });
  };

  // Modal 取消
  const handleCancel = () => {
    setShowDelModel(false);
  };

  // 分页改变
  function pageChange(current: number) {
    setQueryParam({ ...queryParam, pageNo: current });
  }

  const handleSubmit = (submitParam: any) => {
    console.log(submitParam);
    if (formRef.current) {
      formRef.current.form.validateFields((err: any, fieldsValue: any) => {
        if (!err) {
          console.log(fieldsValue);
          const areaInfo = fieldsValue.area || '{}';
          Object.keys(fieldsValue).forEach((item: string) => {
            if (item === 'status' && fieldsValue[item] == 999) {
              Reflect.deleteProperty(fieldsValue, item);
            }
            if (item === 'nodeType' && fieldsValue[item] == 999) {
              Reflect.deleteProperty(fieldsValue, item);
            }

            // 删除属性值为空值的字段
            if (
              fieldsValue[item as keyof DeviceInfoParam] === '' ||
              JSON.stringify(fieldsValue[item as keyof DeviceInfoParam]) ===
                '[]'
            ) {
              Reflect.deleteProperty(fieldsValue, item);
            }
          });
          // console.lo
          setQueryParam({
            ...queryParam,
            deviceInfo: {
              ...fieldsValue,
              ...submitParam,
              ...JSON.parse(areaInfo),
            },
            pageNo: 1,
          });
        }
      });
    }
  };
  // 排序
  const handleTableChange = (
    pageInfo: PaginationConfig,
    filters: any,
    sorter: SorterResult<any>,
    extra: TableCurrentDataSource<any>
  ) => {
    console.log(pageInfo, filters, sorter, extra);
    if (sorter.order) {
      setQueryParam({
        ...queryParam,
        orders: { [sorter.columnKey]: sorter.order.replace('end', '') },
      });
    } else {
      setQueryParam({ ...queryParam });
    }
  };
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('deviceStorage', JSON.stringify(queryParam));
    props.history.push(destination);
  };
  const columns: ColumnProps<DeviceInfo>[] = [
    {
      title: '节点名称',
      key: 'deviceName',
      dataIndex: 'deviceName',
    },
    {
      title: '节点设备ID',
      key: 'deviceId',
      dataIndex: 'deviceId',
    },
    {
      title: '节点状态',
      key: 'status',
      dataIndex: 'status',
      render: (text: string) => (
        <span
          className={`${
            statusClassName[(text as unknown) as keyof typeof statusClassName]
          } device-status`}
        >
          {statusOption[(text as unknown) as keyof typeof statusOption]}
        </span>
      ),
    },
    {
      title: '注册时间',
      key: 'createTime',
      dataIndex: 'createTime',
      sorter: true,
      render: (text: string) =>
        text ? (
          <>
            <div>{dayjs(text).format('YYYY-MM-DD')}</div>
            <div>{dayjs(text).format('HH:mm:ss')}</div>
          </>
        ) : (
          '--'
        ),
    },
    {
      title: '激活时间',
      key: 'activateTime',
      dataIndex: 'activateTime',
      sorter: true,
      render: (text: string) =>
        text ? (
          <>
            <div>{dayjs(text).format('YYYY-MM-DD')}</div>
            <div>{dayjs(text).format('HH:mm:ss')}</div>
          </>
        ) : (
          '--'
        ),
    },
    {
      title: (
        <div className="text-center">
          最近
          <br />
          接入时间
        </div>
      ),
      key: 'lastConnectTime',
      dataIndex: 'lastConnectTime',
      sorter: true,
      render: (text: string) =>
        text ? (
          <>
            <div>{dayjs(text).format('YYYY-MM-DD')}</div>
            <div>{dayjs(text).format('HH:mm:ss')}</div>
          </>
        ) : (
          '--'
        ),
    },
    {
      title: '操作',
      key: 'operation',
      dataIndex: 'operation',
      align: 'center',
      render: (text: any, record: DeviceInfo, index: number) => (
        <>
          <AuthButton
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            className="operation-btn"
            shape="circle"
            title="查看"
            onClick={() => {
              goSubPage(`/edge/node/edit/${record.deviceId}`);
            }}
          >
            <span className="icon-see" />
          </AuthButton>

          <Popover
            overlayClassName="operation-list"
            placement="bottom"
            // defaultVisible={!(index % 2)}
            content={
              <>
                <AuthButton
                  buttonKey="DELETE_PERMISSION"
                  routeAuthVOList={authVOList}
                  onClick={() => {
                    delDevice(record);
                  }}
                >
                  删除节点
                </AuthButton>
                {record.nodeType !== 3 && (
                  <AuthButton
                    buttonKey="DOWNLOAD_CERTIFICATE"
                    routeAuthVOList={authVOList}
                  >
                    <a
                      href={`${PREFIXOWN}/device/downloadCertificate?deviceId=${record.deviceId}`}
                      download
                    >
                      证书下载
                    </a>
                  </AuthButton>
                )}
              </>
            }
            getPopupContainer={(triggerNode: HTMLElement) =>
              triggerNode.parentNode as HTMLElement
            }
          >
            <Button className="operation-btn" shape="circle">
              <span className="icon-mored" />
            </Button>
          </Popover>
        </>
      ),
    },
  ];
  return (
    <div>
      <div className="device-list-container">
        <Header title="节点列表">
          <AuthButton
            buttonKey="CREATE_PERMISSION"
            type="primary"
            routeAuthVOList={authVOList}
            className="btn create-btn"
            onClick={() => {
              goSubPage(`/edge/node/add`);
            }}
          >
            注册节点
          </AuthButton>
        </Header>
        <div className="container-header">
          <div className="container-header-content">
            <SearchForm wrappedComponentRef={formRef} onSubmit={handleSubmit} />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.deviceId}
          onShowSizeChange={onShowSizeChange}
          onChange={handleTableChange}
        />
      </div>
      <Modal
        title="删除设备提示"
        visible={showDelModel}
        onOk={delDeviceRequest}
        onCancel={handleCancel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>
          设备删除后不可恢复，您确定要删除
          <br />
          设备 “{deviceToHandle ? deviceToHandle.deviceName : ''}”吗？
        </p>
      </Modal>
    </div>
  );
}

export default DeviceList;
