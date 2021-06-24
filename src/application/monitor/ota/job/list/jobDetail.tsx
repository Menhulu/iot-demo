import React, { useState, useEffect } from 'react';
import { Empty, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';

import { ColumnProps } from 'antd/lib/table';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Header from 'components/Header';

import Table from 'components/Table';

import iconNull from 'static/pic/icon-null.png';
import { RouteConfigComponentProps } from 'router/react-router-config';
import useInitial from 'common/customHooks/useInitialList';

import {
  JobInfo,
  JobProgressDetailInfo,
  QueryJobProgress,
} from '../../../types';
import { getJobDetail, getJobProcess } from '../../../services';

import './index.less';
import { jobStatusOption } from '.';

interface JobDetailListProps extends RouteConfigComponentProps {}
function JobDetailList(props: JobDetailListProps) {
  const { jobId } = useParams<{ jobId: string }>();
  // 任务状态：1、已创建；2、运行中；3、已暂停；4、已取消；5、取消失败
  const otaStateOption = [
    {
      name: '完成',
      key: '99',
    },
    {
      name: '正在准备',
      key: '1',
    },
    {
      name: '正在等待用户确认下载',
      key: '2',
    },
    {
      name: '正在下载',
      key: '3',
    },
    {
      name: '下载完成',
      key: '4',
    },
    {
      name: '失败',
      key: '-1',
    },
    {
      name: '正在等待用户确认安装',
      key: '5',
    },
    {
      name: '正在安装',
      key: '6',
    },
  ];
  const errorCodeOption = [
    {
      name: '无异常',
      key: '0',
    },
    {
      name: 'OTA任务已取消',
      key: '1001',
    },
    {
      name: '用户取消下载',
      key: '2001',
    },
    {
      name: '用户取消安装',
      key: '2002',
    },
    {
      name: '差分包基包验证失败',
      key: '3001',
    },
    {
      name: '下载失败',
      key: '3002',
    },
    {
      name: '签名验证失败',
      key: '3003',
    },
    {
      name: '差分包还原失败',
      key: '3004',
    },
    {
      name: '安装失败',
      key: '3005',
    },
  ];
  const initQueryParam = { jobId: jobId, pageNo: 1, pageSize: 20 };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    JobProgressDetailInfo,
    QueryJobProgress
  >(getJobProcess, initQueryParam, [], 'jobProcessStorage');
  const [jobDetail, setJobDetail] = useState<JobInfo>();
  useEffect(() => {
    getJobDetail({ jobId: jobId }).then((res) => {
      if (res.code === 200) {
        setJobDetail(res.data);
      }
    });
  }, [jobId]);
  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };

  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };

  const columns: ColumnProps<JobInfo>[] = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: '升级前固件版本',
      dataIndex: 'srcVersion',
      key: 'srcVersion',
      render: (text: string, record: JobInfo) => (
        <>{record.srcVersion || '--'}</>
      ),
    },
    {
      title: '任务状态',
      dataIndex: 'otaState',
      key: 'otaState',
      render: (text: string, record: JobInfo) => {
        return otaStateOption.find((item) => item.key === text)?.name || '--';
      },
    },

    {
      title: '状态详情',
      dataIndex: 'otaProgress',
      key: 'otaProgress',
      render: (text: string, record: JobInfo) => {
        if (record.otaState === '-1') {
          return (
            errorCodeOption.find((item) => item.key === record.errorCode)
              ?.name || '--'
          );
        }
        return <>{record.otaProgress ? record.otaProgress + '%' : '--'} </>;
      },
    },
  ];
  return (
    <div className="job-detail-list">
      <Header title="任务详情" back to="/ota/job/list"></Header>
      <div className="detail-overview">
        <Row gutter={8}>
          <Col span={6}>
            <div className="name">任务名称：</div>
            {jobDetail?.name}
          </Col>

          <Col span={6}>
            <div className="name">固件版本：</div>
            {jobDetail?.versionNo}
          </Col>
          <Col span={6}>
            <div className="name">所属物类型：</div>
            {jobDetail?.thingTypeCode}
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={6}>
            <div className="name">任务状态:</div>
            {jobStatusOption.find((item) => item.key === jobDetail?.status)
              ?.name || ''}
          </Col>
          {jobDetail?.startTime && (
            <Col span={6}>
              <div className="name">开始时间：</div>
              {jobDetail.startTime}
            </Col>
          )}

          {jobDetail?.stopTime && (
            <Col span={6}>
              <div className="name">结束时间：</div>
              {jobDetail.stopTime}
            </Col>
          )}
        </Row>
        <Row gutter={8}>
          <Col span={6}>
            <div className="name">成功设备数：</div>
            {jobDetail?.upgradeSuccessCount}
          </Col>
          <Col span={6}>
            <div className="name">失败设备数：</div>
            {jobDetail?.upgradeFailCount}
          </Col>
          <Col span={6}>
            <div className="name">进行中设备数：</div>
            {jobDetail?.upgradingCount}
          </Col>
        </Row>
      </div>
      <ObtainHeight bgColor="#fff">
        <Table
          columns={columns}
          dataSource={list}
          pagination={pagination}
          pageChange={pageChange}
          loading={loading}
          rowKey={(record) => record.deviceId}
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
    </div>
  );
}

export default JobDetailList;
