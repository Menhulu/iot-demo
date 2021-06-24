/* eslint-disable react/no-did-update-set-state */
import { Layout, Menu } from 'antd';
import { getAuth, getLoginState, getUserName } from 'application/user/services';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { AuthItem, MenuItem } from 'typings/type';
import { getCityOsToken, IMPORTCITYOS, REGION } from 'utils/constants';
import { getCookie } from 'utils/tools';
import routes from '../../router/index';
import renderRoutes, {
  RouteConfigComponentProps,
} from '../../router/react-router-config';
import './index.less';
import MenuHeader from './MenuHeader';
import sideMenuData from './sideMenu';
import YQMenuHeader from './YQMenuHeader';

// console.log(sideMenuData);
const { Content, Sider } = Layout;
const { SubMenu } = Menu;

interface HomeLayoutState {
  collapsed: boolean;
  openKeys: string[];
  activeKey: string;
  lastActiveMenu: { openKeys: string[]; activeKey: string };
  authedRoutes: typeof routes;
  authedMenuTreeNode: any;
  authKeyList: string[];
  authUriList: string[];
  authList: AuthItem[];
  isJdPassport: boolean;
  isJdCloudPassport: boolean;
  authPath: string;
  isLogin: boolean;
  isAuthReady: boolean;
  username: string;
}
interface HomeLayoutProps extends RouteConfigComponentProps {}
class HomeLayout extends React.PureComponent<HomeLayoutProps, HomeLayoutState> {
  constructor(props: HomeLayoutProps) {
    super(props);
    this.state = {
      collapsed: false,
      openKeys: ['dataOverview'],
      activeKey: '/dashboard/dataOverview/home',
      lastActiveMenu: {
        openKeys: ['dataOverview'],
        activeKey: '/dashboard/dataOverview/home',
      },
      authedRoutes: [],
      authedMenuTreeNode: [],
      authKeyList: [],
      authUriList: [],
      authList: [],
      isJdPassport: ['yueqing', 'hefei', 'jiaxing'].includes(REGION as string),
      isJdCloudPassport: ['jdcloud'].includes(REGION as string),
      authPath: '/user/login',
      isLogin: IMPORTCITYOS ? !!getCityOsToken() : !!getCookie('acdui'),
      isAuthReady: false,
      username: '',
    };
  }
  menuActiveRef = React.createRef<{
    openKeys: string[];
    activeKey: string;
  } | null>();

  // 注入城操代码
  initCityOSSiderAndHead = () => {
    // 获取token的信息
    let _that = this;

    // let accessToken =
    //   'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImFjY291bnRJZCI6MSwidGVuYW50SWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJ1c2VyVHlwZSI6MCwiaXNzIjoiZHJpZ2h0Iiwic3ViIjoidG9rZW4iLCJpYXQiOjE2MTQ2NjU0ODUsIm5iZiI6MTYxNDY2NTQ4NSwiZXhwIjoxNjE0NzUxODg1fQ.3Mgqa7nBN6tMeLwUdPaSAkh_mRiXzaao2nXJ_bCnON0';
    let accessToken = getCityOsToken();
    console.log(accessToken, 'initCityOSSiderAndHead');
    window.__generateTopNavigation__ &&
      window.__generateTopNavigation__.init({
        appCode: 'JDTIoT',
        accessToken,
        topHeaderContainer: '#header-test',
        leftMenuContainer: '#menu-test',
        autoGoLogin: false,
        autoGoNoAuth: false,
        onUserDataChange: function () {},
        onMenuFoldChange: function (collapsed: boolean) {
          console.log('onMenuFoldChange', collapsed);
          _that.setState({
            collapsed,
          });
        },
        onMenuDataChange: function () {},
        onMenuClicck: function () {},
        onThemeChange: function () {},
      });
  };

  UNSAFE_componentWillMount() {
    this.getAuthData();
    // 乐清环境 单点登录需要接口获取登录态和用户名
    this.getUserState();
  }

