import React from 'react';
import { Pagination } from 'antd';
import { SPaginationProps } from './interface';
import './index.less';

function SPagination(props: SPaginationProps) {
  const { position, ...restProps } = props;
  return (
    <div className={`pagination-wrap ${position || 'center'}`}>
      <Pagination
        showSizeChanger
        pageSizeOptions={['10', '20', '50', '100']}
        {...restProps}
      />
    </div>
  );
}

export default SPagination;
