import React, { useState, forwardRef, useEffect, useRef } from 'react';

import EditTable, { EditColumnProps } from 'components/EditTable';
import { VolumeItem } from '../../../types';

import { Popconfirm, Tooltip } from 'antd';
import { uniqueId } from 'lodash';

interface VolumeProps {
  value?: VolumeItem[];
  disabled?: boolean;
  onChange?: (data: VolumeItem[]) => void;
}

const Volume: React.FC<VolumeProps> = forwardRef<any, VolumeProps>(
  ({ value, disabled, onChange }, ref) => {
    const [dataSource, setDataSource] = useState<VolumeItem[]>(value || []);
    useEffect(() => {
      const data = value?.length
        ? value.map((item) => {
            item.id = uniqueId('volume_');
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
      setDataSource([
        ...dataSource,
        {
          target: '',
          source: '',
          access: 'r',
          id: uniqueId('volume'),
        },
      ]);
    };
    // 保存一行的数据
    const onSave = (data: VolumeItem) => {
      const index = dataSource.findIndex((item) => item.id === data.id);
      dataSource.splice(index, 1, data);
      setDataSource([...dataSource]);
      onChange && onChange(dataSource);
    };
    const columns: EditColumnProps<VolumeItem>[] = [
      {
        title: (
          <>
            源路径
            <Tooltip title="1~128个字符，不支持空格">
              <span className="icon-help ml-10"></span>
            </Tooltip>
          </>
        ),

        dataIndex: 'source',
        editable: true,
        maxLength: 128,
        width: '30%',
        rules: [{ pattern: /^\S{1,128}$/, message: '1~128个字符，不支持空格' }],
      },
      {
        title: (
          <>
            目的路径
            <Tooltip title="绝对路径，不支持根目录，以/开头，2~128个字符，不支持空格">
              <span className="icon-help ml-10"></span>
            </Tooltip>
          </>
        ),

        dataIndex: 'target',
        editable: true,
        width: '30%',
        maxLength: 128,
        rules: [
          {
            pattern: /^\/\S{1,127}$/,
            whitespace: true,
            message: '绝对路径，不支持根目录，以/开头，2~128个字符，不支持空格',
          },
          { min: 2, message: '2~128个字符' },
        ],
      },
      // {
      //   title: '读写权限',
      //   dataIndex: 'access',
      //   editable: true,
      //   width: '25%',
      //   isEnum: true,
      //   selectOptions: [
      //     { label: '只读', val: 'r' },
      //     { label: '只写', val: 'w' },
      //   ],
      // },
    ];
    if (!disabled) {
      columns.push({
        title: '操作',
        dataIndex: 'operation',
        width: '15%',
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
          name="卷映射"
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
export default Volume;
