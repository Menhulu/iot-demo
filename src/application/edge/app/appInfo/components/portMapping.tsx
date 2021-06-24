import React, { useState, forwardRef, useEffect, useRef } from 'react';

import EditTable, { EditColumnProps } from 'components/EditTable';
import { PortMappingItem } from '../../../types';

import { Popconfirm, Tooltip } from 'antd';
import { uniqueId } from 'lodash';

interface PortMappingProps {
  value?: PortMappingItem[];
  disabled?: boolean;
  onChange?: (data: PortMappingItem[]) => void;
}

const PortMapping: React.FC<PortMappingProps> = forwardRef<
  any,
  PortMappingProps
>(({ value, disabled, onChange }, ref) => {
  const [dataSource, setDataSource] = useState<PortMappingItem[]>(value || []);

  useEffect(() => {
    const data = value?.length
      ? value.map((item) => {
        item.id = uniqueId('portMapping_');
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
        containerPort: null,
        hostPort: null,
        protocol: 'tcp',
        id: uniqueId('portMapping_'),
      },
    ]);
  };
  // 保存一行的数据
  const onSave = (data: PortMappingItem) => {
    const index = dataSource.findIndex((item) => item.id === data.id);
    dataSource.splice(index, 1, data);
    setDataSource([...dataSource]);
    onChange && onChange(dataSource);
  };

  const validateRange = (rule: any, value: any, callback: any) => {
    if (value > 65535 || value < 1) {
      callback('端⼝取值范围1～65535');
    }
    callback();
  };
  const columns: EditColumnProps<PortMappingItem>[] = [
    {
      title: (
        <>
          容器内端口
          <Tooltip title="端⼝取值范围1～65535">
            <span className="icon-help ml-10"></span>
          </Tooltip>
        </>
      ),
      dataIndex: 'containerPort',
      editable: true,
      width: '30%',
      rules: [
        { pattern: /^[1-9][0-9]+$/, message: '请输入正确的端口号' },
        { validator: validateRange },
      ],
    },
    {
      title: (
        <>
          宿主机端口
          <Tooltip title="端⼝取值范围1～65535">
            <span className="icon-help ml-10"></span>
          </Tooltip>
        </>
      ),
      dataIndex: 'hostPort',
      editable: true,
      width: '30%',
      rules: [
        { pattern: /^[1-9][0-9]+$/, message: '请输入正确的端口号' },
        { validator: validateRange },
      ],
    },
    // {
    //   title: '类型',
    //   dataIndex: 'protocol',
    //   editable: true,
    //   width: '25%',
    //   isEnum: true,
    //   selectOptions: [
    //     { label: 'TCP', val: 'tcp' },
    //     { label: 'UDP', val: 'udp' },
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
        name="端口映射"
        dataSource={dataSource}
        columns={columns}
        onSave={onSave}
        onAdd={onAdd}
        disabled={disabled}
        totalLimit={10}
      />
    </div>
  );
});
export default PortMapping;
