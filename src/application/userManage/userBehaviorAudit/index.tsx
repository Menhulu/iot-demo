import React, { useEffect, useState } from 'react';
import Header from 'components/Header/index';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import PaginationOwn from 'components/Pagination/index';
import { FormComponentProps } from 'antd/lib/form';
import { TreeNode } from 'antd/lib/tree-select';
import {
  Form,
  Input,
  TreeSelect,
  DatePicker,
  Button,
  Row,
  Col,
  List,
  Empty,
} from 'antd';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { RouteConfigComponentProps } from '../../../router/react-router-config';
import {
  UBAuditList,
  QueryUBAuditListParams,
  PageVo,
  Model,
} from '../types/index';
import { getUserModuleList, getUserBehaviorAuditList } from '../service/api';

import iconNull from '../../../static/pic/icon-null.png';
import './style.less';

dayjs.locale('zh-cn');
const { RangePicker } = DatePicker;

interface UserBehaviorAuditProps
  extends FormComponentProps,
    RouteConfigComponentProps {}

function UserBehaviorAudit(props: UserBehaviorAuditProps) {
  // TODO: useFetch 的用法
  function useFetch(initQueryParams: QueryUBAuditListParams) {
    const [auditList, setAuditList] = useState<UBAuditList[]>([]);
    const [modelList, setModelList] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<PageVo>({
      pageNo: 1,
      pageSize: 20,
      total: 0,
      lastPage: 1,
    });
    const [queryParam, setQueryParam] = useState<QueryUBAuditListParams>(
      initQueryParams
    );

    useEffect(() => {
      // 获取操作模块的数据
      const fetchModelList = async () => {
        try {
          const res = getUserModuleList();
          if (res) {
            res.then(result => {
              // 将数据转换为TreeNode 的格式
              if (Array.isArray(result)) {
                const transData = (oldData: Model[]): TreeNode[] => {
                  const treeNode = oldData.map((item: Model, index: number) => {
                    let children: TreeNode[] = [];
                    if (item.children) {
                      children = transData(item.children);
                    }
                    return {
                      title: item.name,
                      value: item.value,
                      key: Number(
                        Math.random()
                          .toString()
                          .substr(3, 36) + Date.now()
                      ).toString(36),
                      children,
                    };
                  });
                  return treeNode;
                };
                setModelList(transData(result));
              }
            });
            // console.log(res, '啦啦啦的');
          }
        } catch (error) {
          setModelList([]);
        }
      };
      // 获取用户行为审计列表
      const fetchAuditList = async (param?: QueryUBAuditListParams) => {
        try {
          const queryListParam = param || queryParam;
          const res = await getUserBehaviorAuditList(queryListParam);
          if (res) {
            setAuditList(res.list);
            const paginationInfo = {
              pageNo: res.pageVO.pageNo,
              pageSize: res.pageVO.pageSize,
              total: res.pageVO.total,
              lastPage: Math.ceil(res.pageVO.total / res.pageVO.pageSize),
            };
            setPagination(paginationInfo);
            setLoading(false);
          } else {
            setAuditList([]);
            const paginationInfo = {
              pageNo: 1,
              pageSize: 20,
              total: 0,
              lastPage: 1,
            };
            setPagination(paginationInfo);
            setLoading(false);
          }
        } catch (error) {
          setAuditList([]);
          const paginationInfo = {
            pageNo: 1,
            pageSize: 20,
            total: 0,
            lastPage: 1,
          };
          setPagination(paginationInfo);
          setLoading(false);
        }
      };

      fetchModelList();
      if (queryParam) {
        fetchAuditList(queryParam);
      } else {
        fetchAuditList();
      }
    }, [queryParam]);

    return [
      { queryParam, auditList, modelList, pagination, loading },
      setQueryParam,
      setAuditList,
    ] as const;
  }

  const initQueryParam: QueryUBAuditListParams = {
    pageNo: 1,
    pageSize: 20,
    account: null,
    module: null,
    startTime: null,
    endTime: null,
    order: 'desc',
  };

  const [
    { queryParam, modelList, auditList, pagination, loading },
    setQueryParam,
    setAuditList,
  ] = useFetch(initQueryParam);

  // 提交查询
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const rangeTimeValue = values['range-time-picker'];
        const param = {
          startTime:
            (rangeTimeValue.length > 0 &&
              rangeTimeValue[0].format('YYYY-MM-DD HH:mm:ss').valueOf()) ||
            null,
          endTime:
            (rangeTimeValue.length > 0 &&
              rangeTimeValue[1].format('YYYY-MM-DD HH:mm:ss').valueOf()) ||
            null,
          account: values.account || null,
          module: values.module || null,
        };
        setQueryParam({
          ...queryParam,
          ...param,
          pageNo: 1,
        });
      }
    });
  };

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };

  // 展开-收起更多的操作行为
  const toggleMoreOperation = (id: number) => {
    const transAuditList = auditList.map((item: UBAuditList) => {
      if (item.id === id) {
        console.log(item.isExtraShow, '0000');
        return { ...item, isExtraShow: !item.isExtraShow };
      }
      return item;
    });

    console.log(transAuditList, 'trans----');
    setAuditList(transAuditList);
  };

  const { getFieldDecorator } = props.form;
  return (
    <div className="user-behavior-audit-wrap">
      {/* 头部start */}
      <Header title="用户行为审计" />
      {/* 头部end */}
      {/* 查询条件start */}
      <div className="audit-header-content">
        <Form layout="inline" onSubmit={handleSubmit}>
          <Form.Item>
            {getFieldDecorator('account')(
              <Input className="basic-inp-s" placeholder="请输入账号" />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('module')(
              <TreeSelect
                className="basic-inp-s"
                treeData={modelList}
                placeholder="请选择操作模块"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                allowClear
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('range-time-picker', {
              rules: [
                {
                  type: 'array',
                },
              ],
              initialValue: [dayjs().startOf('day'), dayjs()],
            })(
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                suffixIcon={<span className="icon-calendar" />}
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button className="search-btn" type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
        </Form>
      </div>
      {/* 查询条件end */}
      {/* 查询结果start */}
      <div className="audit-list">
        <Row type="flex" justify="space-between" className="list-title">
          <Col sm={2}>序号</Col>
          <Col sm={3}>登录账号</Col>
          <Col sm={3}>组织机构</Col>
          <Col sm={3}>登录时间</Col>
          <Col sm={3}>操作模块</Col>
          <Col sm={5}>操作行为</Col>
          <Col sm={3}>操作时间</Col>
          <Col sm={2}>退出时间</Col>
        </Row>
        {!loading &&
          (Array.isArray(auditList) && auditList.length > 0 ? (
            <ObtainHeight className="list-obtain">
              <List className="list">
                {auditList.map((item: UBAuditList, index: number) => (
                  <React.Fragment key={item.id}>
                    <List.Item className="list-item" key={item.id}>
                      <Col sm={2}>{index + 1}</Col>
                      <Col sm={3}>{item.accountName || '--'}</Col>
                      <Col sm={3}>{item.organization || '--'}</Col>
                      <Col sm={3}>
                        {(item.logOnTime && (
                          <>
                            <p>
                              {dayjs(item.logOnTime)
                                .format('YYYY-MM-DD')
                                .valueOf()}
                            </p>
                            <p>
                              {dayjs(item.logOnTime)
                                .format('HH:mm:ss')
                                .valueOf()}
                            </p>
                          </>
                        )) ||
                          '--'}
                      </Col>
                      <Col sm={3}>{item.operationModule || '--'}</Col>
                      <Col sm={5}>
                        {item.extra && item.extra.length > 0 ? (
                          <>
                            <p className={item.isExtraShow ? 'pb8' : ''}>
                              {item.operationRecord || '--'}
                            </p>
                            {item.isExtraShow ? (
                              <div className="border-up-empty">
                                <span />
                              </div>
                            ) : (
                              <p className="operation-more">
                                <span className="text" title={item.extra[0]}>
                                  {item.extra[0]}
                                </span>
                                <span
                                  className="show-btn"
                                  onClick={() => toggleMoreOperation(item.id)}
                                >
                                  展开
                                </span>
                              </p>
                            )}
                          </>
                        ) : (
                          item.operationRecord
                        )}
                      </Col>
                      <Col sm={3}>
                        {(item.operationTime && (
                          <>
                            <p>
                              {dayjs(item.operationTime)
                                .format('YYYY-MM-DD')
                                .valueOf()}
                            </p>
                            <p>
                              {dayjs(item.operationTime)
                                .format('HH:mm:ss')
                                .valueOf()}
                            </p>
                          </>
                        )) ||
                          '--'}
                      </Col>
                      <Col sm={2}>
                        {(item.logOutTime && (
                          <>
                            <p>
                              {dayjs(item.logOutTime)
                                .format('YYYY-MM-DD')
                                .valueOf()}
                            </p>
                            <p>
                              {dayjs(item.logOutTime)
                                .format('HH:mm:ss')
                                .valueOf()}
                            </p>
                          </>
                        )) ||
                          '--'}
                      </Col>
                    </List.Item>
                    {/* 如果这条数据有extra 的话，就多加一条 */}
                    {item.isExtraShow && (
                      <List.Item className="list-item-more" key={item.id + 1}>
                        <>
                          <div className="operation-more-show">
                            <ul>
                              {item.extra &&
                                item.extra.map((ele: string, i: number) => (
                                  <li key={`${i.toString()}-${ele}`}>{ele}</li>
                                ))}
                              <span
                                className="up-btn"
                                onClick={() => toggleMoreOperation(item.id)}
                              >
                                收起
                              </span>
                            </ul>
                          </div>
                        </>
                      </List.Item>
                    )}
                  </React.Fragment>
                ))}
              </List>
              <div className="footer">
                <PaginationOwn
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  current={pagination.pageNo}
                  lastPage={pagination.lastPage || 1}
                  onChange={pageChange}
                />
              </div>
            </ObtainHeight>
          ) : (
            <ObtainHeight>
              <Empty
                image={iconNull}
                imageStyle={{
                  height: 120,
                }}
                description={<span>未搜索到相关内容</span>}
              />
            </ObtainHeight>
          ))}
      </div>
      {/* 查询结果end */}
    </div>
  );
}

export default Form.create<UserBehaviorAuditProps>()(UserBehaviorAudit);
