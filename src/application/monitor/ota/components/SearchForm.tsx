import { Button, Form, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { QueryJobParams, ThingType, FirmwareData } from '../../types';
import './searchFrom.less';
import { SelectValue } from 'antd/lib/select';
import {
  getThingTypeListRequest,
  queryFirmwareListByThingTypeCode,
} from 'application/monitor/services';

const { Option } = Select;
interface FormProps extends FormComponentProps {
  queryParam: QueryJobParams;
  onSubmit: (submitParam: any) => void;
  queryByStatus?: boolean;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, queryParam, onSubmit, queryByStatus = false }: FormProps, ref) => {
    const statusMap = {
      1: '已创建',
      2: '运行中',
      4: '已取消',
      3: '已完成',
    };

    useImperativeHandle(ref, () => ({
      form,
    }));
    const [firmwareAllList, setFirmwareAllList] = useState<FirmwareData[]>([]);

    const [thingTypeList, setThingTypeList] = useState<ThingType[]>([]);
    useEffect(() => {
      // 获取物类型列表
      const getThingTypeList = async () => {
        const res = await getThingTypeListRequest();
        if (res && res.code === 200) {
          setThingTypeList(res.data);
        }
      };
      getThingTypeList();
    }, []);
    // 查询版本列表
    const getVersionList = useCallback((id?: string) => {
      queryFirmwareListByThingTypeCode({ thingTypeCode: id }).then((res) => {
        if (res.code === 200) {
          setFirmwareAllList(res.data || []);
        }
      });
    }, []);

    // 切换物类型
    const handleThingTypeCodeChange = (value: string) => {
      console.log(value);
      getVersionList(value);

      onSubmit({
        ...queryParam,
        condition: {
          ...queryParam.condition,
          thingTypeCode: value,
        },
        pageNo: 1,
      });
    };

    // 切换版本号
    const versionNoChange = (val: string) => {
      onSubmit({
        ...queryParam,
        condition: {
          ...queryParam.condition,
          versionNo: val,
        },
        pageNo: 1,
      });
    };

    // 切换状态
    const statusChange = (value: SelectValue) => {
      onSubmit({
        ...queryParam,
        condition: {
          ...queryParam.condition,
          status: value,
        },
        pageNo: 1,
      });
    };

    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const values = form.getFieldsValue();

      onSubmit({
        ...queryParam,
        condition: {
          ...values,
        },
        pageNo: 1,
      });
    };
    // 清除
    const resetFields = () => {
      form.setFieldsValue({
        thingTypeCode: '',
        versionNo: '',
        status: '',
      });
      const values = form.getFieldsValue();
      onSubmit({
        ...queryParam,
        condition: {
          ...values,
        },
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
        <Form.Item label="物类型">
          {getFieldDecorator('thingTypeCode', {
            initialValue: queryParam.condition.thingTypeCode,
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
            >
              {thingTypeList.map((v: ThingType, k) => {
                return (
                  <Option key={v.id} value={v.id}>
                    <div className="option-box">
                      <span className="option-name">{v.name}</span>
                      <br />
                      <span className="option-id">ID: {v.id}</span>
                    </div>
                  </Option>
                );
              })}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="固件版本">
          {getFieldDecorator('versionNo')(
            <Select
              style={{ width: 160 }}
              placeholder="请选择固件版本"
              onChange={versionNoChange}
            >
              {firmwareAllList.map((v: FirmwareData, k) => {
                return (
                  <Option key={v.versionNo + v.firmwareId} value={v.versionNo}>
                    {v.versionNo}
                  </Option>
                );
              })}
            </Select>
          )}
        </Form.Item>

        {queryByStatus && (
          <Form.Item label="状态">
            {getFieldDecorator('status', {
              initialValue: queryParam.condition.status,
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
                {Object.keys(statusMap).map((k) => (
                  <Option key={k} value={k}>
                    {statusMap[(k as unknown) as keyof typeof statusMap]}
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
          <Button type="primary" htmlType="reset" onClick={resetFields}>
            清除
          </Button>
        </Form.Item>
      </Form>
    );
  }
);

export default Form.create<FormProps>({ name: 'advanced_search' })(SearchForm);
