import React, { useEffect, useImperativeHandle, forwardRef } from 'react';

import { FormComponentProps } from 'antd/lib/form';

import { Modal, Input, Form, Tooltip, Radio } from 'antd';

import {
  displayNameReg,
  displayNameRule,
  objectNameReg,
  objectNameRule,
} from 'utils/constants';
import { ProfileFormInfo } from '../../../types/protocolProfile';

import './index.less';

interface ProfileInfoModalProps extends FormComponentProps {
  visible: boolean;
  data: ProfileFormInfo;
  onCancel: () => void;
  onOk: (val: ProfileFormInfo) => void;
}
type Ref = FormComponentProps;
const ProfileInfoModal = forwardRef<Ref, ProfileInfoModalProps>(
  ({ form, visible, onCancel, onOk, data }: ProfileInfoModalProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));

    const { getFieldDecorator, setFieldsValue } = form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };

    useEffect(() => {
      setFieldsValue({
        id: data.id,
        profileName: data.profileName,
        profileCode: data.profileCode,
        mandatory: data.mandatory,
        dataType: 4,
        editable: 1,
        scope: 3,
        thingTypeCode: data.thingTypeCode,
        profileDesc: '',
      });
    }, [data, setFieldsValue]);

    const handleSave = () => {
      form.validateFields((err, val) => {
        console.log(val);
        if (!err) onOk({ ...val });
      });
    };
    return (
      <Modal
        title={data ? '编辑档案' : '新建档案'}
        centered
        visible={visible}
        okText="确认"
        cancelText="取消"
        onOk={handleSave}
        onCancel={onCancel}
        wrapClassName="profile-info-modal"
      >
        <div className="content">
          <Form {...formItemLayout}>
            <Form.Item label="档案名称" className="flex-form-item">
              {getFieldDecorator('profileName', {
                rules: [
                  { required: true, message: '请输入档案名称' },
                  { pattern: displayNameReg, message: displayNameRule },
                ],
              })(<Input maxLength={30} placeholder="请输入档案名称" />)}
              <Tooltip title={displayNameRule}>
                <span className="primary-color rule">查看规则</span>
              </Tooltip>
            </Form.Item>
            <Form.Item label="档案编码" className="flex-form-item">
              {getFieldDecorator('profileCode', {
                rules: [
                  { required: true, message: '请输入档案编码' },
                  { pattern: objectNameReg, message: objectNameRule },
                ],
              })(
                <Input
                  disabled={!!data.id}
                  maxLength={30}
                  placeholder="请输入档案编码"
                />
              )}
              <Tooltip title={objectNameRule}>
                <span className="primary-color rule">查看规则</span>
              </Tooltip>
            </Form.Item>
            <Form.Item label="是否必填" className="flex-form-item">
              {getFieldDecorator('mandatory', {
                rules: [{ required: true, message: '请选择是否必填' }],
              })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
            </Form.Item>
            {getFieldDecorator('profileDesc')(<Input type="hidden" />)}
            {getFieldDecorator('thingTypeCode')(<Input type="hidden" />)}
            {getFieldDecorator('id')(<Input type="hidden" />)}
            {getFieldDecorator('scope')(<Input type="hidden" />)}
            {getFieldDecorator('dataType')(<Input type="hidden" />)}
            {getFieldDecorator('editable')(<Input type="hidden" />)}
          </Form>
        </div>
      </Modal>
    );
  }
);
export default Form.create<ProfileInfoModalProps>()(ProfileInfoModal);
