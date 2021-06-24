import React, { useState } from 'react';

import { ColumnProps } from 'antd/lib/table';

import AuthButton from 'components/AuthButton/index';

import Modal from 'components/Modal';
import Table from 'components/Table';

import SimpleToast from 'components/SimpleToast';
import Header from 'components/Header/index';
import dayjs from 'dayjs';
import useInitial from 'common/customHooks/useInitialList';
import SearchForm from './components/SearchForm';
import { deleteThingType, getThingTypeList } from '../services/thingTypeList';
import { ThingTypeItem, GetThingTypeListParam } from '../types/index';
import { nodeTypeConfig } from 'utils/constants';

import './list.less';

function ThingTypeList(props: any) {
  // 页面按钮权限
  const { authVOList } = props.route;

  const initThingTypeList: ThingTypeItem[] = [];
  const initQueryParam: GetThingTypeListParam = {
    name: '',
    code: '',
    pageNo: 1,
    pageSize: 20,
    nodeType: '',
  };
  const [showDelModel, setShowDelModel] = useState(false);
  const [thingTypeToDel, setThingTypeToDel] = useState({ code: '', name: '' });

  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    ThingTypeItem,
    GetThingTypeListParam
  >(getThingTypeList, initQueryParam, initThingTypeList, 'thingTypeStorage');

  /**
   * @description:
   * @param {type}
   * @return:
   */
  function handleDelete(): void {
    deleteThingType({
      code: thingTypeToDel.code,
      name: thingTypeToDel.name,
    })
      .then((res) => {
        if (res) {
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
          SimpleToast('删除成功！');
          setShowDelModel(false);
        }
      })
      ['catch']((error) => {
        setShowDelModel(false);
      });
  }

  /**
   * @description: 点击不删除的按钮
   * @param {type}
   * @return:
   */
  function handleCancelDel(): void {
    setShowDelModel(false);
  }

  /**
   * @description: 点击列表上的删除图标
   * @param {type}
   * @return:
   */
  function handleClickDelBtn(item: ThingTypeItem) {
    const { code, name } = item;
    setShowDelModel(true);
    setThingTypeToDel({ code: code || '', name });
  }

  const handleSubmit = (val: GetThingTypeListParam) => {
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
  /**
   * @description: 根据item展示设备的类型
   * @param {type}
   * @return:
   */
  function renderDeviceType(item: ThingTypeItem) {
    const { nodeType } = item;

    let deviceTypeText: any = '';
    if (nodeType) {
      deviceTypeText = nodeTypeConfig.find((item) => item.value === nodeType)
        ?.label;
    }

    return deviceTypeText;
  }

  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('thingTypeStorage', JSON.stringify(queryParam));
    props.history.push(destination);
  };

  // 列表
  const columns: ColumnProps<ThingTypeItem>[] = [
    {
      title: '物类型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '物类型编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '节点类型',
      dataIndex: 'nodeType',
      key: 'nodeType',
      render: (text: number, record: ThingTypeItem) => renderDeviceType(record),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: number, record: ThingTypeItem) =>
        dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') || '--',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: ThingTypeItem) => (
        <>
          <AuthButton
            className="btn btn-edit"
            title="编辑"
            type="primary"
            shape="circle"
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              goSubPage(`/thingtype/edit/${record.code}/${record.nodeType}`);
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
            onClick={() => handleClickDelBtn(record)}
          >
            <span className="icon-delete" />
          </AuthButton>
        </>
      ),
    },
  ];

  return (
    <div className="device-model-list">
      {/* 头部 start */}
      <Header title="物类型列表">
        <AuthButton
          type="primary"
          className="btn go-create-btn"
          buttonKey="CREATE_PERMISSION"
          routeAuthVOList={authVOList}
          onClick={() => {
            goSubPage(`/thingtype/create`);
          }}
        >
          创建物类型
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
        rowKey={(record) => record.code}
        onShowSizeChange={onShowSizeChange}
      />

      {/* 列表end */}

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
        <p>物类型删除后不可恢复，您确定要删除</p>
        <p>物类型 “{thingTypeToDel.name}” 吗？</p>
      </Modal>
    </div>
  );
}

export default ThingTypeList;
