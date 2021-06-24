import React, { useEffect } from 'react';
import { Form, Input, Button, Row, Col, Tooltip, Radio } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { useHistory, useParams, RouteComponentProps } from 'react-router-dom';
import SimpleToast from 'components/SimpleToast/index';

import Textarea from 'components/TextArea/index';

import ModelContent from 'application/thingTypeCenter/editThingType/thingModel/funcDefinition/index';
import {
  displayNameReg,
  displayNameRule,
  objectNameReg,
  objectNameRule,
} from 'utils/constants';
import {
  createModel,
  editModel,
  queryModelInfo,
  checkModelContent,
} from '../services';
import './index.less';
import { ModelInfo } from '../types';

// 创建的表单
interface ModelFormProps extends FormComponentProps, RouteComponentProps {
  setFormDirty: (flag: boolean) => void;
}
function ModelForm(props: ModelFormProps) {
  const history = useHistory();
  const { name, specName } = useParams<{ name: string; specName: string }>();
  const { getFieldDecorator, setFieldsValue } = props.form;

  useEffect(() => {
    if (!name) return;
    const getModelDetail = async () => {
      try {
        const res = await queryModelInfo({ modelName: name, specName });
        if (res.code.toString() === '200') {
          const {
            modelDisplayName,
            modelName,
            modelType,
            description,
            modelContent,
            id,
          } = res.data;
          setFieldsValue({
            id,
            modelDisplayName,
            modelName,
            modelType,
            description,
            modelContent: JSON.parse(modelContent),
          });
          props.setFormDirty(false);
        }
      } catch (error) {
        //
      }
    };
    getModelDetail();
  }, [name, props, setFieldsValue, specName]);
  /**
   * @description: 校验json是否合法，前端校验
   * 1：前端校验是否是合法的json
   * 2：前端首次校验：传入空对象，属性，事件，服务都为空的时候不行，有一个为空可以
   * @param {type}
   * @return:
   */
  const handleCheckJson = (infoStr: string): boolean => {
    const content = infoStr.trim();
    if (!content) return false;
    let isPermission = true;
    try {
      const jsonObj: ModelInfo = JSON.parse(content);
      const { properties, events, functions } = jsonObj;
      // 如果是个空对象
      if (Object.keys(jsonObj).length === 0) {
        SimpleToast('模型内容不正确');
        isPermission = false;
        return false;
      }
      if (
        properties &&
        properties.length === 0 &&
        events &&
        events.length === 0 &&
        functions &&
        functions.length === 0
      ) {
        SimpleToast('模型内容不正确');
        isPermission = false;
        return false;
      }
    } catch (err) {
      SimpleToast('JSON 不合法');
      isPermission = false;
    }
    return isPermission;
  };
  /**
   * @description: 点击创建按钮的时候触发
   * @param {type}
   * @return:
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err: Array<string>, values: any) => {
      if (!err) {
        const {
          modelDisplayName,
          modelName,
          modelType,
          description,
          modelContent,
          id,
        } = values;
        const { properties, events, functions } = modelContent;
        const params = {
          id,
          specName: 'user-spec-v1',
          modelDisplayName,
          modelName,
          modelType,
          description,
          modelContent: '',
        };
        // 前端初步校验物模型内容
        const checkContentStr = JSON.stringify({
          id: `urn:user-spec-v1:model:${modelName}:`,
          description,
          'display-name': modelDisplayName,
          type: 'entity',
          properties,
          events,
          functions,
        });
        const isPermission = handleCheckJson(checkContentStr);
        if (isPermission) {
          // 后端校验
          checkModelContent(checkContentStr).then((res) => {
            if (res && res.code.toString() === '200') {
              params.modelContent = res.data;
              if (!name) {
                createModel(params).then((result) => {
                  if (result) {
                    props.setFormDirty(false);
                    SimpleToast('创建成功');
                    history.replace({
                      pathname: `/thingModel/list`,
                    });
                  }
                });
              } else {
                editModel(params).then((result) => {
                  if (result) {
                    props.setFormDirty(false);
                    SimpleToast('保存成功');
                  }
                });
              }
            } else {
              SimpleToast('模型内容不正确');
            }
          });
        }
      }
    });
  };

  return (
    <Form
      className="basic-info-form"
      colon={false}
      onSubmit={handleSubmit}
      layout="inline"
    >
      <Form.Item>{getFieldDecorator('id')(<Input type="hidden" />)}</Form.Item>
      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="名称">
            {getFieldDecorator('modelDisplayName', {
              rules: [
                {
                  required: true,
                  message: '名称不能为空',
                },
                {
                  // pattern: /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/,
                  pattern: displayNameReg,
                  message: displayNameRule,
                },
              ],
            })(<Input placeholder="名称，例如：xxxx标准模型" maxLength={30} />)}
          </Form.Item>
          <Tooltip title={displayNameReg}>
            <div className="primary-color rule">查看规则</div>
          </Tooltip>
        </Col>
        <Col span={12}>
          <Form.Item label="类型">
            {getFieldDecorator('modelType', {
              initialValue: 'entity',
            })(
              <Radio.Group disabled>
                <Radio value="entity">实体类型</Radio>
                <Radio value="service">服务类型</Radio>
              </Radio.Group>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="标识符">
            {getFieldDecorator('modelName', {
              rules: [
                {
                  required: true,
                  message: '标识符不能为空',
                },
                {
                  // pattern: /^[a-zA-Z0-9]+((-)*[a-zA-Z0-9]+)*$/,
                  pattern: objectNameReg,
                  message: objectNameRule,
                },
              ],
            })(<Input maxLength={30} placeholder="请输出标识符，如light" />)}
          </Form.Item>
          <Tooltip title={objectNameRule}>
            <div className="primary-color rule">查看规则</div>
          </Tooltip>
        </Col>

        <Col span={12}>
          <Form.Item label="描述">
            {getFieldDecorator('description')(
              <Textarea height={60} maxLength={200} />
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row className="basic-form-row">
        <Col span={24}>
          <Form.Item wrapperCol={{ span: 24 }}>
            {getFieldDecorator('modelContent', {
              rules: [{ required: true, message: '功能定义不能为空' }],
            })(<ModelContent needRequire isView={false} />)}
          </Form.Item>
        </Col>
      </Row>
      <div className="submit-btn-wrap">
        <Button type="primary" htmlType="submit" className="create-btn">
          {name ? '保存' : '创建'}
        </Button>
      </div>
    </Form>
  );
}
const ModelFormWrap = Form.create<ModelFormProps>({
  onValuesChange(props) {
    props.setFormDirty(true);
  },
})(ModelForm);

export default ModelFormWrap;
