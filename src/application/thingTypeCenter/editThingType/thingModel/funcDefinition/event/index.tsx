/**
 * @author: zhaohongyun1@jd.com
 * @description: 事件列表，从事件列表打开添加&编辑事件的drawer
 */
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Button, Empty, Drawer } from 'antd';
import { useParams } from 'react-router-dom';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';
import Modal from 'components/Modal';

import { cloneDeep } from 'lodash';

import iconNull from 'static/pic/icon-null.png';
import {
  PageType,
  EventOperationInfo,
  EventInfo,
  DelInfo,
  ModelInfo,
} from '../../../../types/funcDefinition';

import './index.less';

// import EventDef from './eventDef';
const EventDef = lazy(() => import('./eventDef'));

interface EventProps {
  info: ModelInfo;
  change: (data: EventInfo[]) => void;
  isView?: boolean;
  needRequire?: boolean;
}

const Event = (props: EventProps): React.ReactElement => {
  const initEventList = props.info.events || [];
  const modelKey = props.info.key;
  console.log('modelKey====', modelKey);
  const { isView } = props;
  const { nodeType } = useParams<{ id: string; nodeType: string }>();
  const [eventList, setEventList] = useState<EventInfo[]>(initEventList);

  const [delInfo, setDelInfo] = useState<DelInfo>({
    displayName: '',
    visible: false,
    index: -1,
  });

  // 操作抽屉的相关参数
  const [eventOperationInfo, setEventOperationInfo] = useState<
    EventOperationInfo
  >({
    visible: false,
    title: '添加事件',
    itemIndex: eventList.length,
    eventList,
    hasModelKey: !!modelKey,
    pageType: 'CREATE',
    needRequire: props.needRequire,
  });

  /**
   * @description: 二次弹框确认删除
   * @param {type} [number] 1-确定，2-取消
   * @return:
   */
  const confirmDel = (type: number): void => {
    if (type === 1) {
      const { index } = delInfo;
      const list = cloneDeep(eventList);
      list.splice(index, 1);
      setEventList(list);
      props.change(list);
    }
    setDelInfo({
      ...delInfo,
      visible: false,
    });
  };
  /**
   * @description: 点击删除按钮
   * @param {type}
   * @return:
   */
  const handleDel = (param: EventInfo, index: number): void => {
    setDelInfo({
      index,
      displayName: param['display-name'],
      visible: true,
    });
  };

  /**
   * @description: 打开抽屉
   * @param {type} [number] 1-新建；2-编辑；3-查看
   * @param {ele} [PropertyAS] 当前操作的元素
   * @return:
   */
  const openDrawer = (
    pageType: PageType,
    index: number,
    ele?: EventInfo
  ): void => {
    enum PAGE_TYPE {
      CREATE = '添加事件',
      EDIT = '编辑事件',
      VIEW = '查看事件',
    }
    const info: EventOperationInfo = {
      ...eventOperationInfo,
      itemInfo: ele,
      itemIndex: index,
      hasModelKey: !!modelKey,
      eventList,
      title: PAGE_TYPE[pageType],
      visible: true,
      pageType,
    };
    setEventOperationInfo(info);
  };
  /**
   * @description: 点击添加或者取消，改变信息
   * 添加的时候如果名称重复就提示名称不能重复
   * @param {type} [string] 1-添加，2-编辑，3-取消
   * @return:
   */
  const handleChangeOperation = (param: {
    pageType: PageType;
    itemInfo: EventInfo;
  }): void => {
    const { pageType, itemInfo } = param;
    // 物模型下的模型有modelKey,其下的方法也有key
    if (modelKey) itemInfo.key = `${modelKey}.${itemInfo.id.split(':')[3]}`;
    const list = cloneDeep(eventList);
    switch (pageType) {
      case 'CREATE':
        list.push(itemInfo);
        break;
      case 'EDIT':
        // 替换编辑项
        list.splice(eventOperationInfo.itemIndex, 1, itemInfo);
        console.log(list, 'newlist---');
        break;
      default:
        break;
    }
    setEventList(list);
    props.change(list);

    setEventOperationInfo({ ...eventOperationInfo, visible: false });
  };
  const closeDrawer = () => {
    setEventOperationInfo({ ...eventOperationInfo, visible: false });
  };

  // 同步context中的info信息, 初始化本地的信息
  useEffect(() => {
    setEventList(props.info.events || []);
  }, [props.info.events]);
  // 列表
  const columns: ColumnProps<EventInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text: string, record: EventInfo, index: number) => index + 1,
    },
    {
      title: '标识符',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (text ? text.split(':')[3] : '--'),
    },
    {
      title: '事件名称',
      dataIndex: 'display-name',
      key: 'display-name',
    },
    {
      title: '输出参数数量',
      dataIndex: 'parameters',
      key: 'parameters',
      render: (text: string, record: EventInfo) => record.parameters.length,
    },

    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string, record: EventInfo, index: number) => (
        <>
          {!isView && nodeType !== '4' && (
            <Button
              className="btn"
              onClick={() => openDrawer('EDIT', index, record)}
            >
              编辑
            </Button>
          )}
          <Button
            className="btn"
            onClick={() => openDrawer('VIEW', index, record)}
          >
            查看
          </Button>
          {!isView && nodeType !== '4' && (
            <Button className="btn" onClick={() => handleDel(record, index)}>
              删除
            </Button>
          )}
        </>
      ),
    },
  ];
  return (
    <div className="event-service-wrap">
      {/* 工具栏 start */}
      <div className={['tooltip', props.isView ? 'no-btn' : ''].join(' ')}>
        {!props.isView && (
          <Button
            disabled={eventList.length >= 64}
            className="add-btn"
            onClick={() => openDrawer('CREATE', eventList.length)}
          >
            <span className="icon-add-to" />
            添加事件
          </Button>
        )}
      </div>
      {/* 工具栏 end */}
      {/* 列表区域 start */}
      <div className="service-list">
        <Table
          columns={columns}
          dataSource={eventList}
          pagination={undefined}
          rowKey={record => record.id + record['display-name']}
          locale={{
            emptyText: (
              <Empty
                image={iconNull}
                imageStyle={{
                  height: 80,
                }}
                description={<span>当前无任何事件</span>}
              />
            ),
          }}
        />
      </div>
      {/* 列表区域 end */}
      {/* 创建，编辑，查看 start */}
      <Drawer
        placement="right"
        closable={false}
        title={eventOperationInfo.title}
        visible={eventOperationInfo.visible}
        width={818}
      >
        <Suspense fallback={null}>
          <EventDef
            info={eventOperationInfo}
            closeDrawer={closeDrawer}
            onChange={handleChangeOperation}
          />
        </Suspense>
      </Drawer>
      {/* 创建，编辑，查看 end */}
      {/* 删除的二次确认弹框 start */}
      <Modal
        title="删除事件"
        visible={delInfo.visible}
        onOk={() => confirmDel(1)}
        onCancel={() => confirmDel(2)}
        cancelText="取消"
        okText="确定"
      >
        <div>确定要删除{delInfo.displayName}吗？</div>
      </Modal>
      {/* 删除的二次确认弹框 end */}
    </div>
  );
};

export default Event;
