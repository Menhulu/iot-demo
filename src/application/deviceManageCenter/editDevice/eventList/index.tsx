import React from 'react';

import { useParams } from 'react-router-dom';
import { Empty, Collapse } from 'antd';
import iconNull from 'static/pic/icon-null.png';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import { formatJson } from 'utils/format-json';
import useInitialList from 'common/customHooks/useInitialList';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';
import dayjs from 'dayjs';
import { customPanelStyle } from 'application/monitor/logService'
import { getFuncCall } from '../../services/funcproperty';
import { EventList, QueryParam } from '../../types/funcproperety';

import './index.less';

const { Panel } = Collapse;

export default function EventListCom(props: any) {
  const { id } = useParams<{ id: string }>();
  const initQueryParam = {
    pageSize: 20,
    pageNo: 1,
    deviceId: id,
  };

  const [
    { queryParam, list, pagination, loading },
    setQueryParam,
  ] = useInitialList<EventList, QueryParam>(getFuncCall, initQueryParam, []);

  function pageChange(pageNo: number) {
    setQueryParam({ ...queryParam, pageNo });
  }
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  const columns: ColumnProps<EventList>[] = [
    {
      title: '事件名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: '15%',
    },
    {
      title: '上报时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '15%',
      render: (text: number) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '——',
    },
    {
      title: '消息id',
      dataIndex: 'messageId',
      key: 'messageId',
      width: '15%',
    },
    {
      title: '事件参数',
      dataIndex: 'parameters',
      key: 'parameters',
      ellipsis: true,
      width: '30%',
      render: (text: string, record: EventList) => (
        <div className="message-box">
          <Collapse bordered={false} style={{ width: '100%' }}>
            <Panel header={text.replace(/^\"+|\"+$/g, '').replace(/[\\]/g, '')} key={record.messageId} style={customPanelStyle}>
              <pre>{formatJson(text.replace(/^\"+|\"+$/g, '').replace(/[\\]/g, ''))}</pre>
            </Panel>
          </Collapse>
        </div>
      ),
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
              description={<span>无事件上报记录</span>}
            />
          ),
        }}
      />
    </ObtainHeight>
  );
}
