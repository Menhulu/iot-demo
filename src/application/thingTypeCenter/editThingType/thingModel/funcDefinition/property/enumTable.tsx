/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2020-03-23 12:25:12
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-12 10:33:57
 */
import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  forwardRef,
} from 'react';
import { Table, Form, Popconfirm, Button, Input } from 'antd';
import { cloneDeep } from 'lodash';
import { FormComponentProps } from 'antd/es/form';
import { ColumnProps } from 'antd/es/table';
import { genID } from 'utils/tools';
import Toast from 'components/SimpleToast';
import { enumTextReg, enumTextRule } from './constant';

import './enumTable.less';

const EditableContext = React.createContext<any>({});

interface EnumVal {
  key: string; // 枚举值
  description: string; // 值说明
  id: string; // 唯一表示
}

interface EditColumnProps<T> extends ColumnProps<EnumVal> {
  editable?: boolean; // 是否可以编辑
}
// 可编辑单元格
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: EnumVal;
  handleSave: (record: EnumVal, form: any) => void;
  dataSource: EnumVal[];
  [propName: string]: any;
}

type EditableRowProps = FormComponentProps;

interface EditableProps {
  value?: { [propName: string]: string }[];
  type?: string;
  disabled?: boolean;
  onChange?: (data: { [propName: string]: string }[], form?: any) => void;
}

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
  children,
  dataIndex,
  record,
  handleSave,
  type,
  dataSource,
  ...restProps
}: EditableCellProps): React.ReactElement => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext);

  const validateKey = (rule: any, value: any, callback: any) => {
    const hasConflictKey = dataSource.some((item) => item.key === value);
    if (!value) {
      callback();
      return;
    }
    if (!enumTextReg.test(value)) {
      callback(enumTextRule);
    }
    if (hasConflictKey) {
      callback('枚举值key不能重复');
    }

    callback();
  };

  useEffect(() => {
    if (editing) {
      inputRef && inputRef.current && inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    console.log('toggleEdit----');
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex as keyof EnumVal] });
  };

  const save = (e: any) => {
    form.validateFields((errors: any, values: EnumVal) => {
      if (errors) {
        console.log(errors);
      } else {
        toggleEdit();
        handleSave({ ...record, ...values }, form);
      }
    });
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <>
        {dataIndex === 'key' && (
          <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `${title}必输`,
                },
                {
                  validator: validateKey,
                },
              ],
              initialValue: record[dataIndex],
            })(
              <Input
                ref={inputRef}
                onPressEnter={save}
                onBlur={save}
                maxLength={30}
              />
            )}
          </Form.Item>
        )}
        {dataIndex === 'description' && (
          <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
              rules: [
                { required: true, message: `${title}必输` },
                { pattern: enumTextReg, message: enumTextRule },
              ],
              initialValue: record[dataIndex],
            })(
              <Input
                ref={inputRef}
                onPressEnter={save}
                onBlur={save}
                maxLength={30}
              />
            )}
          </Form.Item>
        )}
      </>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return (
    <td {...restProps}>
      <div>{editable ? childNode : children}</div>
    </td>
  );
};

// 可编辑表格
const EditTable = forwardRef<any, EditableProps>(
  (
    { value, onChange, type, disabled }: EditableProps,
    ref
  ): React.ReactElement => {
    const [dataSource, setDataSource] = useState<EnumVal[]>([]);
    const editable = !disabled;
    console.log(editable);

    let columns: EditColumnProps<EnumVal>[] = [
      {
        title: '枚举值',
        dataIndex: 'key',
        editable,
        width: '40%',
      },
      {
        title: '值说明',
        dataIndex: 'description',
        editable,
        width: '40%',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '20%',

        render: (text, record, index) =>
          dataSource.length > 0 &&
          index > 0 &&
          editable && (
            <Popconfirm
              title="确定要删除"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <a>删除</a>
            </Popconfirm>
          ),
      },
    ];
    columns = columns.map((col: EditColumnProps<EnumVal>) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          type,
          handleSave,
          dataSource,
        }),
      };
    });

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    /**
     * @description: 通过dataSource这种数据格式，edittable中value要的数据
     * @param {type}
     * @return:
     */
    const tableData = (
      data: EnumVal[]
    ): Array<{ [propName: string]: string }> => {
      const newData =
        data.length > 0
          ? data.map((ele) => {
              return { [ele.key]: ele.description };
            })
          : [];

      return newData;
    };
    /**
     * @description: 保存
     * @param {type}
     * @return:
     */
    async function handleSave(row: EnumVal, form1: any) {
      const newData = cloneDeep(dataSource);
      const index = newData.findIndex((item) => row.id === item.id);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      setDataSource(newData);
      const data = tableData(newData);
      onChange && onChange(data);
    }

    /**
     * @description: 点击删除
     * @param {type}
     * @return:
     */
    function handleDelete(id: string) {
      let newData = cloneDeep(dataSource);
      newData = newData.filter((item: EnumVal) => item.id !== id);
      setDataSource(newData);
      const data = tableData(newData);
      // 调用父组件的方法，把数据返回去
      onChange && onChange(data);
    }

    /**
     * @description: 添加枚举值
     * @param {type}
     * @return:
     */

    const handleAdd = (): void => {
      console.log(dataSource, '21212');
      // 如果dataSource中有空的值，弹出错误提示,同时不添加新的数据
      for (const item of dataSource) {
        if (!item.key || !item.description) {
          Toast('枚举值和值类型都是必填项');
          return;
        }
      }
      const transDataSource = dataSource.filter((item) => {
        if (!item.key || !item.description) {
          Toast('枚举值和值类型都是必填项');
        }
        return !!item.key;
      });

      const newData = {
        id: genID(20),
        key: '',
        description: '',
      };
      setDataSource([...transDataSource, newData]);
    };

    useEffect(() => {
      if (value && value.length > 0) {
        const data = value.map((item) => {
          let key = '';
          let description = '';
          Object.keys(item).forEach((i) => {
            key = i;
            description = item[key];
          });
          return {
            key,
            description,
            id: genID(20),
          };
        });
        setDataSource(data);
      } else {
        setDataSource([]);
      }
    }, [value]);

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
          columns={columns}
          pagination={false}
          scroll={{ y: 240 }}
        />
        {editable && (
          <Button
            disabled={dataSource.length >= 64}
            onClick={handleAdd}
            className="add-btn"
          >
            <span className="icon-add-to" />
            添加枚举
          </Button>
        )}
      </div>
    );
  }
);

export default EditTable;
