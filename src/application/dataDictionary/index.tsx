import React from 'react';
import { Tabs } from 'antd';
import Header from 'components/Header';
import { RouteConfigComponentProps } from '../../router/react-router-config';
import CommonDataDic from './commonDataDic';
import RegionalDataDic from './regionalDic';
import './index.less';

const { TabPane } = Tabs;

const DataDictionary = (
  props: RouteConfigComponentProps
): React.ReactElement => {
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];
  return (
    <div className="data-dic">
      <Header title="数据字典" />
      <Tabs className="data-dic-tabs">
        <TabPane tab="地域字典" key="1">
          <RegionalDataDic />
        </TabPane>
        <TabPane tab="通用字典" key="2">
          <CommonDataDic authVOList={authVOList} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DataDictionary;