  componentDidMount() {
    // 初始化城市操作系统
    if (IMPORTCITYOS) {
      this.initCityOSSiderAndHead();
    }
    const { pathname } = this.props.location;

    const activeKey = pathname;

    console.log('activeKey', activeKey);

    let openKeys: string[] = ['dataOverview'];

    for (let i = 0; i < sideMenuData.length; i++) {
      const childrenMenu = sideMenuData[i].children;
      for (let j = 0; j < childrenMenu.length; j++) {
        if (activeKey.includes(childrenMenu[j].key)) {
          openKeys = [childrenMenu[j].parentKey];
          console.log(openKeys);
          this.setState({
            openKeys,
            lastActiveMenu: {
              activeKey: activeKey,
              openKeys: openKeys,
            },
          });
        }
      }
    }
    this.setState({
      activeKey,
    });
  }

  componentDidUpdate(prevProps: HomeLayoutProps, prevState: HomeLayoutState) {
    if (this.props.location !== prevProps.location) {
      const { pathname } = this.props.location;
      const activeKey = pathname;

      console.log(activeKey);
      this.setState({ activeKey });
      let openKeys: string[] = ['dataOverview'];

      for (let i = 0; i < sideMenuData.length; i++) {
        const childrenMenu = sideMenuData[i].children;
        for (let j = 0; j < childrenMenu.length; j++) {
          if (activeKey.includes(childrenMenu[j].key)) {
            openKeys = [childrenMenu[j].parentKey];
            console.log(openKeys);
            this.setState({
              openKeys,
              lastActiveMenu: {
                activeKey: activeKey,
                openKeys: openKeys,
              },
            });
          }
        }
      }
    }

    if (
      this.state.authUriList.length &&
      this.state.authUriList !== prevState.authUriList
    ) {
      console.log('update', prevState.authUriList);
      const authedMenuData = this.setAuthMenuData(sideMenuData as any);
      // 根据接口权限设置路由权限
      this.setRoutesAuth();
      const $authedMenuTreeNode = this.renderMenu(authedMenuData);
      this.setState({
        authedMenuTreeNode: $authedMenuTreeNode,
        isAuthReady: true,
      });
    }
  }
  getUserState = () => {
    // 京东单点登录需要从云端获取登录态和用户名
    if (this.state.isJdPassport) {
      const thirdHomePage = document.querySelector(
        'meta[name="thirdHomePage"]'
      );
      const passportProtocol = thirdHomePage
        ? thirdHomePage.getAttribute('content')
        : '//passport.jd.com';
      const loginPath = `${passportProtocol}/uc/login?ltype=login&ReturnUrl=${window.location.href}`;

      getLoginState()
        .then((res) => {
          if (res.code == '200') {
            const loginState = res.data;
            if (!loginState.login) {
              window.location.href = loginPath;
            }
            this.setState({
              isLogin: loginState.login,
              username: loginState.nickName,
            });
          } else {
            window.location.href = loginPath;
          }
        })
        .catch((error) => {
          console.log(error);
          window.location.href = loginPath;
        });
    }
    if (this.state.isJdCloudPassport && !this.state.isLogin) {
      window.location.href = `https://login.jdcloud.com/?returnUrl=${window.location.href}`;
    }
  };

  // 获取数据权限
  getAuthData = async () => {
    this.setState({ isAuthReady: false });
    try {
      const res = await getAuth();

      if (res && res.code == 200) {
        const list = res.data || [];
        const authListKeys: string[] = [];
        list.forEach((item: any) =>
          item.authVOList.forEach(
            (auth: { authId: any; authName: any; description: any }) => {
              authListKeys.push(`${item.resourceCode}_${auth.authName}`);
            }
          )
        );

        const authUriList: string[] = [];
        list.forEach((item: any) => {
          if (item.authVOList.length > 0) {
            if (
              item.authVOList.some(
                (authItem: any) =>
                  authItem.authName.includes('QUERY_PERMISSION') &&
                  item.resourceUri
              )
            ) {
              authUriList.push(item.resourceUri.replace('/v1', ''));
            }
          }
        });
        console.log(authUriList, authListKeys, list);
        this.setState({
          authKeyList: authListKeys,
          authUriList,
          authList: list,
        });
        if (!this.state.isJdPassport) {
          getUserName()
            .then((resp) => {
              this.setState({ username: resp });
            })
            ['catch']((err) => {
              if (err.code === 401) {
                window.location.href = `${window.location.origin}/#${err.data}`;
              }
            });
        }
      }
    } catch (error) {
      console.log(error);
      this.setState({
        authKeyList: [],
        authUriList: [],
        authList: [],
      });
    }
  };

