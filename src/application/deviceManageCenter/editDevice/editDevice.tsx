import React, {
  useCallback,
  useEffect,
  lazy,
  Suspense,
  useContext,
  useState,
} from 'react';
import { useParams, Prompt, useHistory } from 'react-router-dom';
import { Tabs } from 'antd';
import Header from 'components/Header/index';

import DeviceInfoCom from './deviceInfo/deviceInfo';
import EventList from './eventList/index';
import FuncList from './funclist/index';
import PropertyList from './propertyList/index';
import { Tag } from '../types/index';
import { queryDeviceInfo } from '../services/index';
import EditContextWrap, {
  EditContext,
  SET_DEVICE_INFO,
  REFRESH_DEVICE_INFO,
} from './context';

import './editDevice.less';

const Topo = lazy(() => import('../topology/topo'));

const { TabPane } = Tabs;

function EditDevice(props: any) {
  const { id, tab } = useParams<{
    id: string;
    tab?: string;
  }>();
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo, refreshing } = state;
  const { when } = state;
  const [activeTab, setActiveTab] = useState('1');
  const history = useHistory()
  const { backUrl, tabKey } = history.location.state as any || { backUrl: '', tabKey: '' }
  useEffect(() => {
    tab && setActiveTab(tab);
  }, [tab]);
  const changeTab = (activeKey: string) => {
    setActiveTab(activeKey);
  };
  // 获取设备信息
  const fetchData = useCallback(() => {
    console.log(refreshing, id);
    const param = {
      deviceId: id,
    };
    refreshing &&
      queryDeviceInfo(param)
        .then((res) => {
          if (res) {
            const { deviceTagsList } = res;

            deviceTagsList &&
              deviceTagsList.forEach((item: Tag, index: number) => {
                item.name = item.key;
                item.id = Date.now() + index;
              });

            dispatch({
              type: SET_DEVICE_INFO,
              deviceInfo: { ...res, deviceTagsList: deviceTagsList || [] },
            });
          }
        })
      ['catch']((err) => {
        console.log(err);
      })
      ['finally'](() => {
        dispatch({
          type: REFRESH_DEVICE_INFO,
          refreshing: false,
        });
      });
  }, [dispatch, id, refreshing]);

  // 跳转查看型号页面
  const viewMeta = () => {
    const isEdgeType = deviceInfo.isEdge ? 'isedge' : 'nonedge';
    props.history.push({
      pathname: `/thingtype/edit/${deviceInfo.thingTypeCode}/${deviceInfo.nodeType}`,
      state: {
        backUrl: `/deviceManage/editDevice/${deviceInfo.deviceId}/${isEdgeType}`,
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className="edit-device">
      <Prompt when={when} message="" />
      <Header back mClassName="edit-device-header" title="管理设备" to={backUrl || '/deviceManage/deviceList'} state={tabKey}>
        <span className="ml-20">
          {`${deviceInfo.deviceName}（`}
          {/* <a href="#">下载</a> */}
          {`物类型：${deviceInfo.thingTypeName || ''} `}
          <span
            className="cursor-pointer primary-color"
            onClick={() => {
              viewMeta();
            }}
          >
            查看
          </span>
          ）
        </span>
      </Header>
      <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={changeTab}>
        <TabPane tab="设备信息" key="1">
          <DeviceInfoCom />
        </TabPane>
        <TabPane tab="属性" key="2">
          <PropertyList />
        </TabPane>
        <TabPane tab="事件列表" key="4">
          <EventList />
        </TabPane>
        <TabPane tab="方法列表" key="5">
          <FuncList />
        </TabPane>
        {deviceInfo.nodeType === 2 && (
          <TabPane tab="拓扑关系" key="3">
            <Suspense fallback={null}>
              <Topo />
            </Suspense>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
}

const NewCom = (props: any) => {
  return (
    <EditContextWrap>
      <EditDevice {...props} />
    </EditContextWrap>
  );
};
export default NewCom;
