import { Button, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';
import './searchFrom.less';
import { GetThingTypeListParam } from 'application/thingTypeCenter/types';
import { nodeTypeConfig } from 'utils/constants';
const { Option } = Select;
interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: any) => void;
  queryParam: GetThingTypeListParam;
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
      onSubmit({
        code: values.code || '',
        name: values.name || '',
        nodeType: values.nodeType || '',
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({
        code: '',
        name: '',
        nodeType: '',
      });
    };

    const { getFieldDecorator } = form;

    return (
      <Form className="search-form" onSubmit={handleSearch} layout="inline">
        <Form.Item>
          {getFieldDecorator('name', {
            initialValue: queryParam.name,
          })(<Input allowClear placeholder="请输入物类型名称" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('code', {
            initialValue: queryParam.code,
          })(<Input allowClear placeholder="请输入物类型编码" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('nodeType', { initialValue: queryParam.nodeType })(
            <Select
              allowClear
              placeholder="请选择节点类型"
              style={{ width: 200 }}
            >
              <Option value="">全部节点类型</Option>
              {nodeTypeConfig.map((item) => (
                <Option value={item.value} key={item.value}>
                  {item.label}
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
