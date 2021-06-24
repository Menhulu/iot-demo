/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2021-01-11 18:18:38
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-17 21:17:07
 */
import React, { useRef, useContext, forwardRef } from 'react';
import { Table, Form, Button, Input, Select } from 'antd';

import { FormComponentProps } from 'antd/es/form';
import { ColumnProps } from 'antd/es/table';
import './index.less';

const { Option } = Select;
const EditableContext = React.createContext<any>({});

// 可编辑单元格
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  onSave: (record: any) => void;
  [propName: string]: any;
}

type EditableRowProps = FormComponentProps;

// 可编辑表格的行
const EditableRow = ({ form, ...props }: any): React.ReactElement => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create<EditableRowProps>()(EditableRow);

// 可编辑单元格
const EditableCell = ({
  title,
  editable,
  disabled,
  children,
  dataIndex,
  // 行数据
  record,
  // 行号
  index,
  onSave,
  type,
  maxLength,
  isEnum = false,
  selectOptions,
  rules,
  ...restProps
}: EditableCellProps): React.ReactElement => {
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext);
  console.log('EditTable==>59', dataIndex);
  const save = (e: any) => {
    form.validateFields((errors: any, values: any) => {
      if (errors) {
        console.log(errors);
        // form.resetFields();
        return;
      } else {
        console.log(record, values);
        onSave({ ...record, ...values });
      }
    });
  };

  let childNode = children;
  try {
    if (isEnum && !selectOptions) throw Error('枚举类型必须设置枚举值');
    if (editable && !!dataIndex) {
      if (isEnum) {
        childNode = (
          <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
              initialValue: record[dataIndex],
            })(
              <Select onChange={save} disabled={disabled}>
                {selectOptions.map((item: any) => (
                  <Option key={item.val} value={item.val}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        );
      } else {
        childNode = (
          <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
              // rules: [...rules],
              initialValue: record[dataIndex],
            })(
              <Input
                ref={inputRef}
                onPressEnter={save}
                onBlur={save}
                maxLength={maxLength}
                disabled={disabled}
              />
            )}
          </Form.Item>
        );
      }
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <td {...restProps}>
      <div>{editable ? childNode : children}</div>
    </td>
  );
};

interface EditableProps extends FormComponentProps {
  name: string;
  columns: any[];
  dataSource?: any[];
  totalLimit?: number; // 表格数据条数限制
  type?: string;
  disabled?: boolean;
  onAdd?: () => void;
  onSave?: (record: any) => void;
}
export interface EditColumnProps<T> extends ColumnProps<any> {
  isEnum?: boolean;
  selectOptions?: any[];
  editable?: boolean; // 是否可以编辑
  maxLength?: number;
  rules?: (
    | { [propName: string]: any; message: string }
    | { validator: (rule: any, value: any, callback: any) => void }
  )[];
  tips?: string;
}

// 可编辑表格
const EditTable = forwardRef<any, EditableProps>(
  (
    {
      form,
      name,
      dataSource = [],
      type,
      disabled,
      columns,
      totalLimit = 10,
      onAdd,
      onSave,
    }: EditableProps,
    ref
  ): React.ReactElement => {
    const editable = !disabled;

    const _columns = columns.map((col: EditColumnProps<any[]>) => {
      if (!col.editable || disabled) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any, index: number) => ({
          // 行数据
          record,
          // 行号
          index,
          editable: col.editable,
          dataIndex: col.dataIndex,
          disabled: disabled,
          title: col.title,
          isEnum: col.isEnum,
          selectOptions: col.selectOptions,
          rules: col.rules,
          maxLength: col.maxLength,
          type,
          onSave,
        }),
      };
    });

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    return (
      <div
        ref={ref}
        className={['editTable', disabled ? 'disabled' : ''].join(' ')}
      >
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          rowKey={(record) => record.id}
          bordered
          dataSource={dataSource}
          columns={_columns}
          pagination={false}
        />
        {!!onAdd && editable && (
          <Button
            onClick={onAdd}
            className="add-btn"
            type="link"
            disabled={dataSource.length >= totalLimit}
          >
            添加{name}
            {dataSource.length}/{totalLimit}
          </Button>
        )}
      </div>
    );
  }
);

export default Form.create<EditableProps>()(EditTable);
