import React, { useState } from 'react';
import { Prompt, useParams } from 'react-router-dom';

import Header from 'components/Header/index';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import ModelFormWrap from './modelInfo';
import './index.less';

function ModelBox(props: any) {
  const { name } = useParams<{ name: string; specName: string }>();

  const [formDirty, setFormDirty] = useState<boolean>(false);
  return (
    <div className="model-create">
      <Prompt when={formDirty} message="" />
      {/* 头部 start */}
      <Header title={`${name ? '编辑' : '创建'}模型`} back />
      {/* 中间 start */}
      <div className="container">
        <ObtainHeight>
          <ModelFormWrap {...props} setFormDirty={setFormDirty} />
        </ObtainHeight>
      </div>
    </div>
  );
}

export default ModelBox;
