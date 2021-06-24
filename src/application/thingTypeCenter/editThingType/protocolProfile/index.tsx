import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';
import useInitial from 'common/customHooks/useInitialList';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';
import dayjs from 'dayjs';
import ProfileInfoModalForm from './basicProfileInfo';

import {
  QueryProfileParam,
  ProfileInfo,
  ProfileFormInfo,
} from '../../types/protocolProfile';

import {
  queryProfileList,
  deleteProfile,
  addProfile,
  updateProfile,
} from '../../services/protocolProfile';
import './index.less';

const ProtocolProfile = () => {
  const { id } = useParams<{ id: string; nodeType: string }>();
  const initQueryParam: QueryProfileParam = {
    pageNo: 1,
    pageSize: 20,
    thingTypeCode: id,
    scope: 3,
  };
  const initList: ProfileInfo[] = [];
  const initProfileToHandle = {
    id: '',
    profileName: '',
    profileCode: '',
    mandatory: 0,
    scope: 3,
    dataType: 4,
    editable: 1,
    thingTypeCode: id,
    profileDesc: '',
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    ProfileInfo,
    QueryProfileParam
  >(queryProfileList, initQueryParam, initList);
  const [showDelProfile, setShowDelProfile] = useState(false);
  const [profileToHandle, setProfileToHandle] = useState<ProfileFormInfo>(
    initProfileToHandle
  );
  const [profileInfoModalVisible, setProfileInfoModalVisible] = useState<
    boolean
  >(false);
  // 新增&编辑档案
  const openProfileInfoModal = (data?: ProfileInfo) => {
    const profileInfo = { ...initProfileToHandle, ...data };
    setProfileToHandle(profileInfo);
    setProfileInfoModalVisible(true);
  };

  // 保存档案
  const saveProfileInfo = async (val: ProfileFormInfo) => {
    let res;
    if (!val.id) {
      delete val.id;
      res = await addProfile([{ ...val }]);
    } else {
      res = await updateProfile({ ...val });
    }
    if (res.code === 200) {
      Toast('保存成功');
      setProfileInfoModalVisible(false);
      setQueryParam({ ...queryParam });
    }
  };
  // 删除档案
  const delProfile = (item: ProfileInfo) => {
    setShowDelProfile(true);
    setProfileToHandle(item);
  };

  /**
   * @description:
   * @param {type}
   * @return:
   */
  function handleDelete(): void {
    if (profileToHandle) {
      deleteProfile({
        id: profileToHandle.id || '',
        thingTypeCode: profileToHandle.thingTypeCode,
        profileName: profileToHandle.profileName,
        scope: profileToHandle.scope,
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
            setShowDelProfile(false);
          }
        })
        ['catch']((error) => {
          setShowDelProfile(false);
        });
    }
  }

  /**
   * @description: 点击不删除的按钮
   * @param {type}
   * @return:
   */
  function handleCancelDel(): void {
    setShowDelProfile(false);
  }
  // 列表
  const columns: ColumnProps<ProfileInfo>[] = [
    {
      title: '档案名称',
      dataIndex: 'profileName',
      key: 'profileName',
    },
    {
      title: '是否必填',
      dataIndex: 'mandatory',
      key: 'mandatory',
      render: (text: number) => (text === 0 ? '否' : '是'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string, record: ProfileInfo) => (
        <>
          <Button
            className="btn btn-edit"
            title="编辑"
            type="primary"
            shape="circle"
            onClick={() => openProfileInfoModal(record)}
          >
            <span className="icon-edit" />
          </Button>
          <Button
            className="btn btn-delete"
            type="primary"
            title="删除"
            shape="circle"
            onClick={() => delProfile(record)}
          >
            <span className="icon-delete" />
          </Button>
        </>
      ),
    },
  ];

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  return (
    <div className="protocol-profile-list">
      <div className="action-btn-wrap">
        <Button type="primary" onClick={() => openProfileInfoModal()}>
          新增档案
        </Button>
      </div>
      <ObtainHeight>
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
      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelProfile}
        onOk={handleDelete}
        onCancel={handleCancelDel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>档案删除后不可恢复，您确定要删除</p>
        <p>档案 “{profileToHandle ? profileToHandle.profileName : ''}” 吗？</p>
      </Modal>

      {/* 新建编辑模型 start */}
      <ProfileInfoModalForm
        visible={profileInfoModalVisible}
        data={profileToHandle}
        onCancel={() => setProfileInfoModalVisible(false)}
        onOk={saveProfileInfo}
      />
      {/* 新建编辑模型end */}
    </div>
  );
};

export default ProtocolProfile;
