import { Layout } from 'antd';
import ResetPassword from 'application/resetPassword';
import { logout } from 'application/user/services/index';
import Toast from 'components/SimpleToast';
import React, { ReactNode, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { websiteData } from 'utils/constants';
import './index.less';

const { Header } = Layout;

interface MenuHeaderProps {
  userName: string;
  children?: ReactNode;
}

const MenuHeader = ({ userName, children }: MenuHeaderProps) => {
  const formRef = useRef<any>();

  // 重置密码
  const [restPwdShow, setResetPwdShow] = useState<boolean>(false);
  // 退出登录
  const userLogout = async () => {
    try {
      const res = await logout();
      if (res.code === 200) {
        window.location.href = `${window.location.origin}/#/user/login`;
      }
    } catch (error) {
      //
      Toast('退出失败，稍后重试');
    }
  };
  const handleOk = () => {
    setResetPwdShow(false);
  };

  return (
    <Header className="menu-header">
      <div className="logo-wrap">
        <Link to="/" className={`${websiteData.logoSize}-logo`}>
          <img src={websiteData.websiteLogo} alt="标题" />
        </Link>

        <div className="logo-title">{websiteData.websiteTitle}</div>
      </div>
      <div className="user-center">
        <div className="avatar">
          <i className="icon-usercenter icon" />
          <span className="user"> {decodeURIComponent(userName)}</span>
          {/* <i className="icon-dowico icon" /> */}
        </div>
        <div className="exit-box">
          <div className="exit-content">
            <div className="exit-login" onClick={() => setResetPwdShow(true)}>
              <span className="icon-locked" />
              修改密码
            </div>

            <div className="exit-login" onClick={userLogout}>
              <span className="icon-poweroff" />
              退出登录
            </div>
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
