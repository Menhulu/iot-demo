import React, { useState } from 'react';
import { Button, Popover } from 'antd';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';

import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';

import useInitial from 'common/customHooks/useInitialList';
import { useParams } from 'react-router-dom';
import {
  QueryDeployParam,
  AppDeploymentItem,
  EdgeAppItem,
  NodeUnDeployAppParam,
} from '../../../types';
import {
  delEdgeNodeApp,
  getEdgeAppDeploymentList,
  controlApp,
} from '../../../service';

import { AppState } from '../../../constants';
import AppConfigModal from './appConfigModal';
import UpgradeApp from './upgradeApp';
import AppContainerParams from './setNodeAppContainerParams';
import {
  statusClassName,
  statusOption,
} from 'application/edge/node/nodeListNew';
export interface AppDeploymentListProps {
  basicInfo?: Partial<EdgeAppItem>;
}
export interface TableOperationProps {
  record: AppDeploymentItem;
  refreshList: () => void; // 操作后刷新列表
  deleteFuncCall: (params: any, callback: () => void) => void; // 删除函数，传参数和回调函数
  basicInfo?: Partial<EdgeAppItem>;
}
export const TableOperation: React.FC<TableOperationProps> = ({
  record,
  refreshList,
  deleteFuncCall,
}) => {
  const [showDelModal, setShowDelModal] = useState(false);
  const [deploymentToHandle, setDeploymentToHandle] = useState<
    AppDeploymentItem & { pageType: 'view' | 'edit' | 'delete'; title: string }
  >();
  const [
    containerParamsDrawerVisible,
    setContainerParamsDrawerVisible,
  ] = useState<boolean>(false);
  const [updateAppDrawerVisible, setUpdateAppDrawerVisible] = useState<boolean>(
    false
  );
  const [appConfigModalVisible, setAppConfigModalVisible] = useState<boolean>(
    false
  );
  /**
   * @description: 确定移除
   */
  function handleDelete(): void {
    deleteFuncCall(
      {
        edgeOid: deploymentToHandle?.edgeOid as string,
        appCodes: [deploymentToHandle?.code as string],
      },
      handleCancelDel
    );
  }

  /**
   * @description: 点击不删除的按钮
   */
  function handleCancelDel(): void {
    setShowDelModal(false);
  }

  /**
   * @description: 点击列表上的删除图标
   */
  function handleClickDelBtn(item: AppDeploymentItem) {
    setShowDelModal(true);
    setDeploymentToHandle({ ...item, pageType: 'delete', title: '' });
  }
  // 关闭应用配置modal
  const closeModal = (refresh?: boolean) => {
    setAppConfigModalVisible(false);
    if (refresh) {
      refreshList();
    }
  };
  const closeDrawer = (refresh?: boolean) => {
    setContainerParamsDrawerVisible(false);
    setUpdateAppDrawerVisible(false);
    if (refresh) {
      refreshList();
    }
  };
  //  打开应用配置modal
  const openAppConfigModal = (
    data: AppDeploymentItem,
    pageType: 'view' | 'edit'
  ) => {
    setDeploymentToHandle({
      ...data,
      pageType: pageType,
      title: pageType === 'view' ? '查看应用配置' : '编辑应用配置',
    });
    setAppConfigModalVisible(true);
  };
  //  打开应用升级Drawer
  const openUpdateAppDrawer = (data: AppDeploymentItem) => {
    setDeploymentToHandle({
      ...data,
      pageType: 'edit',
      title: '',
    });
    setUpdateAppDrawerVisible(true);
  };

  //  打开容器参数Drawer
  const openContainerParamsDrawer = (
    data: AppDeploymentItem,
    pageType: 'view' | 'edit'
  ) => {
    setDeploymentToHandle({
      ...data,
      pageType: pageType,
      title: pageType === 'view' ? '查看容器参数' : '编辑容器参数',
    });
    setContainerParamsDrawerVisible(true);
  };
  // 控制应用状态
  const controlAppStatus = (record: AppDeploymentItem, operation?: string) => {
    controlApp({
      appCode: record.code,
      appId: record.appId,
      versionId: record.versionId,
      edgeOid: record.edgeOid,
      status: operation || (record.appState === 'Running' ? 'stop' : 'start'),
    }).then((res) => {
      if (res.success) {
        refreshList();
        Toast('成功');
      }
    });
  };

  // 操作后循环更新列表,10s*3次
  let refreshCount = 0;
  const cycleRefresh = () => {
    setTimeout(() => {
      refreshList();
      refreshCount++;
      if (refreshCount < 3) {
        cycleRefresh();
      } else {
        clearTimeout();
      }
    }, 10 * 1000);
  };
  /**
   * installing uninstalling: 不支持任何其他操作
   * running: 支持 stop, update, delete
   * stopped: 支持 start, update, delete
   * fail: 支持delete
   **/
  let Operation: React.ReactNode = null;

  if (record.edgeStatus === 2) {
    console.log('------', record);
    Operation = (
      <>
        <Button onClick={() => openContainerParamsDrawer(record, 'view')}>
          查看容器参数
        </Button>
        <Button onClick={() => openAppConfigModal(record, 'view')}>
          查看应用配置
        </Button>
      </>
    );
  } else {
    switch (record.appState) {
      case 'Installing':
      case 'UnInstalling':
        Operation = null;
        break;
      case 'Running':
      case 'Stopped':
        Operation = (
          <>
            <Button
              className="btn btn-delete"
              type="link"
              title="移除"
              onClick={() => handleClickDelBtn(record)}
            >
              移除
            </Button>
            <Button
              className="btn btn-delete"
              type="link"
              title={record.appState === 'Running' ? '停止' : '启动'}
              onClick={() => controlAppStatus(record)}
            >
              {record.appState === 'Running' ? '停止' : '启动'}
            </Button>

            <Popover
              overlayClassName="operation-list"
              placement="bottom"
              content={
                <>
                  <Button
                    onClick={() => controlAppStatus(record, 'force-restart')}
                  >
                    强制重启
                  </Button>
                  <Button
                    onClick={() => openContainerParamsDrawer(record, 'edit')}
                  >
                    编辑容器参数
                  </Button>
                  <Button onClick={() => openAppConfigModal(record, 'edit')}>
                    编辑应用配置
                  </Button>
                  {!record.latest && (
                    <Button onClick={() => openUpdateAppDrawer(record)}>
                      应用更新
                    </Button>
                  )}
                </>
              }
            >
              <Button className="operation-btn" shape="circle">
                <span className="icon-mored" />
              </Button>
            </Popover>
          </>
        );
        break;
      case 'Fail':
      case 'fail':
        Operation = (
          <Button
            className="btn btn-delete"
            type="link"
            title="移除"
            onClick={() => handleClickDelBtn(record)}
          >
            移除
          </Button>
        );
        break;
      default:
        break;
    }
  }

  return (
    <>
      {Operation}
      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelModal}
        onOk={handleDelete}
        onCancel={handleCancelDel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>应用版本删除后不可恢复，您确定要删除</p>
        <p>应用版本 “{deploymentToHandle?.name}” 吗？</p>
      </Modal>
      <AppConfigModal
        visible={appConfigModalVisible}
        closeModal={closeModal}
        data={deploymentToHandle}
        cycleRefresh={cycleRefresh}
      />
      <AppContainerParams
        title={deploymentToHandle?.title}
        visible={containerParamsDrawerVisible}
        closeDrawer={closeDrawer}
        containerParamsData={deploymentToHandle}
        cycleRefresh={cycleRefresh}
      />
      <UpgradeApp
        title="应用更新"
        visible={updateAppDrawerVisible}
        closeDrawer={closeDrawer}
        edgeParamsData={deploymentToHandle}
        cycleRefresh={cycleRefresh}
      />
    </>
  );
};
/** @description 应用部署列表
 *
 */
