import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Popover } from 'antd';
import useInitial from 'common/customHooks/useInitialList';
import { ColumnProps } from 'antd/lib/table';
import Table from 'components/Table';
import ContainerParams from 'application/edge/app/appInfo/components/containerParams';
import Toast from 'components/SimpleToast';
import AppSearchForm from './AppSearchForm';
import AppConfigModal from 'application/edge/app/appInfo/components/appConfigModal';
import { getEdgeAppVersionList, modifyEdgeApp } from 'application/edge/service';
import {
  EdgeAppItem,
  QueryAppVersionParam,
  EdgeAppVersionInfo,
  AppDeploymentItem,
} from 'application/edge/types';
import './index.less';

interface DeployAppProps {
  visible: boolean;
  onConfirm: (param: { appId: string; versionId: string }) => void;
  onClose: () => void;
}
export default function DeployApp(props: DeployAppProps) {
  const { visible, onConfirm, onClose } = props;
  const containerParamsRef = useRef<any>();
  const [selectedRows, setSelectedRows] = useState<any>();
  const [configParamShow, setConfigParamShow] = useState<boolean>(false);
  const [appConfigShow, setAppConfigShow] = useState<boolean>(false);
  const [currentApp, setCurrentApp] = useState<
    AppDeploymentItem & {
      pageType?: 'view' | 'edit' | 'delete';
      title?: string;
    }
  >();
  const initQueryParam: QueryAppVersionParam = {
    condition: { appId: '' },
    pageNo: 1,
    pageSize: 20,
  };
  // 查询应用版本列表
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    EdgeAppVersionInfo,
    QueryAppVersionParam
  >(getEdgeAppVersionList, initQueryParam, [], '');

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };
  const rowSelection = {
    selectedRowKeys: [(selectedRows && selectedRows[0].id) || ''],
    onChange: (selectedRowKeys: React.Key[], selectedRows: EdgeAppItem[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
      setSelectedRows(selectedRows);
    },
  };

  const deployApp = async () => {
    if (selectedRows && selectedRows.length > 0) {
      // 查询该应用版本
      const editedConfig =
        localStorage.getItem('deployAppConfig') &&
        JSON.parse(localStorage.getItem('deployAppConfig') || '{}');

      // 考虑修改参数后，又选择（点击）了其他应用
      if (editedConfig && editedConfig.id === selectedRows[0].id) {
        onConfirm(editedConfig);
      } else {
        onConfirm(selectedRows[0]);
      }
      localStorage.removeItem('deployAppConfig');
    } else {
      Toast('请选择应用');
    }
  };

  const changeApp = (value: string) => {
    setQueryParam({ ...queryParam, condition: { appId: value } });
  };

  const handleConfigSave = () => {
    containerParamsRef.current.validateFields(
      async (errors: any, values: any) => {
        if (!errors) {
          //部署前的修改参数，不调用接口，存在本地缓存。点击部署时从本地获取数据
          console.log(values);
          localStorage.setItem(
            'deployAppConfig',
            JSON.stringify({
              ...currentApp,
              ...values,
            })
          );
          setConfigParamShow(false);
        }
      }
    );
  };

  // 列表
  const columns: ColumnProps<AppDeploymentItem>[] = [
    {
      title: '镜像包名称',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '镜像包大小',
      dataIndex: 'packageSize',
      key: 'packageSize',
    },
    {
      title: '应用版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '硬件平台',
      dataIndex: 'hardware',
      key: 'hardware',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: AppDeploymentItem) => (
        <Popover
          overlayClassName="operation-list"
          placement="bottom"
          content={
            <>
              <Button
                onClick={() => {
                  setConfigParamShow(true);
                  setCurrentApp({ ...record, title: '应用配置' });
                }}
              >
                容器参数
              </Button>

              <Button
                onClick={() => {
                  setAppConfigShow(true);
                  setCurrentApp({ ...record, title: '应用配置' });
                }}
              >
                应用配置
              </Button>
            </>
          }
        >
          <Button className="operation-btn" shape="circle">
            <span className="icon-mored" />
          </Button>
        </Popover>
      ),
    },
  ];
  useEffect(() => {
    setSelectedRows(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return (
    <div>
      {/* 查询 start */}
      <AppSearchForm
        changeApp={(e) => {
          changeApp(e);
        }}
      />

      {/* 查询 end */}
      <Table
        rowSelection={{
          type: 'radio',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.id}
        onShowSizeChange={onShowSizeChange}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }}
      >
        <Button style={{ marginRight: 8 }} onClick={onClose}>
          取消
        </Button>
        <Button type="primary" onClick={deployApp}>
          部署
        </Button>
      </div>
      <Modal
        title="容器参数"
        visible={configParamShow}
        onOk={handleConfigSave}
        onCancel={() => {
          setConfigParamShow(false);
          localStorage.removeItem('deployAppConfig');
        }}
        width={810}
        cancelText="取消"
        okText="保存"
      >
        <ContainerParams
          ref={containerParamsRef}
          data={currentApp}
          onlyContainerParams={true}
        />
      </Modal>
      <AppConfigModal
        visible={appConfigShow}
        closeModal={() => {
          setAppConfigShow(false);
        }}
        data={currentApp}
        cycleRefresh={() => {
          return true;
        }}
        saveLocal={true} // 缓存在本地
      />
    </div>
  );
}
