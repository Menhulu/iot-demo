/**
 * @author: zhaohongyun1@jd.com
 * @description: 输出参数表格，通过onChange属性将数据传回外层表单，通过value拿到上层表单域的值
 * 在这里添加或者编辑参数，又滑出一层定义属性的drawer
 */
import React, { forwardRef, useState, useEffect } from 'react';
import { Button, Drawer } from 'antd';
import Table from 'components/Table';

import { ColumnProps } from 'antd/lib/table';
import { cloneDeep } from 'lodash';

import ValueDef from '../property/valueDef';
import {
  PropertyInfo,
  OperationInfo,
  PageType,
} from '../../../../types/funcDefinition';

type OutParamsTableProps = {
  value?: PropertyInfo[];
  onChange?: (val: PropertyInfo[]) => void;
  disabled: boolean;
  hasModelKey: boolean;
};
const OutParamsTable = forwardRef<any, OutParamsTableProps>(
  (props: OutParamsTableProps, ref) => {
    const { disabled, hasModelKey } = props;
    const initOutParamsInfo: OperationInfo = {
      title: '添加参数',
      visible: false,
      pageType: 'CREATE',
      item: null,
      paramList: props.value || [],
      itemIndex: props.value ? props.value.length : 0,
    };
    const [outParamsInfo, setOutParamsInfo] = useState<OperationInfo>(
      initOutParamsInfo
    );
    const [paramList, setParamList] = useState<PropertyInfo[]>([]);
    const [drawerShow, setDrawerShow] = useState(false);
    useEffect(() => {
      setParamList(props.value || []);
    }, [props.value]);
    // 创建或编辑输出参数
    const openParamDrawer = (
      pageType: PageType,
      index: number,
      record?: PropertyInfo
    ) => {
      enum PAGE_TYPE {
        CREATE = '添加输出参数',
        EDIT = '编辑输出参数',
        VIEW = '查看输出参数',
      }
      const info: OperationInfo = {
        ...outParamsInfo,
        item: record,
        itemIndex: index,
        title: PAGE_TYPE[pageType],
        visible: true,
        pageType,
        paramList,
      };
      setOutParamsInfo(info);
      setDrawerShow(true);
    };
    /*
     * 添加一条数据，通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
     */
    const addOutParams = (param: {
      pageType: PageType;
      itemInfo: PropertyInfo;
    }) => {
      const { pageType, itemInfo } = param;

      if (hasModelKey) itemInfo.key = `${itemInfo.id.split(':')[3]}`;
      const newList = cloneDeep(paramList);
      switch (pageType) {
        case 'CREATE':
          newList.push(itemInfo);
          break;
        case 'EDIT':
          newList.splice(outParamsInfo.itemIndex, 1, itemInfo);
          console.log(newList, 'newlist---');
          break;
        default:
          break;
      }
      console.log('newEventParamsList', newList);
      setParamList(newList);
      // 通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
      props.onChange && props.onChange(newList);

      setDrawerShow(false);
    };
    /*
     * 删除一条数据，通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
     */
    const delOutParams = (record: PropertyInfo, index: number) => {
      paramList.splice(index, 1);
      // 通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
      console.log(paramList);
      setParamList(paramList);
      props.onChange && props.onChange(paramList);
    };

    const onClose = () => {
      setDrawerShow(false);
    };
    const columns: ColumnProps<PropertyInfo>[] = [
      {
        title: '名称',
        dataIndex: 'display-name',
        key: 'display-name',
        align: 'center',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        render: (text: string, record: PropertyInfo, index: number) => (
          <>
            {disabled ? (
              <Button
                title="查看"
                type="link"
                onClick={() => openParamDrawer('VIEW', index, record)}
              >
                查看
              </Button>
            ) : (
              <>
                <Button
                  title="编辑"
                  type="link"
                  onClick={() => openParamDrawer('EDIT', index, record)}
                >
                  编辑
                </Button>
                |
                <Button
                  title="删除"
                  type="link"
                  onClick={() => delOutParams(record, index)}
                >
                  删除
                </Button>
              </>
            )}
          </>
        ),
      },
    ];

    return (
      <div ref={ref}>
        {Array.isArray(paramList) && !!paramList.length && (
          <Table
            rowKey={record => record.id}
            columns={columns}
            dataSource={paramList}
            className="param-table"
          />
        )}

        {!disabled && (
          <Button
            disabled={paramList.length >= 20}
            className="add-btn"
            onClick={() => openParamDrawer('CREATE', paramList.length)}
          >
            <span className="icon-add-to" />
            添加数据
          </Button>
        )}

        <Drawer
          placement="right"
          closable={false}
          title={outParamsInfo.title}
          visible={drawerShow}
          width={818}
        >
          <ValueDef
            info={outParamsInfo}
            onChange={addOutParams}
            closeDrawer={onClose}
          />
        </Drawer>
      </div>
    );
  }
);

export default OutParamsTable;
