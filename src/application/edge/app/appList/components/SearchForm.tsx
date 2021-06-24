import { Button, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';

import { QueryEdgeAppParam } from '../../../types';
import { type } from '../../../constants';

const { Option } = Select;
interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: Partial<QueryEdgeAppParam>) => void;
  queryParam: QueryEdgeAppParam;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, queryParam, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();
      console.log(values);
      onSubmit({
        condition: {
          code: values.code ? values.code : undefined,
          name: values.name ? values.name : undefined,
          type: values.type ? values.type : undefined,
        },
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({ name: '', code: '', type: '' });
    };

    const { getFieldDecorator } = form;

    return (
      <Form
        className="search-form mt-10"
        onSubmit={handleSearch}
        layout="inline"
      >
        <Form.Item>
          {getFieldDecorator('name', {
            initialValue: queryParam.condition.name,
          })(<Input allowClear placeholder="请输入应用名称" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('code', {
            initialValue: queryParam.condition.code,
          })(<Input allowClear placeholder="请输入应用编码" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('type', {
            initialValue: queryParam.condition.type,
          })(
            <Select
              allowClear
              placeholder="请选择应用类型"
              style={{ width: 200 }}
            >
              <Option value="">全部节点类型</Option>
              {Object.keys(type).map((k) => (
                <Option value={k} key={k}>
                  {type[(k as unknown) as keyof typeof type]}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button type="primary" onClick={resetFields}>
            清除
          </Button>
        </Form.Item>
      </Form>
    );
  }
);

export default Form.create<FormProps>({ name: 'advanced_search' })(SearchForm);
