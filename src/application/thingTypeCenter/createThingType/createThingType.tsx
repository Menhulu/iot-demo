import React, { useState } from 'react';
import { Prompt } from 'react-router-dom';
import Header from 'components/Header';
import CreateDeviceModelInfo from './createThingTypeInfo';

const CreateDeviceModel = (props: any) => {
  const [formDirty, setFormDirty] = useState<boolean>(false);
  return (
    <>
      <Prompt when={formDirty} message="" />
      <Header back title="创建物类型" />
      <CreateDeviceModelInfo setFormDirty={setFormDirty} />
    </>
  );
};

export default CreateDeviceModel;
