import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Form, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { listExistConfig } from '../../services/index';
import { ThingTypeConfigItem, QueryProfileParams } from '../../types';
import './searchFrom.less';

const { Option } = Select;
interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: any) => void;
  queryParam: QueryProfileParams;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, queryParam, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const scopeMap = {
      '1': '全局设备',
      '2': '全局物类型',
      '3': '物类型设备',
    };
    const [scope, setScope] = useState<string>('0');
    const [thingTypeConfig, setThingTypeConfig] = useState<
      ThingTypeConfigItem[]
    >([]);
    // 档案类型变化
    const handleScopeChange = (value: string) => {
      setScope(value);
      if (value !== '3') {
        onSubmit({
          scope: value,
          thingTypeCode: '',
        });
      } else {
        onSubmit({
          scope: value,
          thingTypeCode: '',
        });
        listExistConfig({ scope: 3 })
          .then((res) => {
            if (res.code === 200) {
              setThingTypeConfig(res.data);
            }
          })
          ['catch']((err) => {
            setThingTypeConfig([]);
          });
      }
    };
    const handleThingTypeChange = (value: string) => {
      const values = form.getFieldsValue();
      onSubmit({
        ...values,
        thingTypeCode: value,
      });
    };
    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();
      onSubmit({
        ...values,
      });
    };

    const resetFields = () => {
      form.setFieldsValue({
        scope: '',
        thingTypeCode: '',
      });
    };

    const { getFieldDecorator } = form;

    return (
      <Form className="search-form" onSubmit={handleSearch} layout="inline">
        <Form.Item>
          {getFieldDecorator('scope', { initialValue: queryParam.scope || '' })(
            <Select
              allowClear
              placeholder="选择档案类型"
              onChange={handleScopeChange}
              style={{ width: 160 }}
            >
              <Option value="">全部档案</Option>
              {Object.keys(scopeMap).map((key) => (
                <Option key={key} value={key}>
                  {scopeMap[key as keyof typeof scopeMap]}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {scope === '3' && (
          <Form.Item>
            {getFieldDecorator('thingTypeCode', {
              initialValue: queryParam.thingTypeCode || '',
            })(
              <Select
                placeholder="选择档案类型"
                style={{ width: 160 }}
                onChange={handleThingTypeChange}
              >
                <Option key="" value="">
                  全部物类型
                </Option>
                {thingTypeConfig.map((item) => (
                  <Option key={item.objectId} value={item.objectId}>
                    {item.objectName}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        )}
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
