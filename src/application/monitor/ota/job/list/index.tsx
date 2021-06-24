import React, { useState, useMemo } from 'react';
import { Button, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { ColumnProps } from 'antd/lib/table';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';

import Toast from 'components/SimpleToast/index';
import Header from 'components/Header';
import Modal from 'components/Modal/index';
import AuthButton from 'components/AuthButton';
import Table from 'components/Table';

import dayjs from 'dayjs';
import iconNull from 'static/pic/icon-null.png';
import { RouteConfigComponentProps } from 'router/react-router-config';
import useInitial from 'common/customHooks/useInitialList';
import SearchForm from '../../components/SearchForm';

import { QueryJobParams, JobInfo } from '../../../types';
import {
  getJobList,
  startJob,
  stopJob,
  cancelJob,
  deleteJob,
} from '../../../services';

import './index.less';
// 任务状态：1、已创建；2、运行中；3、已暂停；4、已取消；5、取消失败
export const jobStatusOption = [
  {
    name: '全部',
    key: '',
  },
  {
    name: '已创建',
    key: 1,
  },
  {
    name: '运行中',
    key: 2,
  },
  {
    name: '已完成',
    key: 3,
  },
  {
    name: '已取消',
    key: 4,
  },
  {
    name: '取消失败',
    key: 5,
  },
];
interface JobListProps extends RouteConfigComponentProps {}
function JobList(props: JobListProps) {
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];
  console.log(authVOList);

  const initQueryParam = useMemo(
    () => ({
      condition: {
        versionNo: '',
        thingTypeCode: '',
      },
      pageNo: 1,
      pageSize: 20,
      order: 'DESC',
    }),
    []
  );
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    JobInfo,
    QueryJobParams
  >(getJobList, initQueryParam, [], 'jobStorage');
  const [visible, setVisible] = useState<boolean>(false);
  const [jobToDel, setDelJob] = useState<JobInfo>({
    jobId: '',
    firmwareId: '',
    thingTypeCode: '',
    status: 1,
    updateTime: '',
    customized: '',
    scope: '',
  });

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('jobQueryParams', JSON.stringify(queryParam));
    props.history.push(destination);
  };
  // 启动任务
  const launchJob = async (item: JobInfo) => {
    try {
      const data = await startJob({
        jobId: item.jobId,
      });
      if (data && data.code === 200) {
        setQueryParam({ ...queryParam });
        Toast('启动成功');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 暂停任务
  const pauseJob = async (item: JobInfo) => {
    try {
      const data = await stopJob({
        jobId: item.jobId,
      });
      if (data && data.code === 200) {
        setQueryParam({ ...queryParam });
        Toast('暂停任务成功');
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 取消任务
  const closeJob = async (item: JobInfo) => {
    try {
      const data = await cancelJob({
        jobId: item.jobId,
      });
      if (data && data.code === 200) {
        setQueryParam({ ...queryParam });
        Toast('取消任务成功');
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 删除
  const delJob = (item: JobInfo) => {
    setVisible(true);
    setDelJob(item);
  };
  // 关闭弹出层
  const closeModal = () => {
    setVisible(false);
  };
  // 确认删除
  const doDel = async () => {
    try {
      const data = await deleteJob({
        jobId: jobToDel.jobId,
      });
      if (data) {
        Toast('删除成功');
        let queryPageNO = 1;
        if (pagination.lastPage === 1) {
          queryPageNO = 1;
        } else {
          queryPageNO =
            list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
        }
        setQueryParam({ ...queryParam, pageNo: queryPageNO });
        closeModal();
      }
    } catch (error) {
      // Toast(error.msg);
    }
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  // 提交查询
  const handleSubmit = (val: QueryJobParams) => {
    console.log(val);
    setQueryParam({ ...queryParam, ...val, pageNo: 1 });
  };

  const columns: ColumnProps<JobInfo>[] = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: '物类型',
      dataIndex: 'thingTypeCode',
      key: 'thingTypeCode',
      align: 'center',
    },
    {
      title: '固件版本',
      dataIndex: 'versionNo',
      key: 'versionNo',
      align: 'center',
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (text: number, record: JobInfo) =>
        jobStatusOption.find((item) => item.key === text)?.name || '',
    },

    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align: 'center',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },

    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (text: string, record: JobInfo) => (
        <div className="text-lg-left">
          <AuthButton
            title="查看进度"
            shape="circle"
            type="primary"
            className="handle-btn"
            onClick={() => goSubPage(`/ota/jobDetail/list/${record.jobId}`)}
            buttonKey="QUERY_PERMISSION"
            routeAuthVOList={authVOList}
          >
            <span className="icon icon-see" />
          </AuthButton>
          {![2, 5].includes(record.status) && (
            <AuthButton
              title="启动"
              shape="circle"
              type="primary"
              className="handle-btn"
              onClick={() => launchJob(record)}
              buttonKey="START_JOB_PERMISSION"
              routeAuthVOList={authVOList}
            >
              <span className="icon icon-start-job" />
            </AuthButton>
          )}
          {/* 2表示运行中 */}
          {record.status === 2 && (
            <>
              <AuthButton
                title="取消"
                shape="circle"
                type="primary"
                className="handle-btn"
                onClick={() => closeJob(record)}
                buttonKey="CANCEL_JOB_PERMISSION"
                routeAuthVOList={authVOList}
              >
                <span className="icon icon-cancel-job" />
              </AuthButton>
            </>
          )}

          {/* 2表示正在运行 isStarted 标识启动过的*/}
          {record.status !== 2 && (
            <>
              {!record.isStarted && (
                <AuthButton
                  title="编辑"
                  shape="circle"
                  type="primary"
                  className="handle-btn"
                  onClick={() => {
                    goSubPage(
                      `/ota/job/edit/${record.thingTypeCode}/${record.firmwareId}/${record.jobId}`
                    );
                  }}
                  buttonKey="UPDATE_PERMISSION"
                  routeAuthVOList={authVOList}
                >
                  <span className="icon icon-edit" />
                </AuthButton>
              )}

              <AuthButton
                title="删除"
                shape="circle"
                type="primary"
                className="handle-btn"
                onClick={() => delJob(record)}
                buttonKey="DELETE_PERMISSION"
                routeAuthVOList={authVOList}
              >
                <span className="icon icon-delete" />
              </AuthButton>
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <div className="job-list">
      <Header title="任务管理">
        <Link to="/ota/job/add" className="create-btn">
          <Button type="primary">新增任务</Button>
        </Link>
      </Header>
      <div className="job-header-content">
        {/* 查询 start */}
        <SearchForm
          onSubmit={handleSubmit}
          queryParam={queryParam}
          queryByStatus={true}
        />
        {/* 查询 end */}
      </div>
      <ObtainHeight bgColor="#fff">
        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.jobId}
          onShowSizeChange={onShowSizeChange}
          locale={{
            emptyText: (
              <Empty
                image={iconNull}
                imageStyle={{
                  height: 120,
                }}
                description={<span>当前物类型暂无任何任务</span>}
              />
            ),
          }}
        />
      </ObtainHeight>

      <Modal
        title="删除任务"
        visible={visible}
        onCancel={closeModal}
        onOk={doDel}
      >
        <p>您确定要删除任务{(jobToDel as JobInfo).jobId}吗?</p>
      </Modal>
    </div>
  );
}

export default JobList;
