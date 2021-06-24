import React, { useState } from 'react';
import { RouteComponentProps, useLocation, Prompt } from 'react-router-dom';

import Header from 'components/Header';
import EditFirmware from './edit';
import ViewFirmware from './view';

import { FirmwareProvider } from './context';

import './index.less';

type FirmwareInfoProps = RouteComponentProps;
function FirmwareInfoWrap(props: FirmwareInfoProps) {
  const [formDirty, setFormDirty] = useState<boolean>(false);
  const location = useLocation();
  const isView = location.pathname.includes('firmware/view');
  return (
    <FirmwareProvider>
      <Prompt when={formDirty} message="" />

      {/* 已发布不能编辑；未发布可以编辑  */}
      {!isView ? (
        <EditFirmware setFormDirty={setFormDirty} />
      ) : (
        <ViewFirmware />
      )}
    </FirmwareProvider>
  );
}

export default FirmwareInfoWrap;
