/*
 * @Author: shaoym
 * @Date: 2021-03-09 14:53:35
 * @LastEditTime: 2021-03-10 16:09:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 */
import { Button, Form, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';

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

      Object.keys(values).forEach((item: string) => {
        // 删除属性值为空值的字段
        if (values[item] === '') {
          Reflect.deleteProperty(values, item);
        }
      });

      onSubmit({
        condition: {
          ...values,
        },
        pageNo: 1,
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({
        endpoint: null,
        bucket: null,
      });
      onSubmit({
        pageNo: 1,
      });
    };

    const { getFieldDecorator } = form;

    return (
      <Form
        className="search-form"
        onSubmit={handleSearch}
        layout="inline"
        colon={false}
      >
        <Form.Item label="">
          {getFieldDecorator('endpoint', {
            initialValue: '',
          })(<Input placeholder="请输入Endpoint" />)}
        </Form.Item>

        <Form.Item label="">
          {getFieldDecorator('bucket')(<Input placeholder="请输入Bucket" />)}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button type="primary" htmlType="reset" onClick={resetFields}>
            清除
          </Button>
        </Form.Item>
      </Form>
    );
  }
);

export default Form.create<FormProps>({})(SearchForm);
