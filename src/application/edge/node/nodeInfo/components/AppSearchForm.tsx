import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Form, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { getEdgeAppList } from 'application/edge/service';
import { EdgeAppItem, QueryEdgeAppParam } from 'application/edge/types';
const { Option } = Select;
interface FormProps extends FormComponentProps {
  changeApp: (param: string) => void;
}
const SearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, changeApp }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const { getFieldDecorator } = form;
    const [appList, setAppList] = useState<Array<EdgeAppItem>>([]);

    const getEdgeAppVersionAllList = async () => {
      const initAppListParam: QueryEdgeAppParam = {
        condition: {},
        pageNo: 1,
        pageSize: 200,
      };
      try {
        const res = await getEdgeAppList(initAppListParam);
        if (res && res.code === 200) {
          setAppList(res.data && res.data.list);
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      getEdgeAppVersionAllList();
    }, []);

    return (
      <Form className="search-form mt-10" layout="inline">
        <Form.Item label="选择应用">
          {getFieldDecorator('name', {
            initialValue: '',
          })(
            <Select
              allowClear
              placeholder="请选择应用"
              style={{ width: 200 }}
              onChange={changeApp}
            >
              {appList &&
                Array.isArray(appList) &&
                appList.map((app: EdgeAppItem) => {
                  return (
                    <Option key={app.id} value={app.id}>
                      {app.name}
                    </Option>
                  );
                })}
            </Select>
          )}
        </Form.Item>
      </Form>
    );
  }
);
export default Form.create<FormProps>({ name: 'advanced_search' })(SearchForm);
