import createCtx from 'common/context';
import {
  ThingModelInfo,
  VersionItem,
  ModelInfo,
  ThingModelContent,
} from '../../types/index';
import { thingModelData } from '../../mock';

export const SET_THING_MODEL_INFO = 'SET_THING_MODEL_INFO';
export type SET_THING_MODEL_INFO = typeof SET_THING_MODEL_INFO;

export const SET_CURRENT_VERSION = 'SET_CURRENT_VERSION';
export type SET_CURRENT_VERSION = typeof SET_CURRENT_VERSION;

export const SET_CURRENT_MODEL_INDEX = 'SET_CURRENT_MODEL_INDEX';
export type SET_CURRENT_MODEL_INDEX = typeof SET_CURRENT_MODEL_INDEX;

export const SET_VERSION_LIST = 'SET_VERSION_LIST';
export type SET_VERSION_LIST = typeof SET_VERSION_LIST;

export const SET_REFRESH_VERSION_LIST = 'SET_REFRESH_VERSION_LIST';
export type SET_REFRESH_VERSION_LIST = typeof SET_REFRESH_VERSION_LIST;

type SetThingModelContentAction = {
  type: SET_THING_MODEL_INFO;
  thingModelInfo: ThingModelInfo;
};

type SetCurrentVersion = {
  type: SET_CURRENT_VERSION;
  currentVersion: Pick<
    VersionItem,
    'id' | 'thingModelVersion' | 'publishedStatus'
  >;
};
type SetCurrentModelIndex = {
  type: SET_CURRENT_MODEL_INDEX;
  curModelIndex: number;
};
type SetVersionList = {
  type: SET_VERSION_LIST;
  versionList: VersionItem[];
};

type SetRefreshVersionList = {
  type: SET_REFRESH_VERSION_LIST;
  refreshVersionList: boolean;
};

export type EditThingModelInfoAction =
  | SetThingModelContentAction
  | SetCurrentVersion
  | SetCurrentModelIndex
  | SetVersionList
  | SetRefreshVersionList;

export type ThingModelState = {
  thingModelInfo: ThingModelInfo;
  currentVersion: Pick<
    VersionItem,
    'id' | 'thingModelVersion' | 'publishedStatus'
  >;
  curModelIndex: number;
  versionList: VersionItem[];
  refreshVersionList: boolean;
};

const initialState: ThingModelState = {
  thingModelInfo: thingModelData,
  currentVersion: {
    id: '',
    thingModelVersion: '',
    publishedStatus: 0,
  },
  curModelIndex: 0,
  versionList: [],
  refreshVersionList: true,
};
const reducer = (state = initialState, action: EditThingModelInfoAction) => {
  console.log(action);
  switch (action.type) {
    case SET_THING_MODEL_INFO:
      return {
        ...state,
        thingModelInfo: action.thingModelInfo,
      };
    case SET_CURRENT_VERSION:
      console.log(
        'SET_CURRENT_VERSION SET_CURRENT_VERSION SET_CURRENT_VERSION'
      );
      return {
        ...state,
        currentVersion: action.currentVersion,
      };
    case SET_CURRENT_MODEL_INDEX:
      console.log(
        'SET_CURRENT_MODEL_INDEX SET_CURRENT_MODEL_INDEX SET_CURRENT_MODEL_INDEX'
      );
      return {
        ...state,
        curModelIndex: action.curModelIndex,
      };
    case SET_VERSION_LIST:
      return {
        ...state,
        versionList: action.versionList,
      };
    case SET_REFRESH_VERSION_LIST:
      return {
        ...state,
        refreshVersionList: action.refreshVersionList,
      };
    default:
      return state;
  }
};

const [ctx, Provider] = createCtx<ThingModelState, EditThingModelInfoAction>(
  reducer,
  initialState
);
export { ctx };
export default Provider;
