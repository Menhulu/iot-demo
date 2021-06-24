import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import Toast from 'components/SimpleToast/index';

import md5 from 'md5';
import { getCookie } from 'utils/tools';
import { websiteData, REGION } from 'utils/constants';
import { loginService, getAuth } from '../services/index';
import './index.less';

interface UserFormProps extends FormComponentProps {
  userName: string;
  passWd: string;
}

const Login = (props: any) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const slat = '&%bder***&&%%$$#@';
  const isLiShui = REGION === 'lishui';
  const getListResourceAuth = useCallback(() => {
    getAuth().then((res) => {
      if (res && res.code === 200) {
        let from: { pathname: string } = { pathname: '/' };
        const list = (res && res.data) || [];
        const authUriList: string[] = [];
        list.forEach((item: any) => {
          if (item.authVOList.length > 0) {
            if (
              item.authVOList.some((authItem: any) =>
                authItem.authName.includes('QUERY_PERMISSION')
              )
            ) {
              authUriList.push(item.resourceUri);
            }
          }
        });
        if (authUriList.length === 0) {
          Toast('登录成功，但无资源权限，请联系管理员，开通权限');
          return;
        }

        const hasDataoverview = authUriList.some(
          (item) => item === '/dataOverview/home'
        );
        from = hasDataoverview
          ? props.location.state || {
              pathname: '/dataOverview/home',
            }
          : props.location.state || {
              pathname: authUriList[0],
            };
        props.history.push(from.pathname);
      }
    });
  }, [props.history, props.location.state]);

  useEffect(() => {
    const acdui = getCookie('acdui');
    const iscCookie = getCookie('isc_cookie');
    const authed = !!acdui || !!iscCookie; // 登陆
    console.log(authed);
    if (authed) {
      getListResourceAuth();
    }
  }, [getListResourceAuth, props.history]);

  function handleLogin(e: any) {
    e.preventDefault();
    props.form.validateFields((err: any, values: any) => {
      console.log(`${values.passWd}/${slat}`);
      if (!err) {
        loginService({
          passWd: md5(`${values.passWd}/${slat}`),
          userName: values.userName,
        })
          .then((data) => {
            // console.log('loginService', data);
            if (data && data.code == 200) {
              localStorage.setItem('username', values.userName);
              getListResourceAuth();
              props.login(values.userName);
            }
          })
          ['catch']((error) => {
            setErrorMsg('用户名密码错误');
          });
        // console.log('Received values of form: ', values);
      }
    });
  }
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  return (
    <div className={`login-wrap ${isLiShui ? 'lishui' : ''}`}>
      <div className="FormWrapper">
        <div className="form-title">{websiteData.websiteTitle}</div>
        <Form onSubmit={handleLogin} className="login-form" layout="horizontal">
          <Form.Item label="账号" {...formItemLayout}>
            {getFieldDecorator('userName', {
              rules: [{ required: true, message: '请输入账户名' }],
            })(
              <Input
                prefix={
                  <span
                    className="icon-usercenter"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
                placeholder="账号"
              />
            )}
          </Form.Item>
          <Form.Item label="密码" {...formItemLayout}>
            {getFieldDecorator('passWd', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input
                prefix={
                  <span
                    className="icon-locked"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
                type="password"
                placeholder="密码"
              />
            )}
          </Form.Item>
          <Form.Item className="login-btn-box">
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              // style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
const LoginWrapper = Form.create<UserFormProps>()(Login);

export default LoginWrapper;
