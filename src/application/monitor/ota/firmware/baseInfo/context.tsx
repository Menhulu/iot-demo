import React, { useReducer, createContext } from 'react';
import { FirmwareData } from '../../../types';

export function createCtx<StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType
) {
  const defaultDispatch: React.Dispatch<ActionType> = () => initialState;
  const ctx = createContext({
    state: initialState,
    dispatch: defaultDispatch,
  });
  function Provider(props: React.PropsWithChildren<{}>) {
    const [state, dispatch] = useReducer<React.Reducer<StateType, ActionType>>(
      reducer,
      initialState
    );
    return <ctx.Provider value={{ state, dispatch }} {...props} />;
  }
  return [ctx, Provider] as const;
}

//  设置表单编辑态
export const SET_FORMDIRTY = 'SET_FORMDIRTY';
export type SET_FORMDIRTY = typeof SET_FORMDIRTY;

// 设置固件信息
export const SET_FIRMWARE_INFO = 'SET_FIRMWARE_INFO';
export type SET_FIRMWARE_INFO = typeof SET_FIRMWARE_INFO;

// 设置错误信息
export const SET_GROUP_ERR = 'SET_GROUP_ERR';
export type SET_GROUP_ERR = typeof SET_GROUP_ERR;

export type EditStoreAction =
  | {
      type: SET_FIRMWARE_INFO;
      firmwareInfo: FirmwareData;
    }
  | {
      type: SET_FORMDIRTY;
      formDirty: boolean;
    }
  | {
      type: SET_GROUP_ERR;
      groupErrMsg: string;
    };
export type EditStoreState = {
  firmwareInfo: FirmwareData;
  formDirty: boolean;
  groupErrMsg?: string;
};

const defaultState: EditStoreState = {
  firmwareInfo: {
    thingTypeCode: '',
    thingTypeName: '',
    changeLog: '',
    version: 1,
    token: '',
    srcVersion: '',
    destVersion: '',
    versionNo: '',
    comment: '',
    packageUrl: '',
    packageName: '',
    packageSize: 0,
    algorithm: '',
    signature: '',
    packageType: 1,
  },
  groupErrMsg: '',
  formDirty: false,
};

const reducer = (state = defaultState, action: EditStoreAction) => {
  switch (action.type) {
    case SET_FIRMWARE_INFO:
      return {
        ...state,
        firmwareInfo: { ...state.firmwareInfo, ...action.firmwareInfo },
      };
    case SET_FORMDIRTY:
      return {
        ...state,
        formDirty: action.formDirty,
      };
    case SET_GROUP_ERR:
      return {
        ...state,
        groupErrMsg: action.groupErrMsg,
      };
    default:
      return state;
  }
};

const [ctx, FirmwareProvider] = createCtx(reducer, defaultState);

const FirmwareContext = ctx;
export { FirmwareProvider, FirmwareContext };
