import React, { useState } from 'react';

import { ColumnProps } from 'antd/lib/table';

import AuthButton from 'components/AuthButton/index';

import Modal from 'components/Modal';
import Table from 'components/Table';

import Toast from 'components/SimpleToast';
import Header from 'components/Header/index';
import dayjs from 'dayjs';
import useInitial from 'common/customHooks/useInitialList';
import SearchForm from './components/SearchForm';
import { getEdgeAppList, delEdgeApp } from '../../service';
import { EdgeAppItem, QueryEdgeAppParam } from '../../types';
import { type } from '../../constants';
// import './list.less';

function EdgeAppList(props: any) {
  // 页面按钮权限
  const { authVOList } = props.route;

  const initQueryParam: QueryEdgeAppParam = {
    condition: {},
    pageNo: 1,
    pageSize: 20,
  };
  const [showDelApp, setShowDelApp] = useState(false);
  const [edgeAppToDel, setEdgeAppToDel] = useState({
    code: '',
    name: '',
    id: '',
  });

  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    EdgeAppItem,
    QueryEdgeAppParam
  >(getEdgeAppList, initQueryParam, [], 'edgeAppList');

  /**
   * @description:
   * @param {type}
   * @return:
   */
  function handleDelete(): void {
    delEdgeApp({
      appId: edgeAppToDel?.id,
    })
      .then((res) => {
        if (res && res.code === 200) {
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
          Toast('删除成功！');
          setShowDelApp(false);
        }
      })
      ['catch']((error) => {
        setShowDelApp(false);
      });
  }

  /**
   * @description: 点击不删除的按钮
   * @param {type}
   * @return:
   */
  function handleCancelDel(): void {
    setShowDelApp(false);
  }

  /**
   * @description: 点击列表上的删除图标
   * @param {type}
   * @return:
   */
  function handleClickDelBtn(item: EdgeAppItem) {
    const { code, name, id } = item;
    setShowDelApp(true);
    setEdgeAppToDel({ code: code || '', name, id });
  }

  const handleSubmit = (val: Partial<QueryEdgeAppParam>) => {
    console.log(val);
    setQueryParam({ ...queryParam, ...val, pageNo: 1 });
  };
  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('edgeAppList', JSON.stringify(queryParam));
    props.history.push(destination);
  };

  // 列表
  const columns: ColumnProps<EdgeAppItem>[] = [
    {
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '应用编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '应用类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: any, record: EdgeAppItem) =>
        type[text as keyof typeof type],
    },
    {
      title: '发布方',
      dataIndex: 'vendor',
      key: 'vendor',
    },

    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: number, record: EdgeAppItem) =>
        dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') || '--',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: EdgeAppItem) => (
        <>
          <AuthButton
            className="btn btn-edit"
            title="查看"
            type="primary"
            shape="circle"
            buttonKey="QUERY_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              goSubPage(`/edge/app/edit/${record.id}`);
            }}
          >
            <span className="icon-see" />
          </AuthButton>
          <AuthButton
            className="btn btn-delete"
            type="primary"
            title="删除"
            shape="circle"
            buttonKey="DELETE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => handleClickDelBtn(record)}
          >
            <span className="icon-delete" />
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <div className="edge-app-list">
      {/* 头部 start */}
      <Header title="应用列表">
        <AuthButton
          type="primary"
          className="btn create-btn"
          buttonKey="CREATE_PERMISSION"
          routeAuthVOList={authVOList}
          onClick={() => {
            goSubPage(`/edge/app/add`);
          }}
        >
          注册应用
        </AuthButton>
      </Header>

      {/* 头部end */}
      {/* 查询 start */}
      <SearchForm onSubmit={handleSubmit} queryParam={queryParam} />
      {/* 查询 end */}
      {/* 列表start */}

      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.id}
        onShowSizeChange={onShowSizeChange}
      />

      {/* 列表end */}

      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelApp}
        onOk={handleDelete}
        onCancel={handleCancelDel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>应用删除后不可恢复，您确定要删除</p>
        <p>应用 “{edgeAppToDel.name}” 吗？</p>
      </Modal>
    </div>
  );
}

export default EdgeAppList;
