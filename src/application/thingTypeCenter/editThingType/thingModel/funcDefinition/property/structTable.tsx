import React, { forwardRef, useState, useEffect } from 'react';
import { Button, Drawer } from 'antd';
import Table from 'components/Table';

import { ColumnProps } from 'antd/lib/table';
import { cloneDeep } from 'lodash';

import StructValueDef from './structValueDef';
import {
  StrcutParamsInfo,
  OperationInfo,
  PageType,
} from '../../../../types/funcDefinition';

type StructTableProps = {
  value?: StrcutParamsInfo[];
  onChange?: (val: StrcutParamsInfo[]) => void;
  disabled: boolean;
};
const StructTable = forwardRef<any, StructTableProps>(
  (props: StructTableProps, ref) => {
    const { disabled } = props;
    const [strcutList, setStrcutList] = useState<StrcutParamsInfo[]>(
      props.value || []
    );
    const initStrcutParamsInfo: OperationInfo = {
      title: '添加参数',
      visible: false,
      pageType: 'CREATE',
      item: null,
      itemIndex: strcutList.length,
      paramList: strcutList,
    };
    const [strcutParamsInfo, setStrcutParamsInfo] = useState<OperationInfo>(
      initStrcutParamsInfo
    );
    const [drawerShow, setDrawerShow] = useState(false);

    useEffect(() => {
      setStrcutList(props.value || []);
    }, [props.value]);

    // 创建或编辑struct类型的参数
    const openParamDrawer = (
      pageType: PageType,
      index: number,
      record?: StrcutParamsInfo
    ) => {
      enum PAGE_TYPE {
        CREATE = '添加属性',
        EDIT = '编辑属性',
        VIEW = '查看属性',
      }

      const info: OperationInfo = {
        item: record,
        itemIndex: index,
        title: PAGE_TYPE[pageType],
        visible: true,
        pageType,
        paramList: strcutList,
      };
      setStrcutParamsInfo(info);
      setDrawerShow(true);
    };
    /*
     * 添加一条数据，通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
     */
    const addStructProps = (param: {
      pageType: PageType;
      itemInfo: StrcutParamsInfo;
    }) => {
      const { pageType, itemInfo } = param;

      // 只有新建的添加和编辑的保存才会更新数据

      const newList = cloneDeep(strcutList);
      switch (pageType) {
        case 'CREATE':
          newList.push(itemInfo);
          break;
        case 'EDIT':
          newList.splice(strcutParamsInfo.itemIndex, 1, itemInfo);
          console.log(strcutList, 'newlist---');
          break;
        default:
          break;
      }
      console.log('newStructParamsList', newList);
      setStrcutList(newList);

      // 通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
      props.onChange && props.onChange(newList);
      setDrawerShow(false);
    };
    /*
     * 删除一条数据，通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
     */
    const delStruct = (record: StrcutParamsInfo, index: number) => {
      strcutList.splice(index, 1);
      setStrcutList(strcutList);
      // 通过onChange使表单控件能够通过geFieldsValue或者validField获取到结果
      props.onChange && props.onChange(strcutList);
    };

    const onClose = () => {
      setDrawerShow(false);
    };
    const columns: ColumnProps<StrcutParamsInfo>[] = [
      {
        title: '名称',
        dataIndex: 'key',
        key: 'key',
        align: 'center',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        align: 'center',
        render: (text: string, record: StrcutParamsInfo, index: number) => (
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
                  disabled={disabled}
                  title="编辑"
                  type="link"
                  onClick={() => openParamDrawer('EDIT', index, record)}
                >
                  编辑
                </Button>
                |
                <Button
                  disabled={disabled}
                  title="删除"
                  type="link"
                  onClick={() => delStruct(record, index)}
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
        {Array.isArray(strcutList) && strcutList.length && (
          <Table
            rowKey={record => record.key}
            columns={columns}
            dataSource={strcutList}
            className="param-table"
          />
        )}
        {!disabled && (
          <Button
            disabled={strcutList.length >= 64}
            className="add-btn"
            onClick={() => openParamDrawer('CREATE', strcutList.length)}
          >
            <span className="icon-add-to" />
            添加数据
          </Button>
        )}

        <Drawer
          placement="right"
          title={strcutParamsInfo.title}
          visible={drawerShow}
          width={818}
          closable={false}
        >
          <StructValueDef
            info={strcutParamsInfo}
            onOk={addStructProps}
            onClose={onClose}
          />
        </Drawer>
      </div>
    );
  }
);

export default StructTable;
