import React, { createContext, useReducer } from 'react';
import { CreateEditDataDicInfo } from '../types';

export const SET_EDIT_INFO = 'set_edit_info';
export const SET_CDMODAL_SHOW = 'set_cdmodal_show';
export const SET_AUTHVOLIST = 'set_authvolist';

type EditStoreAction = {
  type: string;
  createEditInfo?: CreateEditDataDicInfo;
  iscreateEditShow?: boolean;
  authVOList?: [];
};

export type EditStoreState = {
  createEditInfo: CreateEditDataDicInfo;
  iscreateEditShow: boolean;
  authVOList: [];
};

const defaultState: EditStoreState = {
  createEditInfo: {
    type: '',
    name: '',
    code: '',
    dictOrder: 0,
  },
  iscreateEditShow: false,
  authVOList: [],
};

const defaultDispatch: React.Dispatch<EditStoreAction> = () => defaultState;

export const CreateEditContext = createContext({
  state: defaultState,
  dispatch: defaultDispatch,
});

const reducer = (state = defaultState, action: EditStoreAction) => {
  switch (action.type) {
    case SET_EDIT_INFO:
      return {
        ...state,
        createEditInfo: { ...state.createEditInfo, ...action.createEditInfo },
      };
    case SET_CDMODAL_SHOW:
      return {
        ...state,
        iscreateEditShow: action.iscreateEditShow || false,
      };
    case SET_AUTHVOLIST:
      return {
        ...state,
        authVOList: action.authVOList || [],
      };
    default:
      return state;
  }
};

interface Props {
  children?: JSX.Element[] | JSX.Element | React.ReactNode;
  className?: string;
}

function ComDataContextWrap(props: Props) {
  const [state, dispatch] = useReducer<
    React.Reducer<EditStoreState, EditStoreAction>
  >(reducer, defaultState);

  return (
    <CreateEditContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CreateEditContext.Provider>
  );
}

export default ComDataContextWrap;
