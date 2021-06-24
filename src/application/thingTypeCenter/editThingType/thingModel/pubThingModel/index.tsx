import React, { useImperativeHandle, forwardRef } from 'react';
import { Modal, Input, Form } from 'antd';

import { FormComponentProps } from 'antd/lib/form';
import Textarea from 'components/TextArea';
import './index.less';

interface PubThingModelModalProps extends FormComponentProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (val: { changeLog: string }) => void;
}
type Ref = FormComponentProps;
const PubThingModelModal = forwardRef<Ref, PubThingModelModalProps>(
  ({ form, visible, onCancel, onOk }: PubThingModelModalProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    /**
     * 取消发布
     */
    const closePubModel = () => {
      onCancel();
    };
    /**
     * 点击发布
     */
    const pubThingModel = () => {
      form.validateFields((err, val) => {
        if (!err) onOk({ ...val });
      });
    };
    return (
      <Modal
        title="功能发布"
        closable
        visible={visible}
        okText="发布"
        cancelText="取消"
        onOk={pubThingModel}
        onCancel={closePubModel}
      >
        <div className="pub-content">
          <Form {...formItemLayout}>
            <Form.Item label="版本变更说明">
              {getFieldDecorator('changeLog', {
                rules: [{ required: true, message: '请输入物模型描述' }],
              })(<Textarea maxLength={120} placeholder="请输入版本变更说明" />)}
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
);

export default Form.create<PubThingModelModalProps>()(PubThingModelModal);
