import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';

import logo from 'static/pic/state-grid-logo.png';
import ObtainHeight from '../../components/HomeLayout/obtainHeightContainer';
import './index.less';

const { Header, Content } = Layout;
const NoAuth = (props: {}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="no-auth-header">
        <Link to="/home">
          <img className="logo" src={logo} alt="logo" />
          <span className="headerTitle">物联网管理平台</span>
        </Link>
      </Header>
      <Content>
        <ObtainHeight bgColor="#fff">
          <div className="not-auth-page">
            <div className="not-auth-content" />
          </div>
        </ObtainHeight>
      </Content>
    </Layout>
  );
};
export default NoAuth;