  // 收起菜单
  handleSider = (collapsed: boolean) => {
    const { lastActiveMenu } = this.state;
    this.setState({
      collapsed,
      openKeys: collapsed ? [] : lastActiveMenu.openKeys,
      activeKey: collapsed ? '' : lastActiveMenu.activeKey,
    });
  };

  // 根据接口权限设置路由权限
  setRoutesAuth = () => {
    const { authUriList, authKeyList, authList } = this.state;
    console.log(authUriList, authKeyList, routes, 'setRoutesAuth----');
    if (routes && Array.isArray(routes)) {
      routes.forEach((item) => {
        if (
          authUriList.includes(item.path as string) ||
          authKeyList.includes(item.key as string) ||
          authUriList.includes((item.key as string).replace('_PERMISSION', ''))
        ) {
          item.hasPermission = true;
        } else {
          item.hasPermission = false;
        }
        if ((item.key as string) === 'NO_MATCH') {
          item.hasPermission = true;
        }
        authList.forEach((m) => {
          if ((item.key as string).includes(m.resourceCode as string)) {
            item.authVOList = m.authVOList;
          }
        });
      });
    }

    console.log(routes, 'routes--');

    this.setState({ authedRoutes: routes, isAuthReady: true });
  };

  //  根据权限设置菜单是否显示
  setAuthMenuData = (menuData: Partial<MenuItem>[]) => {
    const { authUriList } = this.state;

    menuData.forEach((menu) => {
      // 判断是否存在(menu.children
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach((item) => {
          if (item.to && authUriList.includes(item.to)) {
            item.hasPermission = true;
          } else {
            item.hasPermission = false;
          }
          if (item.children && item.children.length > 0) {
            this.setAuthMenuData(item.children);
          }
        });
        menu.hasPermission = menu.children.some((child) => child.hasPermission);
      } else if (menu.to && authUriList.includes(menu.to)) {
        menu.hasPermission = true;
      } else {
        menu.hasPermission = false;
      }
    });

    return menuData;
  };

  renderMenu = (data: Partial<MenuItem>[]) => {
    return data.map((item: Partial<MenuItem>) => {
      if (item.hasPermission) {
        // 判断是否存在item.children
        if (item.children && item.children.length > 0) {
          return (
            <SubMenu
              title={
                <Link to={item.to as string}>
                  <span className={`icon icon-${item.icon}`} />
                  <span>{item.name}</span>
                </Link>
              }
              key={item.key}
            >
              {this.renderMenu(item.children)}
            </SubMenu>
          );
        }
        // 单个菜单
        return (
          <Menu.Item key={item.key}>
            <Link to={item.to as string}>
              <i>·</i> {item.name}
            </Link>
          </Menu.Item>
        );
      }
      return null;
    });
  };

  render() {
    const {
      collapsed,
      activeKey,
      openKeys,
      authedRoutes,
      authedMenuTreeNode,
      authPath,
      isLogin,
      isJdPassport,
      isAuthReady,
      username,
    } = this.state;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        {IMPORTCITYOS ? (
          <div id="header-test"></div>
        ) : isJdPassport ? (
          <YQMenuHeader userName={username || ''} />
        ) : (
          <MenuHeader userName={username || ''} />
        )}
        <Layout>
          {IMPORTCITYOS ? (
            <Sider
              id="menu-test"
              width={240}
              collapsedWidth={56}
              collapsed={this.state.collapsed}
              className="city-menu-sider"
            ></Sider>
          ) : (
            <Sider
              breakpoint="sm"
              collapsedWidth={48}
              collapsible
              trigger={
                <div className="side-nav-foldBtn">
                  <i className={`icon ${collapsed ? 'icon-collapsed' : ''}`} />
                </div>
              }
              width={200}
              collapsed={this.state.collapsed}
              onCollapse={this.handleSider}
            >
              <Menu
                theme="dark"
                mode="inline"
                // onOpenChange={this.onOpenChange}
                selectedKeys={[activeKey]}
                openKeys={openKeys}
              >
                {authedMenuTreeNode}
              </Menu>
            </Sider>
          )}

          <Layout
            className={`container ${IMPORTCITYOS ? 'iot-cos-container' : ''}`}
          >
            <Content>
              {isAuthReady && renderRoutes(authedRoutes, isLogin, authPath)}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(HomeLayout);
