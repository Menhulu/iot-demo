import React, { useImperativeHandle, forwardRef } from 'react';
import { Modal, Input, Form } from 'antd';

import { FormComponentProps } from 'antd/lib/form';
import Textarea from 'components/TextArea';
import './index.less';

interface SaveThingModelModalProps extends FormComponentProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (val: { name: string; description: string }) => void;
}
type Ref = FormComponentProps;
const SaveThingModelModal = forwardRef<Ref, SaveThingModelModalProps>(
  ({ form, visible, onCancel, onOk }: SaveThingModelModalProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    /**
     * 取消保存
     */
    const closePubModel = () => {
      onCancel();
    };
    /**
     * 点击发布
     */
    const saveThingModel = () => {
      form.validateFields((err, val) => {
        if (!err) onOk({ ...val });
      });
    };
    return (
      <Modal
        title="保存物模型"
        closable
        visible={visible}
        okText="保存"
        cancelText="取消"
        onOk={saveThingModel}
        onCancel={closePubModel}
      >
        <div className="save-content">
          <Form {...formItemLayout}>
            <Form.Item label="物模型名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入物模型名称' }],
              })(<Input placeholder="请输入物模型名称" />)}
            </Form.Item>
            <Form.Item label="物模型描述">
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '请输入物模型描述' }],
              })(<Textarea maxLength={120} placeholder="请输入物模型描述" />)}
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
);

export default Form.create<SaveThingModelModalProps>()(SaveThingModelModal);
