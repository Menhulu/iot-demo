import React from 'react';
import { Layout } from 'antd';

import ObtainHeight from '../../components/HomeLayout/obtainHeightContainer';

import './index.less';

const { Content } = Layout;

const NoMatch = (props: {}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* <Header>
        <Link to="/home">
          <img className="logo" src={logo} alt="logo" />
          <span className="headerTitle">物联网管理平台</span>
        </Link>
      </Header> */}
      <Content>
        <ObtainHeight bgColor="#fff">
          <div className="not-match-page">
            <div className="not-match-content" />
          </div>
        </ObtainHeight>
      </Content>
    </Layout>
  );
};
export default NoMatch;
