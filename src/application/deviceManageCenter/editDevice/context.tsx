import { uniqueId } from 'lodash';
import React, { createContext, useReducer } from 'react';
import { DeviceInfo } from '../types/index';

export const SET_WHEN = 'set_when';
export const SET_DEVICE_INFO = 'SET_DEVICE_INFO';
export type SET_WHEN = typeof SET_WHEN;
export type SET_DEVICE_INFO = typeof SET_DEVICE_INFO;
export const REFRESH_DEVICE_INFO = 'REFRESH_DEVICE_INFO';
export type REFRESH_DEVICE_INFO = typeof REFRESH_DEVICE_INFO;
type EditAction = {
  type: SET_WHEN;
  when: boolean;
};
type setDeviceAction = {
  type: SET_DEVICE_INFO;
  deviceInfo: DeviceInfo;
};
type setRefreshDeviceInfoAction = {
  type: REFRESH_DEVICE_INFO;
  refreshing: boolean;
};
export type EditDeviceAction =
  | EditAction
  | setDeviceAction
  | setRefreshDeviceInfoAction;

export type EditState = {
  when: boolean;
  deviceInfo: DeviceInfo;
  refreshing: boolean;
};

const defaultState: EditState = {
  when: false,
  refreshing: true,
  deviceInfo: {
    thingModelVersion: '',
    deviceId: '',
    deviceName: '',
    thingTypeCode: '',
    thingTypeName: '',
    thingModelCode: '',
    agentStatus: true, // 代理状态
    syncStatus: 1,
    createTime: 1,
    updateTime: 1,
    nodeType: 1,
    uniqueId: '',
    macAddress: '',
    deviceTagsList: [
      {
        key: '',
        value: '',
        description: '',
      },
    ],
    status: 1, // 设备状态{未激活，inactived}，{离线，offline}，{在线，online}，{停用，deactived}
    areaProvince: '',
    areaProvinceCode: '',
    areaCity: '',
    areaCityCode: '',
    areaDistrict: '',
    areaDistrictCode: '',
    longitude: '',
    latitude: '',
    ip: '',
    lastConnectTime: 1,
    lastDisconnectTime: 1,
    activateTime: 1,
    globalProfiles: [
      {
        scope: 0,
        profileCode: '',
        profileName: '',
        profileDesc: '',
        profileValue: '',
        dataType: 0,
        mandatory: 1,
        editable: 1,
        id: null,
        uniqueKey: uniqueId('profile_'),
      },
    ],
    customProfiles: [
      {
        profileCode: '',
        profileName: '',
        profileValue: '',
        profileDesc: '',
        id: null,
        uniqueKey: uniqueId('profile_'),
      },
    ],
  },
};

const defaultDispatch: React.Dispatch<EditDeviceAction> = () => defaultState;

export const EditContext = createContext({
  state: defaultState,
  dispatch: defaultDispatch,
});

const reducer = (state = defaultState, action: EditDeviceAction) => {
  console.log('reducer in 1222');
  switch (action.type) {
    case SET_WHEN:
      return {
        ...state,
        when: action.when,
      };
    case REFRESH_DEVICE_INFO:
      return {
        ...state,
        refreshing: action.refreshing,
      };
    case SET_DEVICE_INFO:
      console.log('SET_DEVICE_INFO SET_DEVICE_INFO SET_DEVICE_INFO');
      return {
        ...state,
        deviceInfo: action.deviceInfo,
      };
    default:
      return state;
  }
};

interface Props {
  children?: JSX.Element[] | JSX.Element | React.ReactNode;
  className?: string;
}

function EditContextWrap(props: Props) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  return (
    <EditContext.Provider value={{ state, dispatch }}>
      {props.children}
    </EditContext.Provider>
  );
}

export default EditContextWrap;
