import React, { useState, lazy, Suspense } from 'react';
import { useParams, Prompt } from 'react-router-dom';

import { Tabs } from 'antd';
import Header from 'components/Header';
import EditThingTypeInfo from './editThingTypeInfo';

import Provider from './thingModel/thingModelContext';
import { RouteConfigComponentProps } from '../../../router/react-router-config';
import './index.less';
// import ThingModelDef from './thingModel/index';
// import ProtocolProfile from './protocolProfile';

const ThingModelDef = lazy(() => import('./thingModel'));
const ProtocolProfile = lazy(() => import('./protocolProfile'));

const { TabPane } = Tabs;
const EditThingType = (props: RouteConfigComponentProps) => {
  const { nodeType } = useParams<{ id: string; nodeType: string }>();

  const [formDirty, setFormDirty] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('1');
  const changeTab = (activeKey: string) => {
    setActiveTab(activeKey);
  };

  return (
    <div className="edit-thing-type">
      <Prompt when={formDirty} message="" />
      <Header back title="编辑物类型" />
      <Tabs
        defaultActiveKey={activeTab}
        activeKey={activeTab}
        onChange={changeTab}
      >
        <TabPane tab="基本信息" key="1">
          <EditThingTypeInfo
            activeTab={activeTab}
            changeTab={changeTab}
            setFormDirty={setFormDirty}
          />
        </TabPane>
        {nodeType === '3' && (
          <TabPane tab="通讯协议档案" key="2">
            <Suspense fallback={null}>
              <ProtocolProfile />
            </Suspense>
          </TabPane>
        )}
        <TabPane tab="功能定义" key="3">
          <Provider>
            <Suspense fallback={null}>
              <ThingModelDef
                formDirty={formDirty}
                setFormDirty={setFormDirty}
              />
            </Suspense>
          </Provider>
        </TabPane>
      </Tabs>
    </div>
  );
};
export default EditThingType;
