import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button, Form, Input, Radio, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { useParams, useHistory } from 'react-router-dom';
import TextArea from 'components/TextArea';
import Toast from 'components/SimpleToast/index';

import { modifyEdgeApp, addEdgeApp } from '../../../service';
import {
  publisherRule,
  publisherReg,
  type,
  appNameReg,
  appNameRule,
  appCodeReg,
  appCodeRule,
} from '../../../constants';

export interface BasicInfoProps extends FormComponentProps {
  setFormDirty: (flag: boolean) => void;
  fetchEdgeAppInfo?: () => void;
  hasVersion: boolean;
  fieldValues?: any;
  editSuccess?: boolean;
}

const BasicInfo: React.FC<BasicInfoProps> = forwardRef(
  ({ setFormDirty, fetchEdgeAppInfo, fieldValues, form }, ref) => {
    const history = useHistory();
    const { appId } = useParams<{ appId: string }>();
    const [disabled, setDisabled] = useState<boolean>(!!appId);
    const { getFieldDecorator, setFieldsValue } = form;
    useImperativeHandle(ref, () => ({
      form,
    }));

    useEffect(() => {
      if (fieldValues && !disabled) {
        const { name, vendor, description } = fieldValues;
        setFieldsValue({
          name,
          vendor,
          description,
        });
      }
    }, [disabled, fieldValues, setFieldsValue]);

    // 提交
    const handleSubmit = (values: any) => {
      if (appId) {
        modifyEdgeApp({ ...values, id: appId }).then((res) => {
          if (res.success) {
            Toast('保存成功');
            setDisabled(true);
            setFormDirty(false);
            fetchEdgeAppInfo && fetchEdgeAppInfo();
          } else {
            setDisabled(false);
            Toast(res.message as string);
          }
        });
      } else {
        addEdgeApp(values).then((res) => {
          if (res.success) {
            setFormDirty(false);
            history.go(-1);
          }
          Toast(res.message as string);
        });
      }

      //
    };
    // 提交
    const onSubmit = () => {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          handleSubmit({ ...fieldValues, ...values });
        }
      });
    };
    const edit = () => {
      setDisabled(false);
    };
    const cancelUpdate = () => {
      setDisabled(true);
      setFormDirty(false);
    };
    return (
      <Form
        className={disabled ? 'basic-info-form disabled' : 'basic-info-form'}
        colon={false}
        layout="inline"
      >
        {getFieldDecorator('id', {
          initialValue: '',
        })(<Input type="hidden" />)}
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="应用名称">
              {disabled ? (
                fieldValues?.name
              ) : (
                <>
                  {getFieldDecorator('name', {
                    rules: [
                      { required: true, message: '请输入应用名称' },
                      {
                        pattern: appNameReg,
                        message: appNameRule,
                      },
                    ],
                    initialValue: '',
                  })(<Input maxLength={30} placeholder={appNameRule} />)}
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="应用编码">
              {disabled || !!appId ? (
                fieldValues?.code
              ) : (
                <>
                  {getFieldDecorator('code', {
                    rules: [
                      { required: true, message: '请输入应用编码' },
                      {
                        pattern: appCodeReg,
                        message: appCodeRule,
                      },
                    ],
                    initialValue: '',
                  })(<Input maxLength={30} placeholder={appCodeRule} />)}
                </>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="应用类型">
              {disabled || !!appId ? (
                type[fieldValues?.type as keyof typeof type]
              ) : (
                <>
                  {getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择应用类型' }],
                    initialValue: '',
                  })(
                    <Radio.Group disabled={disabled}>
                      {Object.keys(type).map((key) => (
                        <Radio key={key} value={key}>
                          {type[key as keyof typeof type]}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="发布方">
              {disabled ? (
                fieldValues?.vendor
              ) : (
                <>
                  {getFieldDecorator('vendor', {
                    rules: [{ pattern: publisherReg, message: publisherRule }],
                  })(<Input maxLength={30} placeholder={publisherRule} />)}
                </>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Form.Item label="描述">
            {disabled ? (
              fieldValues?.description
            ) : (
              <>
                {getFieldDecorator('description')(
                  <TextArea maxLength={200} placeholder="请输入应用描述" />
                )}
              </>
            )}
          </Form.Item>
        </Row>
        <div className="submit-btn-wrap">
          {/* 新建 */}
          {!appId ? (
            <Button type="primary" htmlType="submit" onClick={onSubmit}>
              保存
            </Button>
          ) : (
            <>
              {disabled ? (
                <Button type="primary" htmlType="button" onClick={edit}>
                  编辑
                </Button>
              ) : (
                <>
                  <Button type="default" onClick={cancelUpdate}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={onSubmit}>
                    保存
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </Form>
    );
  }
);
export default Form.create<BasicInfoProps>({
  onValuesChange(props: BasicInfoProps) {
    props.setFormDirty(true);
  },
})(BasicInfo);
