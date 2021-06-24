import React, { useState } from 'react';

import AuthButton from 'components/AuthButton';
import Table from 'components/Table';

import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';

import useInitial from 'common/customHooks/useInitialList';
import Header from 'components/Header';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';

import { ColumnProps } from 'antd/lib/table';

import SearchForm from './components/SearchForm';
import ArchiveFormModal from '../archiveForm';
import { queryList, deleteArchive } from '../services/index';
import { ArchiveItem, QueryProfileParams } from '../types/index';

import './list.less';

function ArchiveDict(props: any) {
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];
  const initQueryParam: QueryProfileParams = {
    pageSize: 20,
    pageNo: 1,
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    ArchiveItem,
    QueryProfileParams
  >(queryList, initQueryParam, [], 'profileStorage');
  const [modalVis, setModalVis] = useState<boolean>(false);
  const [handleInfo, setHandleInfo] = useState<ArchiveItem>();
  const [archiveModalVisible, setArchiveModalVisible] = useState<boolean>(
    false
  );
  enum dataTypeEnum {
    'Bool' = 1,
    'Int' = 2,
    'Double' = 3,
    'String' = 4,
    'DICT' = 5,
  }
  enum scopeEnum {
    '全局设备' = 1,
    '全局物类型' = 2,
    '物类型设备' = 3,
  }
  const openArchivesModal = (info?: ArchiveItem) => {
    setHandleInfo(info);
    setArchiveModalVisible(true);
  };
  const handleDeleteArchiveItemInTime = () => {
    console.log('del方法调用');
    console.log('handleInfo', handleInfo);
    if (handleInfo) {
      const { scope, id, thingTypeCode, profileName } = handleInfo;
      const paramsDel: any = { id, scope, profileName };
      if (scope === 3) {
        paramsDel.thingTypeCode = thingTypeCode;
      }
      deleteArchive(paramsDel).then((data: any) => {
        // console.log('删除后data', data);
        if (data && data.code === 200) {
          Toast('删除成功');

          setModalVis(false);
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
        } else {
          Toast('删除失败');

          setModalVis(false);
        }
      });
    }
  };
  const handleDeleteIconAction = (record: any) => {
    setModalVis(true);
    setHandleInfo(record);
  };
  const handleSubmit = (val: QueryProfileParams) => {
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
  //
  const saveArchiveInfo = () => {
    setQueryParam({ ...queryParam });
    setArchiveModalVisible(false);
  };
  // 列表
  const columns: ColumnProps<ArchiveItem>[] = [
    {
      title: '档案名称',
      dataIndex: 'profileName',
      key: 'profileName',
      width: '20%',
    },
    {
      title: '档案类型',
      dataIndex: 'scope',
      key: 'scope',
      width: '20%',
      render: (text: number) => scopeEnum[text],
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: '20%',
      render: (text: number) => dataTypeEnum[text],
    },
    {
      title: '是否必填',
      dataIndex: 'mandatory',
      key: 'mandatory',
      width: '15%',
      render: (text: number) => (text ? '必填' : '非必填'),
    },
    {
      title: '是否可修改',
      dataIndex: 'editable',
      key: 'editable',
      width: '15%',
      render: (text: number) => (text ? '可修改' : '不可修改'),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: ArchiveItem) => (
        <>
          <AuthButton
            className="btn btn-edit"
            title="编辑"
            type="primary"
            shape="circle"
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => openArchivesModal(record)}
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
            onClick={() => handleDeleteIconAction(record)}
          >
            <span className="icon-delete" />
          </AuthButton>
        </>
      ),
    },
  ];
  return (
    <div className="archive-dict-list">
      {/* 头部 start */}
      <Header title="档案列表">
        <AuthButton
          type="primary"
          buttonKey="CREATE_PERMISSION"
          className="btn create-btn"
          routeAuthVOList={authVOList}
          onClick={() => openArchivesModal()}
        >
          新增档案
        </AuthButton>
      </Header>
      {/* 头部end */}
      {/* 查询 start */}
      <SearchForm onSubmit={handleSubmit} queryParam={queryParam} />
      {/* 查询 end */}

      {/* 列表start */}
      <ObtainHeight bgColor="#fff">
        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.id}
          onShowSizeChange={onShowSizeChange}
        />
      </ObtainHeight>
      {/* 列表end */}
      {/* 新建&编辑档案信息 */}
      <ArchiveFormModal
        visible={archiveModalVisible}
        data={handleInfo}
        onCancel={() => setArchiveModalVisible(false)}
        onOk={saveArchiveInfo}
      />
      <Modal
        visible={modalVis}
        title="删除档案"
        onOk={handleDeleteArchiveItemInTime}
        onCancel={() => setModalVis(false)}
        cancelText="取消"
        okText="删除"
      >
        档案删除后将不可恢复，确定要删除该档案吗？
      </Modal>
    </div>
  );
}

export default ArchiveDict;
