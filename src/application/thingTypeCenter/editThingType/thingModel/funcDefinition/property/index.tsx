/* eslint-disable react/no-array-index-key */
/*
 * @Author: zhaohongyun1@jd.com
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button, Row, Col, Empty, Popover, Drawer } from 'antd';
import { useParams } from 'react-router-dom';
import Modal from 'components/Modal';

import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';

import { cloneDeep } from 'lodash';
import iconNull from 'static/pic/icon-null.png';

import {
  PropertyInfo,
  OperationInfo,
  PageType,
  StepInfo,
  AllInfo,
  StringInfo,
  ArrInfo,
  StrucInfo,
  ModelInfo,
  EnumInfo,
  DelInfo,
} from '../../../../types/funcDefinition';

// import ValueDef from './valueDef';
import './index.less';

const ValueDef = lazy(() => import('./valueDef'));
interface PropertyProps {
  info: ModelInfo;
  change: (info: PropertyInfo[]) => void;
  isView: boolean;
  needRequire?: boolean;
}

const Property = (props: PropertyProps): React.ReactElement => {
  const { nodeType } = useParams<{ id: string; nodeType: string }>();
  const { isView } = props;
  const modelKey = props.info.key;
  console.log('modelKey====', modelKey);
  const [propertyList, setPropertyList] = useState<PropertyInfo[]>(
    props.info.properties || []
  );
  const [delInfo, setDelInfo] = useState<DelInfo>({
    displayName: '',
    visible: false,
    index: -1,
  });

  // 操作抽屉的相关参数
  const [operationInfo, setOperationInfo] = useState<OperationInfo>({
    visible: false,
    title: '添加属性',
    item: null,
    itemIndex: propertyList.length, // 记录一个索引作为编辑创建item的标记，属性里没有唯一不变的字段
    pageType: 'CREATE',
    needRequire: props.needRequire,
    paramList: propertyList,
  });

  useEffect(() => {
    setPropertyList(props.info.properties || []);
  }, [props.info]);

  /**
   * @description: 打开抽屉
   * @param {pageType} ['CREATE' | 'EDIT' | 'VIEW',]
   * @param {ele} [PropertyAS] 当前操作的元素
   * @return:
   */
  const openDrawer = (
    pageType: PageType,
    index: number,
    ele?: PropertyInfo
  ): void => {
    enum PAGE_TYPE {
      CREATE = '添加属性',
      EDIT = '编辑属性',
      VIEW = '查看属性',
    }
    const info: OperationInfo = {
      ...operationInfo,
      item: ele,
      itemIndex: index, // 记录一个索引作为编辑创建item的标记，属性里没有唯一不变的字段
      title: PAGE_TYPE[pageType],
      visible: true,
      pageType,
      paramList: propertyList,
    };
    setOperationInfo(info);
  };

  /**
   * @description: 点击添加或者取消，改变信息
   * 添加的时候如果名称重复就提示名称不能重复
   * @param {type} [string] 1-添加，2-编辑，3-取消
   * @return:
   */
  const handleChangeOperation = (param: {
    pageType: PageType;
    itemInfo: PropertyInfo;
  }): void => {
    const { pageType, itemInfo } = param;
    console.log(pageType, itemInfo, 'operationChange---');
    const list = cloneDeep(propertyList);
    /* 给key编号
     * 如果相同的objectName 重复出现就编号，第一个从1开始编号，不重复的不编号
     */
    const No = 0;
    // let nameNo = 0;
    const numReg = /\d*$/;
    /*  -----> 协议修改：不允许存在相同属性实例, 所以不进行编号了
    list.forEach((property: PropertyInfo) => {
      // 功能名称编号
      if (
        property['display-name'].replace(numReg, '') ===
        itemInfo['display-name']
      ) {
        nameNo++;
        property['display-name'] = property['display-name'].replace(
          numReg,
          `${nameNo}`
        );
        console.log(property['display-name']);
      }
      // 存在modelKey表示是物模型中的属性 进行编号
      if (modelKey) {
        property.key = property.key ? property.key : '';
        if (property.key.replace(numReg, '') === itemInfo.id.split(':')[3]) {
          No++;
          property.key = `${modelKey}.${property.key.replace(numReg, `${No}`)}`;
          console.log(property.key);
        }
      } else {
        delete property.key;
      }
    });
    */
    switch (pageType) {
      case 'CREATE':
        if (modelKey) {
          // itemInfo.key = No
          //   ? `${modelKey}.${itemInfo.id.split(':')[3]}${No + 1}`
          //   : `${modelKey}.${itemInfo.id.split(':')[3]}`;
          itemInfo.key = `${modelKey}.${itemInfo.id.split(':')[3]}`;
        } else {
          delete itemInfo.key;
        }
        // itemInfo['display-name'] = nameNo
        //   ? `${itemInfo['display-name']}${nameNo + 1}`
        //   : itemInfo['display-name'];
        list.push(itemInfo);
        break;
      case 'EDIT':
        // 用编过号的名称和key 替换用户填写的名称和标识符
        // itemInfo['display-name'] =
        //   list[operationInfo.itemIndex]['display-name'];
        // if (modelKey) itemInfo.key = list[operationInfo.itemIndex].key;
        // 替换编辑项
        list.splice(operationInfo.itemIndex, 1, itemInfo);

        break;
      default:
        break;
    }
    console.log(list, 'newPropertyList---');
    setPropertyList(list);
    props.change(list);

    setOperationInfo({ ...operationInfo, visible: false });
  };

  // 关闭抽屉
  const closeDrawer = () => {
    setOperationInfo({ ...operationInfo, visible: false });
  };

  /**
   * @description: 点击删除按钮
   * @param {type}
   * @return:
   */
  const handleDel = (param: PropertyInfo, index: number): void => {
    setDelInfo({
      index,
      displayName: param['display-name'],
      visible: true,
    });
  };

  /**
   * @description: 二次弹框确认删除
   * @param {type} [number] 1-确定，2-取消
   * @return:
   */
  const confirmDel = (type: number): void => {
    if (type === 1) {
      const { index } = delInfo;
      const list = cloneDeep(propertyList);
      list.splice(index, 1);
      setPropertyList(list);
      props.change(list);
    }
    setDelInfo({
      ...delInfo,
      visible: false,
    });
  };

  useEffect(() => {
    console.log(props.info.properties, 'popsd---');
    setPropertyList(props.info.properties || []);
  }, [props.info]);
  const numberTypes = [
    'uint8',
    'uint16',
    'uint32',
    'int8',
    'int16',
    'int32',
    'int64',
    'float',
    'double',
  ];
  // 列表
  const columns: ColumnProps<PropertyInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (text: string, record: PropertyInfo, index: number) => index + 1,
    },
    {
      title: '标识符',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (text ? text.split(':')[3] : '--'),
    },
    {
      title: '属性名称',
      dataIndex: 'display-name',
      key: 'display-name',
    },
    {
      title: '值类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string, record: PropertyInfo) => record.valuedef.type,
    },
    {
      title: '值',
      dataIndex: 'valuedef',
      key: 'valuedef',
      render: (text: string, record: PropertyInfo) => (
        <>
          {numberTypes.includes(record.valuedef.type) && (
            <Popover
              content={`[${(record.valuedef.specs as StepInfo).min}-${
                (record.valuedef.specs as StepInfo).max
              }]`}
              overlayClassName="pop-over"
            >
              [{(record.valuedef.specs as StepInfo).min}-
              {(record.valuedef.specs as StepInfo).max}
              ]
              <span className="icon-dowico" />
            </Popover>
          )}

          {record.valuedef.type === 'enum' && (
            <Popover
              content={
                <div className="list-popover-content">
                  <div className="tit">
                    <Row type="flex" justify="space-between">
                      <Col className="gutter-row" sm={10}>
                        传送数据
                      </Col>
                      <Col className="gutter-row" sm={14}>
                        数据说明
                      </Col>
                    </Row>
                  </div>
                  <div className="list">
                    {!!(record.valuedef.specs as EnumInfo).values &&
                      Object.keys(
                        (record.valuedef.specs as EnumInfo).values
                      ).map((ele) => (
                        <div className="item" key={ele}>
                          <Row type="flex" justify="space-between">
                            <Col sm={10}>{ele}</Col>
                            <Col sm={14}>
                              {
                                (record.valuedef.specs as EnumInfo).values[
                                  ele as keyof AllInfo
                                ]
                              }
                            </Col>
                          </Row>
                        </div>
                      ))}
                  </div>
                </div>
              }
              overlayClassName="pop-over"
            >
              枚举值
              <span className="icon-dowico" />
            </Popover>
          )}
          {record.valuedef.type === 'bool' && <>布尔值：0-false; 1-true</>}
          {['string', 'binary'].includes(record.valuedef.type) && (
            <>长度：{(record.valuedef.specs as StringInfo).length}</>
          )}
          {['array'].includes(record.valuedef.type) && (
            <>长度：{(record.valuedef.specs as ArrInfo).size}</>
          )}
          {['struct'].includes(record.valuedef.type) && (
            <>
              json对象个数：
              {(record.valuedef.specs as StrucInfo).members.length}
            </>
          )}
        </>
      ),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string, record: PropertyInfo, index: number) => (
        <>
          {!isView && nodeType !== '4' && (
            <Button
              className="btn"
              type="link"
              onClick={() => openDrawer('EDIT', index, record)}
            >
              编辑
            </Button>
          )}
          <Button
            className="btn"
            type="link"
            onClick={() => openDrawer('VIEW', index, record)}
          >
            查看
          </Button>
          {!isView && nodeType !== '4' && (
            <Button
              className="btn"
              type="link"
              onClick={() => handleDel(record, index)}
            >
              删除
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="fun-property-wrap">
      {/* 工具栏 start */}
      <div className={['tooltip', isView ? 'no-btn' : ''].join(' ')}>
        {!isView && (
          <Button
            className="add-btn"
            disabled={propertyList.length >= 64}
            onClick={() => openDrawer('CREATE', propertyList.length)}
          >
            <span className="icon-add-to" />
            添加属性
          </Button>
        )}
      </div>
      {/* 工具栏 end */}
      {/* 列表区域 start */}
      <div className="property-list">
        <Table
          columns={columns}
          dataSource={propertyList}
          pagination={undefined}
          rowKey={(record) => record.id + record['display-name']}
          locale={{
            emptyText: (
              <Empty
                image={iconNull}
                imageStyle={{
                  height: 80,
                }}
                description={<span>当前无任何属性</span>}
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
        title={operationInfo.title}
        visible={operationInfo.visible}
        width={818}
      >
        <Suspense fallback={null}>
          <ValueDef
            info={operationInfo}
            onChange={handleChangeOperation}
            closeDrawer={closeDrawer}
          />
        </Suspense>
      </Drawer>
      {/* 创建，编辑，查看 end */}
      {/* 删除的二次确认弹框 start */}
      <Modal
        title="删除属性"
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

export default Property;
