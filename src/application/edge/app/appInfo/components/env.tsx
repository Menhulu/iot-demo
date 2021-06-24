import React, { useState, forwardRef, useEffect, useRef } from 'react';

import EditTable, { EditColumnProps } from 'components/EditTable';
import { EnvVal } from '../../../types';

import { Popconfirm, Tooltip } from 'antd';
import { uniqueId } from 'lodash';

interface EnvProps {
  value?: EnvVal[];
  disabled?: boolean;
  onChange?: (data: EnvVal[]) => void;
}

const Env: React.FC<EnvProps> = forwardRef<any, EnvProps>(
  ({ value, disabled, onChange }, ref) => {
    const tableRef = useRef<any>();
    const [dataSource, setDataSource] = useState<EnvVal[]>(value || []);

    useEffect(() => {
      const data = value?.length
        ? value.map((item) => {
            item.id = uniqueId('env_');
            return item;
          })
        : [];
      setDataSource(data);
    }, [value]);
    //  删除一行
    const onDelete = (val: any) => {
      const newData = dataSource.filter((item) => item.id !== val);
      setDataSource(newData);
      onChange && onChange(newData);
    };
    // 新增一行
    const onAdd = () => {
      tableRef.current.validateFields((errors: any[], values: any) => {
        console.log(errors);
        if (!errors) {
          onChange &&
            onChange([
              ...dataSource,
              { key: '', value: '', id: uniqueId('env_') },
            ]);
          setDataSource([
            ...dataSource,
            { key: '', value: '', id: uniqueId('env_') },
          ]);
        }
      });
    };
    // 保存一行的数据
    const onSave = (data: EnvVal) => {
      const index = dataSource.findIndex((item) => item.id === data.id);
      dataSource.splice(index, 1, data);
      setDataSource([...dataSource]);
      onChange && onChange(dataSource);
    };
    const columns: EditColumnProps<EnvVal>[] = [
      {
        title: (
          <>
            名称
            <Tooltip title="以字母开头，只能包含字母、数字和下划线，1~128个字符">
              <span className="icon-help ml-10"></span>
            </Tooltip>
          </>
        ),

        dataIndex: 'key',
        editable: true,
        width: '40%',
        maxLength: 128,
        rules: [
          { required: true, message: '名称不能为空' },
          {
            pattern: /^[a-zA-Z]+[a-zA-Z0-9_]*$/,
            message: '以字母开头，只能包含字母、数字和下划线，1~128个字符',
          },
        ],
      },
      {
        title: (
          <>
            值
            <Tooltip title="1~128个字符">
              <span className="icon-help ml-10"></span>
            </Tooltip>
          </>
        ),

        dataIndex: 'value',
        editable: true,
        width: '40%',
        maxLength: 128,
        rules: [],
      },
    ];
    if (!disabled) {
      columns.push({
        title: '操作',
        dataIndex: 'operation',
        width: '20%',
        render: (text: any, record) => (
          <>
            <Popconfirm
              title="确定要删除"
              okText="确定"
              cancelText="取消"
              onConfirm={() => onDelete(record.id)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
      });
    }
    return (
      <div className="env">
        <EditTable
          name="环境变量"
          ref={tableRef}
          dataSource={dataSource}
          columns={columns}
          onSave={onSave}
          onAdd={onAdd}
          disabled={disabled}
          totalLimit={10}
        />
      </div>
    );
  }
);
export default Env;
