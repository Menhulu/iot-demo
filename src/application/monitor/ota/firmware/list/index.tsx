import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Empty, Select, Input, Popover } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { ColumnProps } from 'antd/lib/table';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import SearchForm from '../../components/SearchForm';

import Toast from 'components/SimpleToast/index';
import Header from 'components/Header';
import Modal from 'components/Modal/index';
import AuthButton from 'components/AuthButton';
import Table from 'components/Table';
import { FormComponentProps } from 'antd/lib/form';

import iconNull from 'static/pic/icon-null.png';
import { RouteConfigComponentProps } from 'router/react-router-config';
import useInitial from 'common/customHooks/useInitialList';
import {
  QueryFirmwareParams,
  FirmwareQuery,
  FirmwareData,
  ThingType,
} from '../../../types';
import {
  getFirmwareList,
  getThingTypeListRequest,
  publishedFirmwareVersion,
  delFirmware,
} from '../../../services';

import './index.less';

const { Option } = Select;

interface FirmwareListProps
  extends FormComponentProps,
    RouteConfigComponentProps {}
function FirmwareList(props: FirmwareListProps) {
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];
  const { getFieldDecorator } = props.form;

  const initQueryParam = useMemo(
    () => ({
      condition: {
        versionNo: '',
        thingTypeCode: '',
      },
      pageNo: 1,
      pageSize: 20,
      order: 'DESC',
    }),
    []
  );
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    FirmwareData,
    QueryFirmwareParams
  >(getFirmwareList, initQueryParam, [], 'firmwareStorage');
  const [visible, setVisible] = useState<boolean>(false);
  const [firmwareToDel, setDelFirmware] = useState<FirmwareData>();

  // 提交
  const handleSubmit = (val: QueryFirmwareParams) => {
    console.log(val);
    setQueryParam({ ...queryParam, ...val, pageNo: 1 });
  };

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('otaQueryParams', JSON.stringify(queryParam));
    props.history.push(destination);
  };

  // 删除
  const delRule = (item: FirmwareData) => {
    setVisible(true);
    setDelFirmware(item);
  };
  // 关闭弹出层
  const closeModal = () => {
    setVisible(false);
  };
  // 确认删除
  const doDel = async () => {
    try {
      const data = await delFirmware({
        firmwareId: firmwareToDel?.firmwareId || '',
      });
      if (data) {
        Toast('删除成功');
        let queryPageNO = 1;
        if (pagination.lastPage === 1) {
          queryPageNO = 1;
        } else {
          queryPageNO =
            list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
        }
        setQueryParam({ ...queryParam, pageNo: queryPageNO });
        closeModal();
      }
    } catch (error) {
      // Toast(error.msg);
    }
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  const columns: ColumnProps<FirmwareData>[] = [
    {
      title: '固件ID',
      dataIndex: 'firmwareId',
      key: 'firmwareId',
    },
    {
      title: '物类型编码',
      dataIndex: 'thingTypeCode',
      key: 'thingTypeCode',
      align: 'center',
    },
    {
      title: '版本号',
      dataIndex: 'versionNo',
      key: 'versionNo',
      align: 'center',
    },

    {
      title: '固件名称',
      dataIndex: 'packageName',
      key: 'packageName',
      align: 'center',
    },
    {
      title: '固件大小',
      dataIndex: 'packageSize',
      key: 'packageSize',
      align: 'center',
      render: (text: number, record: FirmwareData) =>
        text ? `${(text / 1024 / 1024).toFixed(4)}M` : '--',
    },

    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'changeLog',
      key: 'changeLog',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (text: string, record: FirmwareData) => (
        <>
          <AuthButton
            title="查看"
            shape="circle"
            type="primary"
            className="handle-btn"
            onClick={() => {
              goSubPage(`/firmware/view/${record.firmwareId}`);
            }}
            buttonKey="QUERY_PERMISSION"
            routeAuthVOList={authVOList}
          >
            <span className="icon icon-see" />
          </AuthButton>

          <Popover
            overlayClassName="operation-list"
            placement="bottom"
            content={
              <>
                <AuthButton
                  onClick={() => {
                    goSubPage(`/firmware/edit/${record.firmwareId}`);
                  }}
                  buttonKey="UPDATE_PERMISSION"
                  routeAuthVOList={authVOList}
                >
                  编辑固件
                </AuthButton>
                {/* 1表示发布过，发不过去就能再删除了 */}
                {record.status !== 1 && (
                  <AuthButton
                    onClick={() => delRule(record)}
                    buttonKey="DELETE_PERMISSION"
                    routeAuthVOList={authVOList}
                  >
                    删除固件
                  </AuthButton>
                )}
                <AuthButton
                  buttonKey="PUBLISH_PERMISSION"
                  routeAuthVOList={authVOList}
                >
                  <Link
                    to={`/ota/job/add/${record.thingTypeCode}/${record.firmwareId}`}
                  >
                    新建任务
                  </Link>
                </AuthButton>
              </>
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
      <Header title="固件列表">
        <Link to="/firmware/add" className="create-btn">
          <Button type="primary">新增固件</Button>
        </Link>
      </Header>
      <div className="firmware-header-content">
        {/* 查询 start */}
        <SearchForm onSubmit={handleSubmit} queryParam={queryParam} />
        {/* 查询 end */}
      </div>
      <ObtainHeight bgColor="#fff">
        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.firmwareId}
          onShowSizeChange={onShowSizeChange}
          locale={{
            emptyText: (
              <Empty
                image={iconNull}
                imageStyle={{
                  height: 120,
                }}
                description={<span>暂无任何固件</span>}
              />
            ),
          }}
        />
      </ObtainHeight>

      <Modal
        title="删除固件"
        visible={visible}
        onCancel={closeModal}
        onOk={doDel}
      >
        <p>您确定要删除固件{(firmwareToDel as FirmwareData)?.versionNo}吗?</p>
      </Modal>
    </div>
  );
}

export default withRouter(Form.create<FirmwareListProps>({})(FirmwareList));
