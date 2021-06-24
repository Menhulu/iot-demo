import React, { useState } from 'react';
import Header from 'components/Header';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import useInitial from 'common/customHooks/useInitialList';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import AuthButton from 'components/AuthButton/index';
import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';
import dayjs from 'dayjs';

import SearchForm from './components/SearchForm';

import { ModelListQueryParam, QueryModelRes } from '../types/index';
import { getModelList, delModel } from '../services/index';
import './index.less';

const ModelList = (props: any): React.ReactElement => {
  // 页面按钮权限
  const { authVOList } = props.route;
  const initQueryParam: ModelListQueryParam = {
    pageNo: 1,
    pageSize: 20,
    modelDisplayName: '',
    order: '',
    isStd: -1,
  };
  const initList: QueryModelRes[] = [];
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    QueryModelRes,
    ModelListQueryParam
  >(getModelList, initQueryParam, initList, 'modelStorage');
  const [showDelModel, setShowDelModel] = useState(false);
  const [modelToHandle, setModelToHandle] = useState<QueryModelRes>();

  const deleteModel = (model: QueryModelRes) => {
    setModelToHandle(model);
    setShowDelModel(true);
  };
  /**
   * @description:
   * @param {type}
   * @return:
   */
  function handleDelete(): void {
    if (modelToHandle) {
      delModel({
        modelName: modelToHandle.modelName,
        specName: modelToHandle.specName,
      })
        .then((res) => {
          if (res) {
            let queryPageNO = 1;
            if (pagination.lastPage === 1) {
              queryPageNO = 1;
            } else {
              queryPageNO =
                list.length === 1 ? pagination.lastPage - 1 : pagination.pageNo;
            }
            setQueryParam({ ...queryParam, pageNo: queryPageNO });
            Toast('删除成功！');
            setShowDelModel(false);
          }
        })
        ['catch']((error) => {
          setShowDelModel(false);
        });
    }
  }

  /**
   * @description: 点击不删除的按钮
   * @param {type}
   * @return:
   */
  function handleCancelDel(): void {
    setShowDelModel(false);
  }
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('modelStorage', JSON.stringify(queryParam));
    props.history.push(destination);
  };

  // 列表
  const columns: ColumnProps<QueryModelRes>[] = [
    {
      title: '模型名称',
      dataIndex: 'modelDisplayName',
      key: 'modelDisplayName',
    },
    {
      title: '模型标识',
      dataIndex: 'modelName',
      key: 'modelName',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: number, record: QueryModelRes) =>
        record.updateTime
          ? dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')
          : '--',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string, record: QueryModelRes) => (
        <>
          <AuthButton
            className="btn btn-edit"
            title="编辑"
            type="primary"
            shape="circle"
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              goSubPage(
                `/thingModel/edit/${record.modelName}/${record.specName}`
              );
            }}
          >
            <span className="icon-edit" />
          </AuthButton>
          <AuthButton
            className="btn btn-delete"
            type="primary"
            title="删除"
            shape="circle"
            buttonKey="DELETE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => deleteModel(record)}
          >
            <span className="icon-delete" />
          </AuthButton>
        </>
      ),
    },
  ];

  const handleSubmit = (val: { displayName: string; isStd: number }) => {
    setQueryParam({
      ...queryParam,
      modelDisplayName: val.displayName || '',
      isStd: val.isStd === undefined ? -1 : val.isStd,
    });
  };
  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  return (
    <div className="model-list">
      <Header title="模型列表">
        <Link to="/thingModel/create">
          <Button className="add-btn" type="primary">
            创建模型
          </Button>
        </Link>
      </Header>
      <SearchForm onSubmit={handleSubmit} />
      <ObtainHeight>
        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.modelName}
          onShowSizeChange={onShowSizeChange}
        />
      </ObtainHeight>
      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelModel}
        onOk={handleDelete}
        onCancel={handleCancelDel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>物类型型型删除后不可恢复，您确定要删除</p>
        <p>
          物类型 “{modelToHandle ? modelToHandle.modelDisplayName : ''}” 吗？
        </p>
      </Modal>
    </div>
  );
};

export default ModelList;
