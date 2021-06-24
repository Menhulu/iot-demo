import React from 'react';
import { useParams } from 'react-router-dom';
import { Empty, Collapse } from 'antd';

import iconNull from 'static/pic/icon-null.png';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';

import Table from 'components/Table';
import { ColumnProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatJson } from 'utils/format-json';
import useInitialList from 'common/customHooks/useInitialList';
import { getFuncList } from '../../services/funcproperty';
import { FuncList, QueryParam } from '../../types/funcproperety';
import { customPanelStyle } from 'application/monitor/logService'
import './index.less';
const { Panel } = Collapse;
export default function FuncListCom(props: any) {
  const { id } = useParams<{ id: string }>();
  const initQueryParam = {
    pageSize: 20,
    pageNo: 1,
    deviceId: id,
  };

  const [
    { queryParam, list, pagination, loading },
    setQueryParam,
  ] = useInitialList<FuncList, QueryParam>(getFuncList, initQueryParam, []);

  function pageChange(pageNo: number) {
    setQueryParam({ ...queryParam, pageNo });
  }
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };
  const columns: ColumnProps<FuncList>[] = [
    {
      title: '方法名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: '10%',
      ellipsis: true,
    },
    {
      title: '方法调用时间',
      dataIndex: 'reqTimestamp',
      key: 'reqTimestamp',
      width: '10%',
      ellipsis: true,
      render: (text: string) =>
        text ? dayjs(Number(text)).format('YYYY-MM-DD HH:mm:ss') : '——',
    },
    {
      title: '方法响应时间',
      dataIndex: 'respTimestamp',
      key: 'respTimestamp',
      width: '10%',
      ellipsis: true,
      render: (text: string) =>
        text ? dayjs(Number(text)).format('YYYY-MM-DD HH:mm:ss') : '——',
    },
    {
      title: '方法返回结果',
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      width: '10%',
    },
    {
      title: '方法返回消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      width: '10%',
    },
    {
      title: '方法调用参数',
      dataIndex: 'in',
      key: 'in',
      ellipsis: true,
      width: '25%',
      render: (text: string, record: FuncList) => (
        <div className="message-box">
          <Collapse bordered={false} style={{ width: '100%' }}>
            <Panel header={text.replace(/\\/g, "")} key={record.messageId} style={customPanelStyle}>
              <pre>{formatJson(text.replace(/\\/g, ""))}</pre>
            </Panel>
          </Collapse>
        </div>
      ),
    },
    {
      title: '方法返回参数',
      dataIndex: 'out',
      key: 'out',
      ellipsis: true,
      width: '25%',
    },
  ];
  return (
    <ObtainHeight bgColor="#fff">
      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.messageId}
        onShowSizeChange={onShowSizeChange}
        locale={{
          emptyText: (
            <Empty
              image={iconNull}
              imageStyle={{
                height: 80,
              }}
              description={<span>无方法调用记录</span>}
            />
          ),
        }}
      />
    </ObtainHeight>
  );
}
