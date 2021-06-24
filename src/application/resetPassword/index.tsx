import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Modal, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import md5 from 'md5';
import { delCookie } from 'utils/tools';
import { resetPassword } from './service';
import './style.less';

interface FormProps extends FormComponentProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const ResetPassword = forwardRef<FormComponentProps, FormProps>(
  ({ form, visible, onCancel, onSave }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const slat = '&%bder***&&%%$$#@';
    const { getFieldDecorator, getFieldValue, validateFields } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    const [confirmDirty, setConfirmDirty] = useState(false);
    const [timeCountDown, setTimeCountDown] = useState<number>(0);
    // 倒计时
    let timer: NodeJS.Timeout;
    const handleCancel = () => {
      onCancel();
    };
    const handleSave = () => {
      form.validateFields((error, value) => {
        console.log(value);
        if (!error) {
          console.log(value);
          resetPassword({
            oldPassword: md5(`${value.prePassword}/${slat}`),
            password: md5(`${value.password}/${slat}`),
            rePassword: md5(`${value.rePassword}/${slat}`),
          })
            .then((res) => {
              if (res.code === 200) {
                // 重新登录
                // 设置弹框倒计时，6秒钟后跳转到的登录
                let sumTime = 6;
                onSave();
                // 清除cookie
                delCookie('acdui');
                timer = setInterval(() => {
                  if (sumTime > 0) {
                    sumTime--;
                    setTimeCountDown(sumTime);
                  } else {
                    clearInterval(timer);
                    window.location.href = `${window.location.origin}/#/user/login`;
                  }
                }, 1000);
              } else {
                //
              }
            })
            ['catch']((err) => {});
        }
      });
    };

    const handleConfirmBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setConfirmDirty(confirmDirty || !!value);
    };

    const compareToFirstPassword = (
      rule: any,
      value: string,
      callback: (message?: string) => void
    ) => {
      if (value && value !== getFieldValue('password')) {
        callback('两次输入的密码不一致');
      } else {
        callback();
      }
    };

    const validateToNextPassword = (
      rule: any,
      value: string,
      callback: (message?: string) => void
    ) => {
      if (value && confirmDirty) {
        validateFields(['rePassword'], { force: true });
      }
      if (getFieldValue('prePassword') === getFieldValue('password')) {
        callback('新密码不能与原密码一致');
      }
      callback();
    };

    const pwdPattern = /^[a-zA-Z0-9~·!@#￥%^&*-_+=()]{8,20}$/;

    return (
      <>
        <Modal
          title="修改密码"
          visible={visible}
          onCancel={handleCancel}
          onOk={handleSave}
          okText="确定"
          cancelText="取消"
          wrapClassName="form-in-modal"
        >
          <Form {...formItemLayout}>
            <Form.Item label="原密码" hasFeedback>
              {getFieldDecorator('prePassword', {
                rules: [
                  {
                    required: true,
                    message: '请输入原登录密码',
                  },
                  {
                    // validator: validateToNextPassword
                  },
                ],
              })(
                <Input.Password placeholder="请输入原登录密码" maxLength={20} />
              )}
            </Form.Item>
            <Form.Item label="新密码" hasFeedback>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入密码',
                  },
                  {
                    validator: validateToNextPassword,
                  },
                  {
                    // pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{8,20}$/,
                    pattern: pwdPattern,
                    message: '新密码为8~20位数字、字母、符号组合',
                  },
                ],
              })(
                <Input.Password
                  placeholder="8-20位的数字、字母和符号的组合"
                  maxLength={20}
                />
              )}
            </Form.Item>
            <Form.Item label="再次输入新密码" hasFeedback>
              {getFieldDecorator('rePassword', {
                rules: [
                  {
                    required: true,
                    message: '请再次输入密码',
                  },
                  {
                    validator: compareToFirstPassword,
                  },
                ],
              })(
                <Input.Password
                  onBlur={handleConfirmBlur}
                  placeholder="再输入一次新密码"
                  maxLength={20}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
        <Modal footer={null} visible={!!timeCountDown} closable={false}>
          <span>
            修改成功，平台会在{timeCountDown}秒后自动跳转至登录，
            <span
              className="primary-color  cursor-pointer"
              onClick={() => {
                window.location.href = `${window.location.origin}/#/user/login`;
              }}
            >
              点击直接登录
            </span>
          </span>
          ,
        </Modal>
      </>
    );
  }
);
export default Form.create<FormProps>({ name: 'form_in_modal' })(ResetPassword);
