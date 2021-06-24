import React, { useState } from 'react';
import { RouteComponentProps, withRouter, Prompt } from 'react-router-dom';

import Header from 'components/Header';
import EditJob from './edit';
import ViewJob from './view';

import './index.less';

type FirmwareInfo = RouteComponentProps;
function FirmwareInfo(props: FirmwareInfo) {
  const [formDirty, setFormDirty] = useState<boolean>(false);
  const isView = props.location.pathname.includes('/job/view');
  const isAdd = props.location.pathname.includes('/job/add');
  return (
    <>
      <Prompt when={formDirty} message="" />
      <Header
        back
        to="/ota/job/list"
        title={
          !isView ? (isAdd ? '新增升级任务' : '编辑升级任务') : '查看升级任务'
        }
      />
      {/* 已发布不能编辑；未发布可以编辑 TODO:// 添加和编辑使用组件，查看单独写一个组件 */}
      {!isView ? <EditJob setFormDirty={setFormDirty} /> : <ViewJob />}
    </>
  );
}

export default withRouter(FirmwareInfo);
