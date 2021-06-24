import React, { createContext, useReducer } from 'react';
import { AuthVO } from 'router/react-router-config';
import { DeviceGroupInfo, DeviceInfo } from '../types';

export const SET_EDIT_INFO = 'set_edit_info';
export const SET_EDIT_LIST = 'set_edit_list';
export const SET_GROUP_ID = 'set_group_id';
export const SET_GROUP_NAME = 'set_group_name';
export const SET_AUTH_VO_LIST = 'set_auth_vo_list';
export const SET_REFRESH_GROUP_LIST = 'SET_REFRESH_GROUP_LIST';
export const SET_GROUP_LIST = 'SET_GROUP_LIST';
export const SET_PLAIN_GROUP_LIST = 'SET_PLAIN_GROUP_LIST';

type EditStoreAction = {
  type: string;
  editInfo?: DeviceGroupInfo;
  editList?: DeviceInfo[];
  groupId?: number;
  groupName?: string;
  authVOList?: AuthVO[];
  refreshGroupList?: boolean;
  groupList?: DeviceGroupInfo[];
  plainGroupList?: DeviceGroupInfo[];
};

export type EditStoreState = {
  editInfo: DeviceGroupInfo;
  editList: DeviceInfo[];
  groupId: number;
  groupName: string;
  authVOList: AuthVO[];
  refreshGroupList: boolean;
  groupList: DeviceGroupInfo[];
  plainGroupList: DeviceGroupInfo[];
};

const defaultState: EditStoreState = {
  editInfo: {
    deviceNum: 0,
    onlineNum: 0,
    description: '',
    groupName: '',
    id: 0,
    level: 0,
    parentId: 0,
    rootFlag: true,
    createTime: 0,
    groupNameChangeFlag: false,
    children: [],
  },
  editList: [],
  groupId: -1,
  groupName: '',
  authVOList: [],
  refreshGroupList: true,
  groupList: [],
  plainGroupList: [],
};

const defaultDispatch: React.Dispatch<EditStoreAction> = () => defaultState;

export const EditContext = createContext({
  state: defaultState,
  dispatch: defaultDispatch,
});

const reducer = (state = defaultState, action: EditStoreAction) => {
  console.log(action, '------action');
  switch (action.type) {
    case SET_EDIT_INFO:
      return {
        ...state,
        editInfo: { ...state.editInfo, ...action.editInfo },
      };
    case SET_EDIT_LIST:
      return {
        ...state,
        editList: action.editList || [],
      };
    case SET_GROUP_ID:
      return {
        ...state,
        groupId: action.groupId as number,
      };
    case SET_GROUP_NAME:
      return {
        ...state,
        groupName: action.groupName as string,
      };
    case SET_AUTH_VO_LIST:
      return {
        ...state,
        authVOList: action.authVOList as AuthVO[],
      };
    case SET_REFRESH_GROUP_LIST:
      return {
        ...state,
        refreshGroupList: action.refreshGroupList as boolean,
      };
    case SET_GROUP_LIST:
      return {
        ...state,
        groupList: action.groupList as DeviceGroupInfo[],
      };
    case SET_PLAIN_GROUP_LIST:
      return {
        ...state,
        plainGroupList: action.plainGroupList as DeviceGroupInfo[],
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
  const [state, dispatch] = useReducer<
    React.Reducer<EditStoreState, EditStoreAction>
  >(reducer, defaultState);

  return (
    <EditContext.Provider value={{ state, dispatch }}>
      {props.children}
    </EditContext.Provider>
  );
}

export default EditContextWrap;
