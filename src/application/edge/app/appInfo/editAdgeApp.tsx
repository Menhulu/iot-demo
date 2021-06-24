import React, { useEffect, useState, useCallback } from 'react';

import Header from 'components/Header';

import Toast from 'components/SimpleToast/index';
import BasicInfo from './components/basicInfo';
import { useParams, useHistory, Prompt } from 'react-router-dom';

import { queryEdgeAppInfo } from '../../service';
import { EdgeAppItem } from '../../types';
import { Tabs } from 'antd';
import AppVersionList from './components/appVersionList';
import AppDeploymentList from './components/appDeploymentList';

import './style.less';

const { TabPane } = Tabs;
export interface AddEdgeAppProps { }

const EditEdgeApp: React.FC<AddEdgeAppProps> = () => {
  const { appId } = useParams<{ appId: string }>();
  const history = useHistory()
  const { state } = history.location
  const { backUrl, tabKey } = state as any || { backUrl: '', tabKey: '' }
  // 表单编辑态点返回，弹窗拦截
  const [flag, setFlag] = useState(false);
  const [basicInfo, setBasicInfo] = useState<Partial<EdgeAppItem>>();
  const [hasVersion, setHasVersion] = useState(false);
  const fetchEdgeAppInfo = useCallback(() => {
    queryEdgeAppInfo({ appId })
      .then((res) => {
        if (res.success) {
          setBasicInfo(res.data);
        } else {
          Toast(res.message as string);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [appId]);
  useEffect(() => {
    appId && fetchEdgeAppInfo();
  }, [appId, fetchEdgeAppInfo]);

  return (
    <div className="edgeAppBasicInfo">
      <Prompt when={flag} message="" />
      <Header back fromSubPage to={backUrl || "/edge/app"} state={tabKey} title="编辑应用" />
      <BasicInfo
        setFormDirty={setFlag}
        hasVersion={hasVersion}
        fieldValues={basicInfo}
        fetchEdgeAppInfo={fetchEdgeAppInfo}
      />
      <div className="pad16">
        <Tabs>
          <TabPane key="version" tab="应用版本列表">
            <AppVersionList
              basicInfo={basicInfo}
              setHasVersion={setHasVersion}
            />
          </TabPane>
          <TabPane key="deploy" tab="应用部署列表">
            <AppDeploymentList basicInfo={basicInfo} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
export default EditEdgeApp;
