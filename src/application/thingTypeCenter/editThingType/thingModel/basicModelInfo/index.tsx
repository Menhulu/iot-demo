import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

import { FormComponentProps } from 'antd/lib/form';

import {
  Modal,
  AutoComplete,
  Input,
  Pagination,
  Form,
  Tooltip,
  Tabs,
  Checkbox,
} from 'antd';
import Textarea from 'components/TextArea';
import {
  getModelList,
  queryModelInfo,
} from 'application/modelCenter/services/index';
import { queryAllServiceModel } from '../../../services';
import {
  QueryModelRes,
  ModelListQueryParam,
} from 'application/modelCenter/types/index';
import useInitial from 'common/customHooks/useInitialList';

import {
  displayNameReg,
  displayNameRule,
  objectNameReg,
  objectNameRule,
} from 'utils/constants';
import { ModelInfo } from '../../../types/funcDefinition';

import './index.less';

const { Option } = AutoComplete;
const { TabPane } = Tabs;
interface ModelInfoModalProps extends FormComponentProps {
  visible: boolean;
  data: ModelInfo | undefined;
  modelList: ModelInfo[];
  onCancel: () => void;
  onOk: (val: any) => void;
}
type Ref = FormComponentProps;
const ModelInfoModal = forwardRef<Ref, ModelInfoModalProps>(
  (
    { form, visible, onCancel, onOk, data, modelList }: ModelInfoModalProps,
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const { getFieldDecorator, setFieldsValue } = form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    // const initQueryParam: ModelListQueryParam = {};
    // const [{ queryParam, list, pagination }, setQueryParam] = useInitial<
    //   QueryModelRes,
    //   ModelListQueryParam
    // >(getModelList, initQueryParam, []);
    const [serviceModelData, setServiceModelData] = useState<ModelInfo[]>([]);
    const [selectedModelData, setSelectedModelData] = useState<
      ModelInfo | ModelInfo[]
    >();
    const [modelType, setModelType] = useState<'entity' | 'service'>('entity');
    const [existServiceModelKeys, setExistServiceModelKeys] = useState<any[]>(
      []
    );
    // 初始化表单数据
    useEffect(() => {
      console.log(modelList, data);
      setFieldsValue({
        displayName: data ? data['display-name'] : '',
        objectName: data ? data.key : '',
        desc: data ? data.description : '',
      });
      const $existServiceModelKeys = modelList
        .filter((item) => item.type === 'service')
        .map((sItem) => sItem.key);
      console.log($existServiceModelKeys);
      setExistServiceModelKeys($existServiceModelKeys);
    }, [data, modelList, setFieldsValue]);

    /**
     * @description 查询模型库快速填充
     */
    const handleSearch = (searchText: string) => {
      // setQueryParam({
      //   ...queryParam,
      //   pageNo: 1,
      //   pageSize: 100,
      //   order: '',
      //   isStd: -1,
      //   modelDisplayName: searchText,
      // });
    };
    /**
     * @description  模型名称下拉翻页
     */
    // const pageChange = () => {
    //   const next = queryParam.pageNo ? queryParam.pageNo + 1 : 1;
    //   setQueryParam({ ...queryParam, pageNo: next });
    // };
    /**
     * @description 选择或者输入模型名称
     */

    const displayNameChange = (value: any) => {
      console.log(value);
      // 选择已有的某一模型
      if (value.includes('|')) {
        const [modelName, specName] = value.split('|');

        queryModelInfo({ specName, modelName }).then((res) => {
          setSelectedModelData({
            ...selectedModelData,
            ...JSON.parse(res.data.modelContent),
          });
          setFieldsValue({
            displayName: res.data.modelDisplayName,
            objectName: res.data.modelName,
            desc: res.data.description,
          });
        });
      }
    };
    // 校验标识符重复
    const validateCode = (
      rule: any,
      value: string,
      callback: (message?: string) => void
    ) => {
      if (!modelList) {
        callback();
        return;
      }
      let otherModels = [...modelList];
      let flag = false;
      if (data && data.key) {
        // 编辑态先去掉当前事件
        otherModels = modelList.filter((item) => item.key !== data.key);
      }
      for (const model of otherModels) {
        if (model.key === value) {
          flag = true;
          break;
        }
      }
      if (flag) {
        callback('标识符不能重复');
      } else {
        callback();
      }
    };

    // 切换模型类型
    const changeModelType = (activeKey: any) => {
      setModelType(activeKey);
      if (activeKey === 'service') {
        queryAllServiceModel().then((res) => {
          if (res && res.code === '200') {
            setServiceModelData(res.data || []);
          }
        });
      }
    };
    // 选择服务模型
    const selectServiceModel = (val: any[]) => {
      console.log(val);
      const checkedModelData = val.map((modelName) => {
        const modelItem = serviceModelData.find(
          (item) => item.name === modelName
        );
        if (!modelItem) return false;
        const {
          displayName,
          description,
          type,
          name,
          objectCode,
          spec,
          topic,
        } = modelItem;
        const content = JSON.parse(modelItem.content);
        return {
          id: `urn:${spec}:model:${name}:${objectCode}`,
          'display-name': displayName,
          description,
          type,
          topic,
          key: name,
          ...content,
        };
      });
      setSelectedModelData(checkedModelData);
    };
    // 保存
    const handleSave = () => {
      if (modelType === 'entity') {
        form.validateFields((err, val) => {
          console.log(val);
          if (!err) onOk({ ...selectedModelData, ...val });
        });
      } else {
        console.log(selectedModelData);
        selectedModelData && onOk(selectedModelData);
      }
    };

    // const options = list
    //   .map((model) => (
    //     <Option
    //       key={model.modelName}
    //       title={model.modelName}
    //       value={`${model.modelName}|${model.specName}`}
    //     >
    //       {model.modelDisplayName}（{model.modelName}）
    //       {/* <span className="certain-search-item-count">
    //         {model.isStd ? '标准模型' : '自定义模型'}
    //       </span> */}
    //     </Option>
    //   ))
    //   .concat([
    //     <Option
    //       disabled
    //       key="pagination"
    //       className={pagination.lastPage > 1 ? 'show-pagination' : 'dsn'}
    //     >
    //       <Pagination
    //         simple
    //         hideOnSinglePage
    //         defaultCurrent={pagination.pageNo}
    //         total={pagination.total}
    //         onChange={pageChange}
    //       />
    //     </Option>,
    //   ]);
    return (
      <Modal
        title={data ? '编辑模型' : '新建模型'}
        centered
        visible={visible}
        okText="确认"
        cancelText="取消"
        onOk={handleSave}
        onCancel={onCancel}
        wrapClassName="model-info-modal"
      >
        <div className="content">
          <Tabs
            defaultActiveKey="entity"
            activeKey={modelType}
            onChange={changeModelType}
          >
            <TabPane key="entity" tab="实体模型">
              <Form {...formItemLayout}>
                {data && data.key ? (
                  <Form.Item label="模型名称" className="flex-form-item">
                    {getFieldDecorator('displayName', {
                      rules: [
                        { required: true, message: '请输入模型名称' },
                        { pattern: displayNameReg, message: displayNameRule },
                      ],
                    })(<Input maxLength={30} placeholder="请输入模型名称" />)}
                    <Tooltip title={displayNameRule}>
                      <span className="primary-color rule">查看规则</span>
                    </Tooltip>
                  </Form.Item>
                ) : (
                  <Form.Item label="模型名称" className="flex-form-item">
                    {/* {getFieldDecorator('displayName', {
                  rules: [
                    { required: true, message: '请输入模型名称' },
                    { pattern: displayNameReg, message: displayNameRule },
                    { validator: validateDisplayNameLength },
                  ],
                })(
                  <AutoComplete
                    dataSource={options}
                    onSearch={handleSearch}
                    onSelect={displayNameChange}
                    optionLabelProp="title"
                    placeholder="请输入模型名称"
                    getPopupContainer={(triggerNode: HTMLElement) =>
                      triggerNode.parentNode as HTMLElement
                    }
                  />
                )} */}
                    {getFieldDecorator('displayName', {
                      rules: [
                        { required: true, message: '请输入模型名称' },
                        { pattern: displayNameReg, message: displayNameRule },
                      ],
                    })(<Input maxLength={30} placeholder="请输入模型名称" />)}
                    <Tooltip title={displayNameRule}>
                      <span className="primary-color rule">查看规则</span>
                    </Tooltip>
                  </Form.Item>
                )}

                <Form.Item label="模型标识" className="flex-form-item">
                  {getFieldDecorator('objectName', {
                    rules: [
                      { required: true, message: '请输入模型标识' },
                      { pattern: objectNameReg, message: objectNameRule },
                      { validator: validateCode },
                    ],
                  })(
                    <Input
                      disabled={!!data && !!data.key}
                      maxLength={30}
                      placeholder="请输入模型标识"
                    />
                  )}
                  <Tooltip title={objectNameRule}>
                    <div className="primary-color rule">查看规则</div>
                  </Tooltip>
                </Form.Item>
                <Form.Item label="模型描述">
                  {getFieldDecorator('desc')(<Textarea maxLength={200} />)}
                </Form.Item>
                {getFieldDecorator('type', { initialValue: 'entity' })(
                  <Input type="hidden" />
                )}
              </Form>
            </TabPane>
            <TabPane key="service" tab="服务模型">
              <Checkbox.Group
                onChange={selectServiceModel}
                defaultValue={existServiceModelKeys}
              >
                {serviceModelData.map((item) => (
                  <Checkbox
                    value={item.name}
                    key={item.id}
                    disabled={
                      (!!data && !!data.key) ||
                      existServiceModelKeys.includes(item.name)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    );
  }
);
export default Form.create<ModelInfoModalProps>()(ModelInfoModal);
