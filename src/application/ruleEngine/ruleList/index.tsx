import React, { useState } from 'react';
import { Form } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormComponentProps } from 'antd/lib/form';
import { ColumnProps } from 'antd/lib/table';

import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Header from 'components/Header/index';
import Table from 'components/Table';
import Toast from 'components/SimpleToast/index';
import Modal from 'components/Modal/index';
import AuthButton from 'components/AuthButton';
import dayjs from 'dayjs';
import useInitial from 'common/customHooks/useInitialList';

import SearchForm from './components/SearchForm';

import { RouteConfigComponentProps } from '../../../router/react-router-config';
import { QueryRuleListParams, RuleInfo } from '../types';
import {
  getRuleEngineList,
  startRule,
  cancelRule,
  deleteRule,
  resume,
} from '../service/api';

import './style.less';

interface RuleListProps extends FormComponentProps, RouteConfigComponentProps {}

function RuleList(props: RuleListProps) {
  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];

  const handleRunStateMap = {
    stopped: 'start',
    running: 'stop',
  };

  const initQueryParam: QueryRuleListParams = {
    pageIndex: 1,
    pageSize: 20,
    name: '',
    targetType: '',
  };

  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    RuleInfo,
    QueryRuleListParams
  >(getRuleEngineList, initQueryParam, [], 'ruleQueryParams');
  const [visible, setVisible] = useState<boolean>(false);
  const [flag, setFlag] = useState<boolean>(false);
  const [ruleToHandle, setHandledRule] = useState<RuleInfo>({
    id: '',
    name: '',
    srcTopic: '',
    dataSample: '',

    sqlStr: '',
    targetInfoTO: {},
    targetInfoVO: {},
    targetInfoTOStr: '',
    targetType: 'kafka',
    createdTime: '',
    status: 'running',
  });
  const [handleVisible, setHandleVisible] = useState<boolean>(false);

  // 提交查询
  const handleSubmit = (val: QueryRuleListParams) => {
    console.log(val);
    setQueryParam({ ...queryParam, ...val, pageIndex: 1 });
  };

  // 切换页码
  const pageChange = (page: number) => {
    console.log(page);
    setQueryParam({ ...queryParam, pageIndex: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    console.log(pageSize);
    setQueryParam({ ...queryParam, pageIndex: current, pageSize });
  };
  // 取到待操作的规则并打开弹出框
  const setRuleToHandle = (item: RuleInfo, index: number) => {
    setHandledRule(item);
    setHandleVisible(true);
  };
  // 关闭确认弹窗
  const closeHandleModal = () => {
    setHandleVisible(false);
  };
  // 设置启用或停用
  const setRuleStatus = async () => {
    const { id, status, name } = ruleToHandle;
    setFlag(true);
    if (flag) return;
    try {
      let data;
      if (id) {
        if (status === 'running') {
          data = await cancelRule({ ruleId: id, name });
        } else {
          data = await startRule({ ruleId: id, name });
        }
        if (data && data.code === '200') {
          Toast(data.msg);
          setFlag(false);
          closeHandleModal();
          setQueryParam({ ...queryParam });
        } else {
          setFlag(false);
        }
      }
    } catch (error) {
      Toast(error.msg);
      setFlag(false);
    }
  };
  // 删除规则
  const delRule = (item: RuleInfo) => {
    setVisible(true);
    setHandledRule(item);
  };
  // 关闭弹出层
  const closeModal = () => {
    setVisible(false);
  };
  // 确认删除
  const doDelRule = async () => {
    try {
      const data = await deleteRule({
        ruleId: ruleToHandle.id as string,
        name: ruleToHandle.name,
      });
      if (data && data.code === '200') {
        Toast('删除成功');
        let queryPageNO = 1;
        if (pagination.lastPage === 1) {
          queryPageNO = 1;
        } else {
          queryPageNO =
            list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
        }
        setQueryParam({ ...queryParam, pageIndex: queryPageNO });
        closeModal();
      }
    } catch (error) {
      // Toast(error.msg);
    }
  };
  // 恢复
  const resumeRule = async (item: RuleInfo) => {
    try {
      const data = await resume({
        ruleId: item.id as string,
        name: item.name,
      });
      if (data && data.code === '200') {
        Toast('恢复成功');
        setQueryParam({ ...queryParam });
        closeModal();
      }
    } catch (error) {
      Toast(error.msg);
    }
  };
  // 跳转二级页面
  const goSubPage = (destination: string) => {
    sessionStorage.setItem('ruleQueryParams', JSON.stringify(queryParam));
    props.history.push(destination);
  };
  const getKey = (rule: RuleInfo) =>
    `${handleRunStateMap[
      rule.status as keyof typeof handleRunStateMap
    ].toUpperCase()}_PERMISSION`;
  // 列表
  const columns: ColumnProps<RuleInfo>[] = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'targetType',
      key: 'targetType',
    },
    {
      title: '状态',
      dataIndex: 'srcTopic',
      key: 'srcTopic',
      render: (text: string, record: RuleInfo) => (
        <span className={record.status === 'running' ? 'active' : 'error'}>
          {record.status === 'running' ? '运行' : '停止'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: number) =>
        text ? dayjs(text * 1000).format('YYYY-MM-DD HH:mm:ss') : '--',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string, record: RuleInfo, index: number) => (
        <>
          {record.status ? (
            <>
              {record.runState === 1 ? (
                <AuthButton
                  type="primary"
                  shape="circle"
                  className="handle-btn"
                  buttonKey="UPDATE_PERMISSION"
                  routeAuthVOList={authVOList}
                  title="查看"
                  onClick={() => {
                    goSubPage(`/rule/view/${record.id}`);
                  }}
                >
                  <span className="icon-see" />
                </AuthButton>
              ) : (
                <AuthButton
                  type="primary"
                  shape="circle"
                  className="handle-btn"
                  buttonKey="UPDATE_PERMISSION"
                  routeAuthVOList={authVOList}
                  title="编辑"
                  onClick={() => {
                    goSubPage(`/rule/edit/${record.id}`);
                  }}
                >
                  <span className="icon-edit" />
                </AuthButton>
              )}
              <AuthButton
                title="删除"
                type="primary"
                shape="circle"
                className="handle-btn"
                buttonKey="DELETE_PERMISSION"
                routeAuthVOList={authVOList}
                disabled={record.runState === 1}
                onClick={() => delRule(record)}
              >
                <span className="icon-delete" />
              </AuthButton>
              {record.runState !== 3 && (
                <AuthButton
                  title={
                    handleRunStateMap[
                      record.status as keyof typeof handleRunStateMap
                    ] === 'start'
                      ? '启动'
                      : '停止'
                  }
                  type="primary"
                  shape="circle"
                  className="handle-btn"
                  buttonKey={getKey(record)}
                  routeAuthVOList={authVOList}
                  onClick={() => setRuleToHandle(record, index)}
                >
                  <span
                    className={`icon-${
                      handleRunStateMap[
                        record.status as keyof typeof handleRunStateMap
                      ]
                    }`}
                  />
                </AuthButton>
              )}
            </>
          ) : (
            <AuthButton
              shape="round"
              type="primary"
              className="handle-btn"
              buttonKey="RESUME"
              routeAuthVOList={authVOList}
              onClick={() => resumeRule(record)}
            >
              恢复
            </AuthButton>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="rule-list-wrap">
      <Header title="规则列表">
        <Link to="/rule/edit/null" className="add-link">
          <AuthButton
            type="primary"
            buttonKey="CREATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              goSubPage('/rule/edit/null');
            }}
          >
            新增规则
          </AuthButton>
        </Link>
      </Header>
      <div className="rule-header-content">
        {/* 查询 start */}
        <SearchForm onSubmit={handleSubmit} queryParam={queryParam} />
        {/* 查询 end */}
      </div>

      {/* 列表start */}
      <div className="rule-list">
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
      </div>
      {/* 列表end */}

      {/* <Empty
        image={iconNull}
        imageStyle={{
          height: 120,
        }}
        description={<span>暂无任何规则</span>}
      /> */}
      {/* 删除规则确认--start */}
      <Modal
        title="删除规则"
        visible={visible}
        onCancel={closeModal}
        onOk={doDelRule}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>
          规则删除后不可恢复，您确定要删除
          <br />
          规则“{(ruleToHandle as RuleInfo).name}”吗?
        </p>
      </Modal>
      {/* 删除规则确认--end */}
      {/* 开启/停用规则确认--start */}
      <Modal
        title={
          (ruleToHandle as RuleInfo).status === 'running'
            ? '停用规则'
            : '启用规则'
        }
        visible={handleVisible}
        onCancel={closeHandleModal}
        onOk={setRuleStatus}
        width="400px"
        cancelText="取消"
        okButtonProps={{ disabled: flag }}
        okText={
          (ruleToHandle as RuleInfo).status === 'running' ? '停用' : '启用'
        }
      >
        <p>
          您确定要
          {(ruleToHandle as RuleInfo).status === 'running' ? '停用' : '启用'}
          规则“{(ruleToHandle as RuleInfo).name}”吗?
        </p>
      </Modal>
      {/* 开启/停用规则确认--end */}
    </div>
  );
}
export default withRouter(Form.create<RuleListProps>()(RuleList));
