import { Button, Form, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';
import './searchFrom.less';

interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: any) => void;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();
      onSubmit({
        ...values,
      });
    };

    const { getFieldDecorator } = form;

    return (
      <Form className="search-form" onSubmit={handleSearch} layout="inline">
        <Form.Item>
          {getFieldDecorator('displayName')(
            <Input allowClear placeholder="请输入模型名称" />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
            }}
          >
            清除
          </Button>
        </Form.Item>
      </Form>
    );
  }
);

export default Form.create<FormProps>({ name: 'advanced_search' })(SearchForm);
