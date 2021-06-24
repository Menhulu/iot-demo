import React from 'react';
import { Button, Form, Input, Radio, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import TextArea from 'components/TextArea';

import { type } from 'application/edge/constants';

export interface BasicInfoProps extends FormComponentProps {
  setFormDirty: (flag: boolean) => void;
  handleSubmit: (val: any) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ handleSubmit, form }) => {
  const { getFieldDecorator } = form;
  // 提交
  const onSubmit = () => {
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values, 'values---');
        handleSubmit(values);
      }
    });
  };
  return (
    <Form className="basic-info-form" colon={false} layout="inline">
      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="名称">
            <>
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: '请输入应用名称' },
                  {
                    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{2,30}$/,
                    message: '请输入2-30个字符，支持中文、英文、数字',
                  },
                ],
                initialValue: '',
              })(
                <Input
                  maxLength={30}
                  placeholder="请输入2-30个字符，支持中文、英文、数字"
                />
              )}
            </>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="描述">
            <>
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: '请输入应用编码' },
                  {
                    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_]{2,30}$/,
                    message:
                      '请输入2-30个字符，支持英文、数字、下划线（_）和连字符（-）',
                  },
                ],
                initialValue: '',
              })(
                <Input
                  maxLength={30}
                  placeholder="请输入2-30个字符，支持英文、数字、下划线（_）和连字符（-）"
                />
              )}
            </>
          </Form.Item>
        </Col>
      </Row>

      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="硬件平台">
            <>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择应用类型' }],
                initialValue: '',
              })(
                <Radio.Group>
                  {Object.keys(type).map((key) => (
                    <Radio key={key} value={key}>
                      {type[key as keyof typeof type]}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="操作系统">
            <>
              {getFieldDecorator('description')(
                <TextArea maxLength={200} placeholder="请输入应用描述" />
              )}
            </>
          </Form.Item>
        </Col>
      </Row>
      <Row className="basic-form-row">
        <Col span={24}>
          <Form.Item label="关联连接代理设备">
            <>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择应用类型' }],
                initialValue: '',
              })(
                <Radio.Group>
                  {Object.keys(type).map((key) => (
                    <Radio key={key} value={key}>
                      {type[key as keyof typeof type]}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </>
          </Form.Item>
        </Col>
      </Row>
      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="证书">
            <>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择应用类型' }],
                initialValue: '',
              })(
                <Radio.Group>
                  {Object.keys(type).map((key) => (
                    <Radio key={key} value={key}>
                      {type[key as keyof typeof type]}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="边缘运行引擎安装包下载">
            <>
              {getFieldDecorator('description')(
                <TextArea maxLength={200} placeholder="请输入应用描述" />
              )}
            </>
          </Form.Item>
        </Col>
      </Row>
      <div className="submit-btn-wrap">
        <Button type="primary" htmlType="submit" onClick={onSubmit}>
          保存
        </Button>
      </div>
    </Form>
  );
};
export default Form.create<BasicInfoProps>({
  onValuesChange(props: BasicInfoProps, changeValues: any) {
    props.setFormDirty(true);
  },
})(BasicInfo);
