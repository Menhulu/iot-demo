import React from 'react';
import { Modal, ConfigProvider } from 'antd';
import antdZhCN from 'antd/es/locale/zh_CN';

// import { IntlProvider } from 'react-intl';

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import HomeLayout from 'components/HomeLayout';
import NoMatch from 'application/noMatch/index';
import Login from 'application/user/login';
import NoAuth from 'application/noAuth';

const App = (props: any) => {
  const antdLocale = antdZhCN;
  const getConfirmation = (
    message: string,
    callback: (flag: boolean) => void
  ) => {
    const modal = Modal.confirm({
      prefixCls: 'IOT-modal',
      title: '提示',
      icon: null,
      content: (
        <div>
          当前页面处于编辑状态，返回会丢失已编辑的内容
          <br />
          确定要返回吗？
        </div>
      ),
      className: 'back-confirm-modal',
      width: 400,
      onCancel: cancelCreate, // 返回回调
      onOk: closeModal, // 取消回调
      okText: '取消',
      okButtonProps: { type: 'default', prefixCls: 'IOT-btn' },
      cancelButtonProps: { type: 'primary', prefixCls: 'IOT-btn' },
      cancelText: '返回',
      centered: true,
    });
    function cancelCreate() {
      callback(true);
      modal.destroy();
    }
    function closeModal() {
      callback(false);
      modal.destroy();
    }
  };
  return (
    <div className="App">
      {/* <IntlProvider locale={jdcloudSitelang} messages={translationsForLocale}> */}
      <ConfigProvider locale={antdLocale} prefixCls="IOT">
        <Router getUserConfirmation={getConfirmation}>
          <Switch>
            <Route
              exact
              path="/"
              render={() => <Redirect to="/dataOverview/home" push />}
            />
            <Route
              exact
              path="/home"
              render={() => <Redirect to="/dataOverview/home" push />}
            />
            <Route exact path="/login" component={Login} />
            <Route exact path="/user/login" component={Login} />
            <Route exact path="/notFound" component={NoMatch} />
            <Route exact path="/forbidden" component={NoAuth} />
            <Route path="/" component={HomeLayout} />
            <Route component={NoMatch} />
          </Switch>
        </Router>
      </ConfigProvider>
      {/* </IntlProvider> */}
    </div>
  );
};

export default App;
