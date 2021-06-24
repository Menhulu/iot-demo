import React, { ReactNode, useState, useRef } from 'react';
import { Layout } from 'antd';
import ResetPassword from 'application/resetPassword';

import { yqLogout } from 'application/user/services/index';
import logo from 'static/img/logo@2x.png';
import './index.less';
import Toast from 'components/SimpleToast';

const { Header } = Layout;

interface MenuHeaderProps {
  userName: string;
  children?: ReactNode;
}

const MenuHeader = ({ userName, children }: MenuHeaderProps) => {
  const formRef = useRef<any>();
  // 重置密码
  const [restPwdShow, setResetPwdShow] = useState<boolean>(false);

  const handleOk = () => {
    setResetPwdShow(false);
  };

  const userLogout = async () => {
    try {
      const res = await yqLogout();
      // if (res.code === 200) {
      //   const jp = document.querySelector('meta[name="jp"]');

      //   const passportProtocol = jp
      //     ? jp.getAttribute('content')
      //     : '//passport.jd.com';

      //   const loginPath = `${passportProtocol}/uc/login?ltype=login&ReturnUrl=//${window.location.hostname}`;
      //   window.location.href = loginPath;
      // }
    } catch (error) {
      Toast('退出失败，稍后重试');
    }
  };

  return (
    <Header className="yq-menu-header">
      <div className="logo-wrap">
        <a href="/" className="logo">
          <img src={logo} alt="标题" />
          <span className="logo-title"> 工业物联网平台</span>
        </a>
      </div>
      <div className="user-center">
        <div className="avatar">
          <i className="icon-usercenter icon" />
          <span className="user"> {decodeURIComponent(userName)}</span>
          {/* <i className="icon-dowico icon" /> */}
        </div>
        <div className="exit-box">
          <div className="exit-content">
            <span className="exit-login" onClick={userLogout}>
              退出登录
            </span>
          </div>
        </div>
      </div>
      <ResetPassword
        wrappedComponentRef={formRef}
        visible={restPwdShow}
        onCancel={() => setResetPwdShow(false)}
        onSave={handleOk}
      />
    </Header>
  );
};

export default MenuHeader;
