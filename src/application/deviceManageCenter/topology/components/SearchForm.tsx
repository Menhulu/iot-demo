import { Button, Divider, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, { forwardRef, useImperativeHandle } from 'react';

import './searchFrom.less';
import useInitialList from 'common/customHooks/useInitialList';
import { getThingTypeList } from 'application/thingTypeCenter/services/thingTypeList';

import { UnboundDeviceParams } from '../../types';
import { GetThingTypeListParam } from 'application/modelCenter/types';
import { ThingTypeItem } from '../../../thingTypeCenter/types/index';

const { Option } = Select;
interface FormProps extends FormComponentProps {
  queryUnboundDevicesParam: UnboundDeviceParams;
  onSubmit: (submitParam: UnboundDeviceParams) => void;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, queryUnboundDevicesParam, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const [{ queryParam, list, pagination }, setQueryParam] = useInitialList<
      any,
      GetThingTypeListParam
    >(
      getThingTypeList,
      {
        code: '',
        name: '',
        nodeType: 3,
        pageNo: 1,
        pageSize: 40,
      },
      []
    );
    // 切换物类型
    const handleThingTypeCodeChange = (value: string) => {
      console.log(value);
      onSubmit({
        ...queryUnboundDevicesParam,
        thingTypeCode: value,
        pageNum: 1,
      });
    };
    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();

      onSubmit({
        ...queryUnboundDevicesParam,
        ...values,
        pageNum: 1,
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({
        thingTypeCode: '',
        deviceName: '',
      });
      const values = form.getFieldsValue();
      onSubmit({
        ...queryUnboundDevicesParam,
        ...values,
        pageNum: 1,
      });
    };
    // 下拉框加载更多
    const pageChange = () => {
      if (pagination.pageNo === pagination.lastPage) {
        setQueryParam({
          ...queryParam,
          pageNo: 1,
        });
      } else {
        setQueryParam({
          ...queryParam,
          pageNo: pagination.pageNo + 1,
        });
      }
    };
    const { getFieldDecorator } = form;

    return (
      <Form
        className="search-form"
        onSubmit={handleSearch}
        layout="inline"
        colon={false}
      >
        <Form.Item label="物类型">
          {getFieldDecorator('thingTypeCode', {
            initialValue: queryUnboundDevicesParam.thingTypeCode,
          })(
            <Select
              showSearch
              style={{ width: 160 }}
              dropdownClassName="select-with-id"
              placeholder="选择物类型"
              onChange={handleThingTypeCodeChange}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '4px 0' }} />
                  <div
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      color: '#006569',
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={pageChange}
                  >
                    共{pagination.total}条{' '}
                    {`${
                      pagination.lastPage === pagination.pageNo
                        ? '没有更多了'
                        : '加载更多'
                    }`}
                  </div>
                </div>
              )}
            >
              {list.map((v: ThingTypeItem, k) => {
                return (
                  <Option key={v.code} value={v.code}>
                    <div className="option-box">
                      <span className="option-name">{v.name}</span>
                      <br />
                      <span className="option-id">ID: {v.code}</span>
                    </div>
                  </Option>
                );
              })}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="设备名称">
          {getFieldDecorator('deviceName')(<Input />)}
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
