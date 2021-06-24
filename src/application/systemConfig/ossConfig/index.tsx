import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Form, Modal, Alert, Tooltip } from 'antd';
import Table from 'components/Table';
import { useLocation } from 'react-router-dom';
import AuthButton from 'components/AuthButton';
import SearchForm from './component/SearchForm';
import Header from 'components/Header/index';
import { FormComponentProps } from 'antd/lib/form';
import { getOSSList, deleteOss } from '../service';
import { OSS, QueryOSSParam, QueryOSSParamCondition } from '../types';
import SimpleToast from 'components/SimpleToast';
import useInitialList from 'common/customHooks/useInitialList';

import { RouteConfigComponentProps } from '../../../router/react-router-config';
import 'dayjs/locale/zh-cn';
import { ColumnProps } from 'antd/lib/table';

dayjs.locale('zh-cn');

interface Props extends FormComponentProps, RouteConfigComponentProps {}

function OSSConfig(props: Props) {
  const location = useLocation();
  const { search } = location;
  console.log(search, 'search---');
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];

  const PAGE_SIZE = 20;

  const initQueryParam: QueryOSSParam = {
    pageNo: 1,
    pageSize: PAGE_SIZE,
  };

  const [
    { queryParam, list, pagination, loading },
    setQueryParam,
  ] = useInitialList<any, QueryOSSParam>(getOSSList, initQueryParam, []);

  const [currentOss, setCurrentOss] = useState<OSS>();
  const [showDelModal, setShowDelModal] = useState<boolean>(false);

  const handleSubmit = (param: QueryOSSParamCondition) => {
    setQueryParam({
      ...param,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
    });
  };

  function handleDelete(): void {
    deleteOss({
      id: currentOss?.id,
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
          setShowDelModal(false);
        }
      })
      ['catch']((error) => {
        setShowDelModal(false);
      });
  }

  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };
  // 切换页码
  const onPageChange = (page: number) => {
    setQueryParam({
      ...queryParam,
      pageNo: page,
    });
  };

  function handleClickDelBtn(item: OSS) {
    setShowDelModal(true);
    setCurrentOss(item);
  }

  const columns: ColumnProps<OSS>[] = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      ellipsis: true,
    },
    {
      title: 'Bucket',
      dataIndex: 'bucket',
      key: 'bucket',
      ellipsis: true,
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },

    {
      title: '操作',
      render: (text: string, record: OSS) => (
        <>
          <AuthButton
            className="operation-btn"
            shape="circle"
            title="查看"
            buttonKey="QUERY_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              props.history.push(`/systemConfig/ossConfig/view/${record.id}`);
            }}
          >
            <span className="icon-see" />
          </AuthButton>
          <AuthButton
            className="btn btn-edit"
            title="编辑"
            type="primary"
            shape="circle"
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              props.history.push(`/systemConfig/ossConfig/edit/${record.id}`);
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
    <div className="oss-config">
      <Header title="对象存储配置">
        <Tooltip
          title="设备上传文件需要访问的对象存储服务，平台会通过安全通道向设备提供访问的安全凭证"
          placement="right"
          overlayStyle={{ fontSize: 12 }}
        >
          <span
            className="ml-5 primary-color icon-help"
            style={{ color: '#fbc606' }}
          />
        </Tooltip>
        <AuthButton
          buttonKey="CREATE_PERMISSION"
          type="primary"
          routeAuthVOList={authVOList}
          className="btn create-btn"
          onClick={() => {
            props.history.push(`/systemConfig/ossConfig/create/${null}`);
          }}
        >
          创建对象存储
        </AuthButton>
      </Header>
      <SearchForm onSubmit={handleSubmit} />

      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={onPageChange}
        loading={loading}
        rowKey={(record) => record.id}
        onShowSizeChange={onShowSizeChange}
      />
      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelModal}
        onOk={handleDelete}
        onCancel={() => {
          setShowDelModal(false);
        }}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>对象存储删除后不可恢复，您确定要删除</p>
      </Modal>
    </div>
  );
}

export default Form.create<Props>({})(OSSConfig);
