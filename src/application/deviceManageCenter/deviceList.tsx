/* eslint-disable no-underscore-dangle */
import { Input, Popover, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import AuthButton from 'components/AuthButton';
import Modal from 'components/Modal/index';

import Toast from 'components/SimpleToast/index';
import dayjs from 'dayjs';
import React, { createRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import './index.less';
import { nodeTypeConfig, REGION, PREFIXOWN } from 'utils/constants';

import {
  deviceDelRequest,
  getDeviceListRequest,
  getThingTypeListRequest,
} from './services/index';

import {
  ThingType,
  DeviceInfo,
  DeviceInfoParam,
  QueryDeviceListParams,
} from './types/index';

const { Search } = Input;

function DeviceList(props: any) {
  const formRef = createRef<FormComponentProps>();
  // 页面按钮权限
  const { authVOList } = props.route;

  // 节点类型
  const nodeTypeOption = {
    0: '--',
    1: '直连设备',
    2: '连接代理设备',
    3: '非直连设备',
  };

  const statusOption = {
    0: '停用',
    1: '未激活',
    2: '离线',
    3: '在线',
    4: '离线',
  };
  const statusClassName = {
    0: 'default',
    1: 'default',
    2: 'offline',
    3: 'online',
    4: 'offline',
  };

  // const onlineStatusStyle = {
  //   1: '',
  //   2: 'primary-color',
  //   3: 'red',
  // };
  // const contentStyle: React.CSSProperties = {
  //   height: `${document.documentElement.clientHeight - 265}px`,
  //   overflowY: 'auto',
  // };
  const initThingTypeCodeList: ThingType[] = [];
  const initThingTypeChoosed: ThingType = {
    name: '全部物类型',
    id: '',
    ownerSource: '',
  };
  const initQueryParam: QueryDeviceListParams = {
    deviceInfo: {},
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

  const [thingTypeCodeList, setThingTypeCodeList] = useState(
    initThingTypeCodeList
  );
  const [thingTypeCodeListForSearch, setThingTypeCodeListForSearch] = useState(
    initThingTypeCodeList
  );
  const [metaPopoverVisible, setMetaPopoverVisible] = useState(false);
  const [thingTypeChoosed, setThingTypeChoosed] = useState(
    initThingTypeChoosed
  );

  // 获取物类型列表
  const getDeviceMetaIdList = useCallback(() => {
    getThingTypeListRequest()
      .then((res) => {
        if (res) {
          setThingTypeCodeList(res);
          setThingTypeCodeListForSearch(res);
        }
      })
    ['catch']((err) => {
      console.log(err);
      setThingTypeCodeList([]);
      setThingTypeCodeListForSearch([]);
    });
  }, []);
  useEffect(() => {
    getDeviceMetaIdList();
  }, [getDeviceMetaIdList]);

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

  // 型号搜索
  const onMetaSearch = (val: string) => {
    const res: ThingType[] = [];
    thingTypeCodeList.forEach((item: ThingType) => {
      if (item.name.indexOf(val) > -1 || item.id.indexOf(val) > -1) {
        res.push(item);
      }
    });
    setThingTypeCodeListForSearch(res);
  };

  // 选择物类型
  const onThingTypeItemClick = (item: ThingType) => {
    setMetaPopoverVisible(false);
    setThingTypeChoosed(item);
    setQueryParam({
      ...queryParam,
      deviceInfo: { ...queryParam.deviceInfo, thingTypeCode: item.id },
    });
  };

  // 物类型切换的 Popover 内容
  const getThingTypeContent = () => (
    <>
      <div
        className={`meta-item ${!thingTypeChoosed.id ? 'active' : ''}`}
        onClick={() => {
          onThingTypeItemClick(initThingTypeChoosed);
        }}
      >
        <div className="meta-item-inline pb-10">
          <span className="meta-item-name">全部物类型</span>
          {!thingTypeChoosed.id && <span className="f-r icon-check-mark" />}
        </div>
      </div>

      {thingTypeCodeListForSearch.map((item: any) => (
        <div
          key={item.name + item.id}
          className={`meta-item ${
            thingTypeChoosed.id === item.id ? 'active' : ''
            }`}
          onClick={() => {
            onThingTypeItemClick(item);
          }}
        >
          <div className="meta-item-inline">
            <span className="meta-item-name">{item.name}</span>
            <br />
            <span className="meta-item-id">ID: {item.id}</span>
            {thingTypeChoosed.id === item.id && (
              <span className="check icon-check-mark" />
            )}
          </div>
        </div>
      ))}
      <div className="search-input-box">
        <Search
          placeholder="请输入关键字"
          onSearch={onMetaSearch}
          enterButton
        />
      </div>
    </>
  );

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
      title: '设备名称',
      key: 'deviceName',
      dataIndex: 'deviceName',
    },
    {
      title: '设备ID',
      key: 'deviceId',
      dataIndex: 'deviceId',
    },
    {
      title: '物类型',
      key: 'thingTypeName',
      dataIndex: 'thingTypeName',
    },
    {
      title: '节点类型',
      key: 'nodeType',
      dataIndex: 'nodeType',
      render: (text: number) =>
        nodeTypeConfig.find((item) => item.value === text)?.label,
    },
    {
      title: '设备状态',
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
      title: '设备物理ID',
      key: 'uniqueId',
      dataIndex: 'uniqueId',
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
      render: (text: any, record: DeviceInfo) => (
        <>
          <AuthButton
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            className="mr-10 operation-btn"
            shape="circle"
            title="编辑"
            onClick={() => {
              goSubPage(`/deviceManage/editDevice/${record.deviceId}`);
            }}
          >
            <span className="icon-edit" />
          </AuthButton>

          <Popover
            overlayClassName="operation-list"
            placement="bottom"
            content={
              <>
                <AuthButton
                  buttonKey="DELETE_PERMISSION"
                  routeAuthVOList={authVOList}
                  onClick={() => {
                    delDevice(record);
                  }}
                >
                  删除设备
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
  // if (['jichang'].includes(REGION as string)) {
  //   columns.splice(5, 1, {
  //     title: '设备物理ID',
  //     key: 'uniqueId',
  //     dataIndex: 'uniqueId',
  //   });
  // }
  return (
    <div>
      <div className="device-list-container">
        <Header title="设备列表">
          {thingTypeCodeList.length > 0 ? (
            <>
              <span className="icon-products" />
              <span className="deviceMetaName mr-10">
                {thingTypeChoosed.name}
              </span>
              <Popover
                overlayClassName="device-meta-hover"
                trigger="click"
                placement="bottom"
                visible={metaPopoverVisible}
                onVisibleChange={(visible) => {
                  setMetaPopoverVisible(visible);
                }}
                content={getThingTypeContent()}
              >
                <span className="primary-color cursor-pointer">切换</span>
              </Popover>
            </>
          ) : (
              <span className="meta-empty-text">至少创建一个物类型型号</span>
            )}
          {/* <div className="divided ml-20" />
            <span className="ml-20">设备总数：{pagination.total}台 / </span> */}
          {/* <span>激活设备：{pagination.total}台/ </span> */}
          {/* <span>当前在线：{pagination.total}台</span> */}
          <Link to="addDevice" className="create-btn">
            <AuthButton
              buttonKey="CREATE_PERMISSION"
              type="primary"
              routeAuthVOList={authVOList}
            >
              注册设备
            </AuthButton>
          </Link>
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
