import React, { useState, useRef } from 'react';
import { Button, Modal, Drawer } from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import useInitial from 'common/customHooks/useInitialList';
import DeployApp from './DeployApp';
import ContainerParams from 'application/edge/app/appInfo/components/containerParams';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';
import Toast from 'components/SimpleToast';
import { AppState } from '../../../constants';
import AppConfigModal from 'application/edge/app/appInfo/components/appConfigModal';
import {
  getNodeAppList,
  delEdgeNodeApp,
  edgeNodeDeployApp,
  updateApp,
} from 'application/edge/service';
import {
  NodeAppParam,
  EdgeAppVersionInfo,
  ContainerParamsInfo,
  AppDeploymentItem,
} from 'application/edge/types';
import { TableOperation } from 'application/edge/app/appInfo/components/appDeploymentList';

export default function EdgeApp(props: any) {
  // const { authVOList } = props&&props.route;
  const history = useHistory()
  const { nodeId } = useParams<{ nodeId: string }>();
  const [showDelApp, setShowDelApp] = useState(false);
  const containerParamsRef = useRef<any>();
  const [deployAppShow, setDeployAppShow] = useState(false);

  const [currentApp, setCurrentApp] = useState<AppDeploymentItem>();
  const initNodeAppParam: NodeAppParam = {
    condition: {
      // appId: 0,
      edgeOid: nodeId,
    },
    pageNo: 1,
    pageSize: 20,
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    EdgeAppVersionInfo,
    NodeAppParam
  >(getNodeAppList, initNodeAppParam, [], 'EdgeApp');

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  /**
   * @description: 确定移除

   */
  function handleDelete(): void {
    delEdgeNodeApp({
      appCodes: [currentApp?.code || ''],
      edgeOid: nodeId,
    })
      .then((res) => {
        if (res && res.code === 200) {
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
          Toast('删除成功！');
        } else {
          Toast('删除失败！');
        }
        setShowDelApp(false);
      })
    ['catch']((error) => {
      setShowDelApp(false);
    });
  }

  // 部署App
  const deployApp = async (param: any) => {
    console.log(param);
    // const { appId, versionId } = {param.id,param.appId};

    const deployParam: ContainerParamsInfo = {
      ...param,
      edgeOid: nodeId,
      version: param.id,
    };
    try {
      const res = await edgeNodeDeployApp(deployParam);
      if (res) {
        setDeployAppShow(false);
        setQueryParam({ ...queryParam });
      }
    } catch (error) {
      Toast('部署失败！');
    }
  };
  // 刷新列表
  const refreshList = () => {
    setQueryParam({ ...queryParam });
  };

  const deleteApp = (record: AppDeploymentItem) => {
    setShowDelApp(true);
    setCurrentApp(record);
  };

  // 列表;
  const columns: ColumnProps<AppDeploymentItem>[] = [
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AppDeploymentItem) => {
        return <Button onClick={() => {
          history.push(
            {
              pathname: `/edge/app/edit/${record.appId}`,
              state: {
                backUrl: `/edge/node/edit/${nodeId}`,
                tabKey: 'deploy'
              }
            }
          )
        }}>{text}</Button>
      }
    },
    {
      title: '应用编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '应用状态',
      dataIndex: 'appState',
      key: 'appState',
      render: (text: string) => AppState[text as keyof typeof AppState],
    },
    {
      title: '部署时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: AppDeploymentItem) => (
        <TableOperation
          record={record}
          refreshList={refreshList}
          deleteFuncCall={() => {
            deleteApp(record);
          }}
        />
      ),
    },
  ];

  return (
    <div className="node-app">
      <Button
        type="primary"
        onClick={() => {
          setDeployAppShow(true);
        }}
      >
        部署应用
      </Button>
      {/* <AuthButton
        type="primary"
        className="btn create-btn"
        buttonKey="CREATE_PERMISSION"
        routeAuthVOList={[]}
        onClick={() => {
          setDeployAppShow(true);
        }}
      >
        部署应用
      </AuthButton> */}
      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        className="node-app-table"
        loading={loading}
        rowKey={(record) => record.appId}
        onShowSizeChange={onShowSizeChange}
      />
      {/* 列表end */}
      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelApp}
        onOk={handleDelete}
        onCancel={() => {
          setShowDelApp(false);
        }}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>应用删除后不可恢复，您确定要删除</p>
        <p>应用 “{currentApp?.name}” 吗？</p>
      </Modal>

      <Drawer
        placement="right"
        closable={false}
        title="部署应用"
        visible={deployAppShow}
        width={818}
      >
        {' '}
        <DeployApp
          visible={deployAppShow}
          onConfirm={deployApp}
          onClose={() => {
            setDeployAppShow(false);
          }}
        />
      </Drawer>
    </div>
  );
}
