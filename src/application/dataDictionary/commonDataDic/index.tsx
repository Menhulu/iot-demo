import React from 'react';
import ComDataContextWrap from './context';
import CommonDataDic from './home';

function CommonDataDicWrap(props: any) {
  return (
    <ComDataContextWrap>
      <CommonDataDic authVOList={props.authVOList} />
    </ComDataContextWrap>
  );
}

export default CommonDataDicWrap;
