import React, {
  useEffect,
  useState,
  useContext,
  Suspense,
  useCallback,
} from 'react';
import Header from 'components/Header';
import Toast from 'components/SimpleToast/index';
import BasicInfo from './components/basicInfo';
import EdgeInfo from './components/EdgeInfo';
import { useParams, Prompt, useHistory } from 'react-router-dom';

import { modifyEdgeApp, queryEdgeAppInfo } from '../../service';
import { EdgeAppItem } from '../../types';
import { Tabs } from 'antd';
import MonitorInfo from './components/MonitorInfo';
import EdgeApp from './components/EdgeApp';
import EdgeDevice from './components/EdgeDevice';
import { DeviceInfo } from 'application/deviceManageCenter/types';
import { queryDeviceInfo } from 'application/deviceManageCenter/services';
import { getProperty } from 'application/deviceManageCenter/services/property';
import EditContextWrap, {
  EditContext,
  SET_DEVICE_INFO,
  REFRESH_DEVICE_INFO,
} from 'application/deviceManageCenter/editDevice/context';
// import Topo from 'application/deviceManageCenter/topology/topo';
import './style.less';
const { TabPane } = Tabs;
export interface AddEdgeAppProps { }
interface historyStatesProps { tabKey?: string }
const EditEdgeApp: React.FC<AddEdgeAppProps> = (props: any) => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const history = useHistory()
  const tabKey = history.location && history.location.state
  const [flag, setFlag] = useState(false);
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo, refreshing } = state;
  const [nodeInfo, setNodeInfo] = useState<any>({
    cpuArch: "--", // 硬件平台
    cpuModelName: "--", // CUP型号
    catalogTwoMountPoint: "", // 最大分区挂载目录
    catalogTwoTotal: "--", // 最大分区挂载硬盘大小
    catalogOneMountPoint: "", // 根目录挂载硬盘信息
    catalogOneTotal: "--", // 根目录挂载硬盘大小
    edgeVersion: "--", // edge版本
    hostBootTime: "", // 开机时间
    hostName: "--", // 主机名
    hostOs: "--", // 操作系统
    hostPlatform: "--", // 操作系统平台
    hostPlatformVersion: "--", // 操作系统平台版本
    memTotal: "--", // 内存大小
    netInterface: "--", // 网卡名称
    netIpv4Addr: "--", // IPV4地址
    netIpv6Addr: "--", // IPV6地址
    netMacAddr: "--", // 网卡物理地址
  });

  // 数据容量转换
  function conver(limit: any) {
    var size = "";
    if (limit < 0.1 * 1024) { //如果小于0.1KB转化成B  
      size = limit.toFixed(2) + "B";
    } else if (limit < 0.1 * 1024 * 1024) {//如果小于0.1MB转化成KB  
      size = (limit / 1024).toFixed(2) + "KB";
    } else if (limit < 0.1 * 1024 * 1024 * 1024) { //如果小于0.1GB转化成MB  
      size = (limit / (1024 * 1024)).toFixed(2) + "MB";
    } else { //其他转化成GB  
      size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    }
    var sizestr = size + "";
    var len = sizestr.indexOf("\.");
    var dec = sizestr.substr(len + 1, 2);
    if (dec == "00") {//当小数点后为00时 去掉小数部分  
      return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
    }
    return sizestr;
  }

  // 获取设备信息
  const fetchData = useCallback(() => {
    console.log(refreshing, nodeId);
    const param = {
      deviceId: nodeId,
    };
    refreshing &&
      queryDeviceInfo(param)
        .then((res) => {
          if (res) {
            dispatch({
              type: SET_DEVICE_INFO,
              deviceInfo: { ...res },
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
    getProperty(param).then((res) => {
      console.log(res)
      let propertyReportedData: Record<string, any> = {};
      if (res.code === 200) {
        propertyReportedData =
          res.data && res.data.state ? res.data.state.reported : {};
      }
      if (propertyReportedData['JIT-Edge.sys-info']) {
        // console.log(propertyReportedData['JIT-Edge.sys-info'], '222222222222222222222222');
        const formArr = propertyReportedData['JIT-Edge.sys-info']
        let newObj: any = {}
        formArr.map((item: { key: string, value: string }) => {
          const key = item.key
          if (key) {
            newObj[key] = item.value
          }
        })
        const hostBootTime = newObj['host.boot-time'] ? new Date(Number(newObj['host.boot-time']) * 1000) : ''
        const keyAry = Object.keys(newObj)
        const diskAry = keyAry.filter((itme: any) => {
          return /^(disk)(.*)(mount-point)$/.test(itme)
        })
        let catalogNameOne = ''
        let catalogNameTwo = ''
        if (diskAry[0]) {
          const catalogAryOne = diskAry[0].split('.')
          catalogNameOne = catalogAryOne[1]
        }
        if (diskAry[1]) {
          const catalogAryTwo = diskAry[1].split('.')
          catalogNameTwo = catalogAryTwo[1]
        }
        setNodeInfo({
          cpuArch: newObj['cpu.arch'] || '--',
          cpuModelName: newObj['cpu.model-name'] || '--',
          catalogOneMountPoint: catalogNameOne ? newObj[`disk.${catalogNameOne}.mount-point`] : '',
          catalogOneTotal: catalogNameOne ? conver(newObj[`disk.${catalogNameOne}.total`]) : '--',
          catalogTwoMountPoint: catalogNameTwo ? newObj[`disk.${catalogNameTwo}.mount-point`] : '',
          catalogTwoTotal: catalogNameTwo ? conver(newObj[`disk.${catalogNameTwo}.total`]) : '--',
          edgeVersion: newObj['edge.version'] || '--',
          hostBootTime: hostBootTime,
          hostName: newObj['host.name'] || '--',
          hostOs: newObj['host.os'] || '--',
          hostPlatform: newObj['host.platform'] || '--',
          hostPlatformVersion: newObj['host.platform-version'] || '--',
          memTotal: conver(newObj['mem.total']) || '--',
          netInterface: newObj['net.interface'] || '--',
          netIpv4Addr: newObj['net.ipv4-addr'] || '--',
          netIpv6Addr: newObj['net.ipv6-addr'] || '--',
          netMacAddr: newObj['net.mac-addr'] || '--',
        })
      }
    })
  }, [dispatch, nodeId, refreshing]);

  // 跳转查看型号页面
  const viewMeta = () => {
    props.history.push({
      pathname: `/thingtype/edit/${deviceInfo.thingTypeCode}/${deviceInfo.nodeType}`,
      state: {
        backUrl: `/edge/node/edit/${deviceInfo.deviceId}`,
      },
    });
  };
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className="edgeAppBasicInfo">
      <Prompt when={flag} message="" />
      <Header back to="/edge/node" title="节点详情" />
      <div className="pad16">
        <EdgeInfo setFormDirty={setFlag} viewMeta={viewMeta} />
        <Tabs defaultActiveKey={tabKey as string || 'basicInfo'}>
          <TabPane key="basicInfo" tab="基本信息">
            <BasicInfo nodeInfo={nodeInfo} />
          </TabPane>
          <TabPane key="version" tab="监控信息">
            <MonitorInfo />
          </TabPane>
          <TabPane key="deploy" tab="边缘应用">
            <EdgeApp />
          </TabPane>

          <TabPane key="device" tab="设备管理">
            <EdgeDevice />
            {/* <Suspense fallback={null}>
              <Topo />
            </Suspense> */}
          </TabPane>
        </Tabs>
      </div>
    </div >
  );
};

const NewEditEdgeApp = (props: any) => {
  return (
    <EditContextWrap>
      <EditEdgeApp {...props} />
    </EditContextWrap>
  );
};
export default NewEditEdgeApp;
