/* eslint-disable global-require */
import React, { useRef, useState, useLayoutEffect } from 'react';
import { Table, ConfigProvider } from 'antd';
import SPagination from 'components/Pagination';
import { triggerEvent } from 'utils/tools';
import { TableProps } from './interface';

import './index.less';

// 自定义的表格内容
const SCell = ({
  children,
  pagination,
  ...restProps
}: any): React.ReactElement => {
  return <td {...restProps}>{children}</td>;
};

const STable = ({
  pagination,
  pageChange,
  onShowSizeChange,
  columns,
  emptyType,
  dataSource,
  scrollHeight,
  ...restProps
}: TableProps): React.ReactElement => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(
    document.documentElement.clientHeight - 200
  );

  const setObtainHeight = () => {
    const contentDom: HTMLDivElement | null = tableRef.current;
    if (contentDom) {
      const top = contentDom.getBoundingClientRect().top;
      // getElementTop(contentDom as HTMLDivElement);
      const boxHeight = document.documentElement.clientHeight - top - 152;
      setHeight(boxHeight);
    }
  };
  useLayoutEffect(() => {
    setObtainHeight();
    window.onresize = () => {
      setObtainHeight();
    };
    // 主动触发一次resize,解决计算不准确的bug
    const evt = window.document.createEvent('UIEvents');
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
    setTimeout(() => {
      triggerEvent(window, 'resize');
    }, 0);
    return () => {
      window.onresize = null;
    };
  }, []);
  const components = {
    body: {
      cell: SCell,
    },
  };
  // 定义空类型的两种类型
  const EmptyType = ['noSearch', 'empty'];

  // 空内容
  const customizeRenderEmpty = () => (
    // 这里面就是我们自己定义的空状态
    <div className="empty">
      {emptyType === EmptyType[0] ? (
        <>
          <img
            src={require('../../static/img/null-search.png')}
            alt="未搜索到"
            className="empty-img"
          />
          <p className="empty-text">没有找到符合条件的信息</p>
        </>
      ) : (
        <>
          <img
            // 这个是模型的空图片，不对
            src={require('../../static/img/null-model.png')}
            alt="暂无内容"
            className="empty-img"
          />
          <p className="empty-text">暂无内容</p>
        </>
      )}
    </div>
  );
  return (
    <div className="stable-wrap" ref={tableRef}>
      <ConfigProvider renderEmpty={customizeRenderEmpty} prefixCls="IOT">
        <Table
          {...restProps}
          pagination={false}
          components={components}
          columns={columns}
          dataSource={dataSource}
          scroll={{ y: scrollHeight || height }}
        />
        {pagination && pageChange && dataSource && dataSource.length > 0 && (
          <div className="footer">
            <SPagination
              total={pagination.total}
              pageSize={pagination.pageSize}
              current={pagination.pageNo as number}
              showTotal={(total, range) =>
                `第 ${range[0]} 条 - 第 ${range[1]} 条，共 ${total} 条`
              }
              onChange={pageChange}
              onShowSizeChange={onShowSizeChange}
            />
          </div>
        )}
      </ConfigProvider>
    </div>
  );
};

export default STable;
