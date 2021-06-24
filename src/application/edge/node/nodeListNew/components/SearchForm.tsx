import { Button, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, {
  forwardRef,
  useImperativeHandle,
} from 'react';
import './index.less';

const { Option } = Select;

interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: any) => void;
}

const AdvancedSearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    // 设备状态选项
    const statusOption = {
      // 0: '停用',
      1: '未激活',
      2: '离线',
      3: '在线',
    };


    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      onSubmit({
        nodeType: 4
      });
    };

    // 重置
    const handleReset = () => {
      form.resetFields();
    };

    const { getFieldDecorator } = form;

    return (
      <Form className="search-form mt-10" onSubmit={handleSearch} layout="inline">
        <Form.Item>
          {getFieldDecorator(`deviceName`)(
            <Input placeholder="请输入边缘节点名称" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(`deviceId`)(<Input placeholder="请输入设备ID" />)}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator(`status`, {
            initialValue: 999,
          })(
            <Select
              allowClear
              placeholder="请选择节点状态"
              style={{ width: 150 }}
            >
              <Option value={999}>全部状态</Option>
              {Object.keys(statusOption).map((k) => (
                <Option value={parseInt(k, 10)} key={k}>
                  {
                    statusOption[
                    (k as unknown) as keyof typeof statusOption
                    ]
                  }
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Button type="primary" htmlType="submit">
          搜索
            </Button>
        <Button
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={handleReset}
        >
          清除
            </Button>
      </Form>
    );
  }
);

export default Form.create<FormProps>({ name: 'advanced_search' })(
  AdvancedSearchForm
);