const AppDeploymentList: React.FC<AppDeploymentListProps> = ({ basicInfo }) => {
  const { appId } = useParams<{ appId: string }>();

  const initQueryParam: QueryDeployParam = {
    condition: {
      appId,
    },
    pageNo: 1,
    pageSize: 20,
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    AppDeploymentItem,
    QueryDeployParam
  >(getEdgeAppDeploymentList, initQueryParam, [], 'edgeAppDeploymentList');

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  // 刷新列表
  const refreshList = () => {
    setQueryParam({ ...queryParam });
  };
  //  删除
  const deleteApp = (params: NodeUnDeployAppParam, callback: () => void) => {
    delEdgeNodeApp(params)
      .then((res) => {
        if (res.success) {
          Toast('删除成功！');
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
          callback && callback();
        }
      })
      ['catch']((error) => {
        callback && callback();
      });
  };

  // 列表
  const columns: ColumnProps<AppDeploymentItem>[] = [
    {
      title: '节点名称',
      dataIndex: 'edgeName',
      key: 'edgeName',
    },
    {
      title: '节点设备ID',
      dataIndex: 'edgeOid',
      key: 'edgeOid',
    },
    {
      title: '节点状态',
      dataIndex: 'edgeStatus',
      key: 'edgeStatus',
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
      title: '应用状态',
      dataIndex:
        'appState' /*STOPPED 停止中 RUNNING：运行中 INSTALLING：安装中 UNINSTALLING卸载中*/,
      key: 'appState',
      render: (text: string) => AppState[text as keyof typeof AppState],
    },
    {
      title: '部署版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '部署时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },

    {
      title: '应用操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',

      render: (text: string, record: AppDeploymentItem) => (
        <TableOperation
          record={record}
          refreshList={refreshList}
          deleteFuncCall={deleteApp}
        />
      ),
    },
  ];

  return (
    <div className="appVersionList">
      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.edgeOid}
        onShowSizeChange={onShowSizeChange}
      />
    </div>
  );
};
export default AppDeploymentList;
