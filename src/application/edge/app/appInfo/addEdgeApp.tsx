import React, { useState } from 'react';

import Header from 'components/Header';

import BasicInfo from './components/basicInfo';
import { Prompt, useHistory } from 'react-router-dom';

import './style.less';

export interface AddEdgeAppProps {}

const AddEdgeApp: React.FC<AddEdgeAppProps> = () => {
  const [flag, setFlag] = useState(false);

  return (
    <div className="edgeAppBasicInfo">
      <Prompt when={flag} message="" />
      <Header back to="/edge/app" title="注册应用" />
      <BasicInfo setFormDirty={setFlag} hasVersion={false} />
    </div>
  );
};
export default AddEdgeApp;
