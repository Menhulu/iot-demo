import { Button, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';
import { QueryRuleListParams } from 'application/ruleEngine/types';
import './searchFrom.less';
import { SelectValue } from 'antd/lib/select';

const { Option } = Select;
interface FormProps extends FormComponentProps {
  queryParam: QueryRuleListParams;
  onSubmit: (submitParam: any) => void;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, queryParam, onSubmit }: FormProps, ref) => {
    const targetTypeMap = {
      kafka: 'Kafka',
      mysql: 'MySQL',
      // 1002: 'RocketMQ',
      // 1005: 'HttpAPI',
      jcq: 'JCQ',
    };

    useImperativeHandle(ref, () => ({
      form,
    }));

    // 切换转发类型
    const targetTypeChange = (value: SelectValue) => {
      onSubmit({
        ...queryParam,
        targetType: value as number,
        pageIndex: 1,
      });
    };

    // 切换状态
    const statusChange = (value: SelectValue) => {
      onSubmit({
        ...queryParam,
        status: value as number,
        pageIndex: 1,
      });
    };

    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();
      onSubmit({
        ...queryParam,
        pageIndex: 1,
        ...values,
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({
        name: '',
        targetType: '',
        status: '',
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
        <Form.Item label="规则名称">
          {getFieldDecorator('name', { initialValue: queryParam.name })(
            <Input
              allowClear
              className="basic-inp-s"
              placeholder="请输入规则名称"
            />
          )}
        </Form.Item>
        <Form.Item label="转发类型">
          {getFieldDecorator('targetType', {
            initialValue: queryParam.targetType,
          })(
            <Select
              allowClear
              style={{ width: 120 }}
              onChange={targetTypeChange}
              placeholder="请选择转发类型"
            >
              <Option key="" value="">
                全部转发类型
              </Option>
              {Object.keys(targetTypeMap).map((k) => (
                <Option key={k} value={k}>
                  {targetTypeMap[(k as unknown) as keyof typeof targetTypeMap]}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="状态">
          {getFieldDecorator('status', {
            initialValue: queryParam.status,
          })(
            <Select
              allowClear
              style={{ width: 120 }}
              onChange={statusChange}
              placeholder="请选择状态"
            >
              <Option key="" value="">
                全部状态
              </Option>
              <Option key="stopped" value="stopped">
                停止
              </Option>
              <Option key="running" value="running">
                运行
              </Option>
            </Select>
          )}
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

export default Form.create<FormProps>({ name: 'advanced_search' })(SearchForm);
