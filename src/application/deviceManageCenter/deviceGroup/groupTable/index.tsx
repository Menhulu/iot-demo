import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import Table from 'components/Table';
import Toast from 'components/SimpleToast/index';
import Modal from 'components/Modal/index';
import SlideBox from 'components/SlideLayout/index';
import { ColumnProps } from 'antd/lib/table';
import { getElementTop } from 'utils/tools';
import GroupSelect from '../groupSelect';
import { DeviceInfo } from '../../types/index';
import {
  Pagination,
  CheckDeleteDevicesParam,
  DeviceGroupInfo,
} from '../../types/deviceGroup';
import {
  queryDevices,
  checkDeleteDevices,
  delGroupDevice,
} from '../../services/deviceGroup';
import { EditContext, SET_EDIT_LIST } from '../context';
import './index.less';

function GroupTable(props: any) {
  const { state, dispatch } = useContext(EditContext);
  const { editInfo, editList } = state;
  console.log(editInfo, editList);
  const history = useHistory();
  const [showSlideBox, setShowSlideBox] = useState(false);
  const [height, setHeight] = useState(500);
  const boxWrap = useRef<HTMLDivElement>(null);
  const [pageParam, setPageParam] = useState({ pageNo: 1, pageSize: 20 });
  const setObtainHeight = () => {
    const contentDom: HTMLDivElement | null = boxWrap.current;
    const top = getElementTop(contentDom as HTMLDivElement);
    const clientHeight = document.documentElement.clientHeight - top + 40;
    setHeight(clientHeight);
  };
  useEffect(() => {
    setObtainHeight();
    window.onresize = () => {
      setObtainHeight();
    };
    setTimeout(() => {
      if (document.createEvent) {
        const event = document.createEvent('HTMLEvents');
        event.initEvent('resize', true, true);
        window.dispatchEvent(event);
      }
    });
    return () => {
      window.onresize = null;
    };
  }, []);

  // 展开和收起划出层
  const openSlieBox = () => {
    setShowSlideBox(true);
  };
  const closeSlideBox = () => {
    setShowSlideBox(false);
  };
  const initPagination: Pagination = {
    pageSize: 20,
    pageNo: 1,
    total: 0,
    lastPage: 1,
  };

  const initDelInfo = {
    delParam: {
      deviceIdList: [],
      deviceNames: [],
      groupId: editInfo.id,
      subGroupIdList: [],
    },
    isBatchDel: false,
  };

  const [pagination, setPagination] = useState(initPagination);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[] | number[]>(
    []
  );
  const [showDelModel, setShowDelModel] = useState<boolean>(false);
  const [numInSubGroup, setNumInSubGroup] = useState<number>(0);
  const [delInfo, setDelInfo] = useState<{
    delParam: CheckDeleteDevicesParam;
    isBatchDel: boolean;
  }>(initDelInfo);
  // 返回子级节点id

  const getChildrenIdList = (data?: DeviceGroupInfo[]): number[] => {
    const ids: number[] = [];
    if (!data) return ids;
    data.forEach((item) => {
      ids.push(item.id);
      if (item.children) {
        item.children.forEach((subItem) => {
          ids.push(subItem.id);
        });
      }
    });
    return ids;
  };

  // 获取设备分组列表
  const fetchData = useCallback(() => {
    if (editInfo.level === 0) return;
    const param = {
      groupId: editInfo.id,
      pageNo: pageParam.pageNo,
      pageSize: pageParam.pageSize,
    };
    queryDevices(param)
      .then((res) => {
        if (res && res.data) {
          dispatch({
            type: SET_EDIT_LIST,
            editList: res.data.list,
          });
          setPagination({
            total: res.data.pageVO.total ? res.data.pageVO.total : 0,
            pageNo: res.data.pageVO.pageNo,
            pageSize: 20,
            lastPage: Math.ceil(
              res.data.pageVO.total / res.data.pageVO.pageSize
            ),
          });
        } else {
          dispatch({
            type: SET_EDIT_LIST,
            editList: [],
          });
          setPagination({
            total: 0,
            pageNo: 1,
            pageSize: 20,
            lastPage: 1,
          });
        }
      })
      ['catch']((err) => {
        console.log(err);
        dispatch({
          type: SET_EDIT_LIST,
          editList: [],
        });
        setPagination({
          total: 0,
          pageNo: 1,
          pageSize: 20,
          lastPage: 1,
        });
      });
  }, [dispatch, editInfo, pageParam]);

  // 删除设备接口调用
  const delGroupDeviceRequest = async (
    param: CheckDeleteDevicesParam,
    isBatchDel = delInfo.isBatchDel
  ) => {
    try {
      const res = await delGroupDevice(param);
      if (res) {
        let delIdx = -1;
        if (isBatchDel) {
          dispatch({
            type: SET_EDIT_LIST,
            editList: editList.filter((item) => {
              let flag = true;
              selectedDevice.forEach((selectedDeviceItem) => {
                if (item.deviceId === selectedDeviceItem.deviceId) {
                  flag = false;
                }
              });
              return flag;
            }),
          });
          setSelectedRowKeys([]);
          setSelectedDevice([]);
          setDelInfo(initDelInfo);
        } else {
          dispatch({
            type: SET_EDIT_LIST,
            editList: editList.filter((item: DeviceInfo, index: number) => {
              if (item.deviceId === param.deviceIdList[0]) {
                // 记录被删除设备在设备列表的index
                delIdx = index;
              }
              return item.deviceId !== param.deviceIdList[0];
            }),
          });
          // 重设勾选rowkey
          let keyArr = [...selectedRowKeys];
          let delIdxInKeyArr = -1;
          keyArr = keyArr.map((item, index) => {
            let ret: number | string;
            if (item == delIdx) {
              delIdxInKeyArr = index;
            }
            if (item > delIdx) {
              ret = (item as number) - 1;
            } else {
              ret = item;
            }
            return ret;
          });
          if (delIdxInKeyArr > -1) keyArr.splice(delIdxInKeyArr, 1);
          setSelectedRowKeys(keyArr as typeof selectedRowKeys);
        }
        setShowDelModel(false);
        Toast('删除成功');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 点击删除设备
  const handleClickDelBtn = (record: DeviceInfo) => {
    console.log(
      record,
      'handleClickDelBtn--',
      getChildrenIdList(editInfo.children)
    );
    const param = {
      deviceIdList: [record.deviceId],
      deviceNames: [record.deviceName],
      groupId: editInfo.id,
      deviceGroupName: editInfo.groupName,
      subGroupIdList: getChildrenIdList(editInfo.children),
    };
    setDelInfo({
      delParam: param,
      isBatchDel: false,
    });
    checkDeleteDevices(param)
      .then((res: any) => {
        if (res && res.code == 200) {
          if (res.data && res.data > 0) {
            setNumInSubGroup(res.data);
            setShowDelModel(true);
          } else {
            delGroupDeviceRequest(param, false);
          }
        }
      })
      ['catch']((err) => {
        console.log(err);
      });
  };

  // 跳转编辑
  const goEditPage = (destination: string) => {
    history.push(destination);
  };

  // 批量删除
  const batchDel = () => {
    if (selectedDevice.length === 0) return;
    const param = {
      deviceIdList: selectedDevice.map((item) => item.deviceId),
      deviceNames: selectedDevice.map((item) => item.deviceName),
      groupId: editInfo.id,
      deviceGroupName: editInfo.groupName,
      subGroupIdList: getChildrenIdList(editInfo.children),
    };
    setDelInfo({
      delParam: param,
      isBatchDel: true,
    });
    checkDeleteDevices(param)
      .then((res: any) => {
        if (res && res.code == 200) {
          if (res.data && res.data > 0) {
            setNumInSubGroup(res.data);
            setShowDelModel(true);
          } else {
            // 直接删除
            delGroupDeviceRequest(param, true);
          }
        }
      })
      ['catch']((err) => {
        console.log(err);
      });
  };

  // 确定删除，调用删除接口
  const handleOk = () => {
    delGroupDeviceRequest(delInfo.delParam);
  };
  const handleCancel = () => {
    setShowDelModel(false);
  };
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
  const columns: ColumnProps<Partial<DeviceInfo>>[] = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      className: 'cursor-pointer',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip
          title={text}
          placement="bottom"
          overlayClassName="table-cell-tooltip"
        >
          {text}
        </Tooltip>
      ),
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      className: 'cursor-pointer',
      key: 'deviceName',
      align: 'center',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip
          title={text}
          placement="bottom"
          overlayClassName="table-cell-tooltip"
        >
          {text}
        </Tooltip>
      ),
    },
    {
      title: '物类型',
      dataIndex: 'thingTypeName',
      key: 'thingTypeName',
      className: 'cursor-pointer',
      align: 'center',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip
          title={text}
          placement="bottom"
          overlayClassName="table-cell-tooltip"
        >
          {text}
        </Tooltip>
      ),
    },
    {
      title: '设备状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      className: 'cursor-pointer',
      ellipsis: true,
      render: (status: number) => {
        return (
          <Tooltip
            title={statusMapDes(status)}
            placement="bottom"
            overlayClassName="table-cell-tooltip"
          >
            <span className={`${status ? 'primary-color' : 'red'}`}>
              {statusMapDes(status)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'operation',
      dataIndex: 'operation',
      align: 'center',
      render: (item) => (
        <div className="operation-box">
          <Tooltip
            title="编辑"
            placement="bottom"
            overlayClassName="table-cell-tooltip"
          >
            <Button
              shape="circle"
              onClick={() => {
                goEditPage(`/deviceManage/editDevice/${item.deviceId}`);
              }}
            >
              <span className="icon-edit" />
            </Button>
          </Tooltip>
          <Tooltip
            title="删除"
            placement="bottom"
            overlayClassName="table-cell-tooltip"
          >
            <Button
              className="ml-10"
              shape="circle"
              onClick={() => handleClickDelBtn(item)}
            >
              <span className="icon-delete" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tableData = editList.map((item: DeviceInfo, idx: number) => {
    return {
      key: idx,
      deviceId: item.deviceId,
      deviceName: item.deviceName,
      thingTypeName: item.thingTypeName,
      status: item.status,
      operation: item,
    };
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeysArr: string[] | number[], selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeysArr);
      setSelectedDevice(selectedRows);
    },
  };

  // 点击分页
  function pageChange(pageNo: number) {
    setPageParam({ ...pageParam, pageNo });
  }
  const onShowSizeChange = (current: number, pageSize: number) => {
    setPageParam({ ...pageParam, pageNo: current, pageSize });
  };

  // 添加分组设备
  const selectDevice = () => {
    openSlieBox();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="device-group-table" ref={boxWrap}>
      <div className="device-group-table-header clearfix">
        <Button className="f-r" type="primary" onClick={selectDevice}>
          +添加设备
        </Button>
        <Button className="f-r mr-10" type="primary" onClick={batchDel}>
          批量删除
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableData}
        pagination={pagination}
        pageChange={pageChange}
        onShowSizeChange={onShowSizeChange}
        rowKey={(record) => record.deviceId}
      />
      <Modal
        title="删除分组设备提示"
        visible={showDelModel}
        onOk={handleOk}
        onCancel={handleCancel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p className="pl-20 pr-20">
          {delInfo.isBatchDel
            ? `${numInSubGroup}台设备已存在于子分组中,删除后子分组中的设备将同时移除,确认删除吗?`
            : '此设备已存在于子分组中，删除后子分组中的设备将同时移除，确认删除吗？'}
        </p>
      </Modal>
      <SlideBox
        style={{ height }}
        visible={showSlideBox}
        closeSlideBox={closeSlideBox}
      >
        <GroupSelect closeSlideBox={closeSlideBox} height={height} />
      </SlideBox>
    </div>
  );
}
export default GroupTable;
