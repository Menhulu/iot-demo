import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Tabs,
  DatePicker,
  Button,
  Form,
  Select,
  Spin,
  Collapse,
  Divider,
} from 'antd';
import Table from 'components/Table';
import { useLocation } from 'react-router-dom';
import { formatJson } from 'utils/format-json';

import Header from 'components/Header/index';
import { FormComponentProps } from 'antd/lib/form';
import { SelectValue } from 'antd/lib/select';
import { RangePickerValue } from 'antd/lib/date-picker/interface';

import { getDeviceListSimples } from 'application/deviceManageCenter/services';
import {
  SimpleDeviceItem,
  QuerySimpleDeviceListParams,
} from 'application/deviceManageCenter/types';

import { debounce } from 'lodash';

import Toast from 'components/SimpleToast/index';
import useInitialList from 'common/customHooks/useInitialList';
import { MessageLog, MessageQueryParam } from '../types/index';

import { getDeviceMessageList } from '../services/index';
import { RouteConfigComponentProps } from '../../../router/react-router-config';
import './index.less';
import 'dayjs/locale/zh-cn';

import { ColumnProps } from 'antd/lib/table';

dayjs.locale('zh-cn');

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

export const customPanelStyle = {
  width: '100%',
  background: '#f7f7f7',
  border: 0,
  overflow: 'hidden',
};
interface Props extends FormComponentProps, RouteConfigComponentProps { }

function LogService(props: Props) {
  const location = useLocation();
  const { search } = location;
  console.log(search, 'search---');
  const deviceId = search.split('=')[1];
  const initMsgLogList: MessageLog[] = [];

  const msgType = [
    '未分类消息',
    '属性消息',
    '事件消息',
    '方法消息',
    '设备上下线消息',
    'NTP授时消息',
    '物模型消息',
    // '告警消息',
  ];

  const flowType = [
    { label: '下行', value: 'DOWN' },
    { label: '上行', value: 'UP' },
  ];

  const PAGE_SIZE = 20;

  const [msgLogList, setMsgLogList] = useState(initMsgLogList);
  const [queryLogParam, setQueryLogParam] = useState<MessageQueryParam>({
    deviceId,
    deviceName: '',
    startTime: 0,
    endTime: 0,
    pageSize: PAGE_SIZE,
    pageNo: 1,
    messageLoggingVO: {},
  });
  const [logPagination, setLogPagination] = useState({
    pageNo: 1,
    pageSize: 20,
    total: 0,
    lastPage: 1,
  });

  const initQueryParam: QuerySimpleDeviceListParams = {
    deviceInfo: { deviceId: '', deviceName: '', nodeType: '' },
    pageNo: 1,
    pageSize: 40,
  };

  const [
    { queryParam, list, pagination, loading },
    setQueryParam,
  ] = useInitialList<any, QuerySimpleDeviceListParams>(
    getDeviceListSimples,
    initQueryParam,
    []
  );
  const fetchDeviceMessageList = useCallback(async () => {
    if (!queryLogParam.deviceId) return;
    try {
      const res = await getDeviceMessageList(queryLogParam);
      if (res) {
        if (!res.list || res.list.length === 0) {
          Toast('暂无数据');
        }
        setMsgLogList(res.list || []);
        const page = res.pageVO;
        const paginationInfo = {
          pageNo: page.pageNo,
          pageSize: page.pageSize,
          total: page.totalCount || page.total,
          lastPage: 1,
        };
        paginationInfo.lastPage = Math.ceil(
          paginationInfo.total / page.pageSize
        );
        setLogPagination(paginationInfo);
      }
    } catch (error) {
      console.log(error);
      setMsgLogList([]);
    }
  }, [queryLogParam]);
  useEffect(() => {
    fetchDeviceMessageList();
  }, [fetchDeviceMessageList]);

  // 设备列表页跳转过来有设备id则直接查询日志信息，否则不查
  useEffect(() => {
    const fieldsValue = props.form.getFieldsValue();
    const rangeTimeValue = fieldsValue['range-time-picker'];
    if (deviceId) {
      const param = {
        deviceId,
        deviceName: '',
        startTime: rangeTimeValue[0].valueOf(),
        endTime: rangeTimeValue[1].valueOf(),
        pageSize: PAGE_SIZE,
        pageNo: 1,
        messageLoggingVO: {
          deviceId,
          flow: fieldsValue.flow,
          type: fieldsValue.type,
        },
      };
      setQueryLogParam({ ...param });
    }
  }, [deviceId, fetchDeviceMessageList, props.form]);

  // 下拉框加载更多
  const pageChange = () => {
    if (pagination.pageNo === pagination.lastPage) {
      setQueryParam({
        ...queryParam,
        pageNo: 1,
      });
    } else {
      setQueryParam({
        ...queryParam,
        pageNo: pagination.pageNo + 1,
      });
    }
  };
  /**
   * @description: 搜索的时候，查询新的数据
   * @param {type}
   * @return:
   */
  const onDeviceSearch = debounce((value: string) => {
    const deviceIdReg = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/;
    if (deviceIdReg.test(value)) {
      setQueryParam({
        ...queryParam,
        pageNo: 1,
        deviceInfo: { ...queryParam.deviceInfo, deviceId: value },
      });
    } else {
      setQueryParam({
        ...queryParam,
        pageNo: 1,
        deviceInfo: { ...queryParam.deviceInfo, deviceName: value },
      });
    }
  }, 1000);

  const validateFormAndSubmit = () => {
    props.form.validateFields(async (err: any, fieldsValue: any) => {
      if (!err) {
        const rangeTimeValue = fieldsValue['range-time-picker'];
        const curDeviceId = fieldsValue.deviceId.split('@@')[0];
        const curDeviceName = fieldsValue.deviceId.split('@@')[1];
        console.log(curDeviceId);
        if (curDeviceId) {
          const param = {
            ...queryLogParam,
            deviceName: curDeviceName,
            deviceId: curDeviceId,
            startTime: rangeTimeValue[0].valueOf(),
            endTime: rangeTimeValue[1].valueOf(),
            pageNo: 1,
            messageLoggingVO: {
              deviceId: curDeviceId,
              flow: fieldsValue.flow,
              type: fieldsValue.type,
            },
          };
          console.log(param);
          setQueryLogParam({ ...param });
        }
      }
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    if (e) e.preventDefault();
    validateFormAndSubmit();
  };

  // 设备id变化
  const onDeviceChange = (value: SelectValue) => {
    console.log(value);
    props.form.setFieldsValue({ deviceId: value as string });
    validateFormAndSubmit();
  };
  // 下拉选择查询
  const handleSelectChange = () => {
    setTimeout(() => validateFormAndSubmit(), 0);
  };
  // 时间范围变化
  const handleRangeChange = (
    dates: RangePickerValue,
    dateStrings: [string, string]
  ) => {
    setTimeout(() => validateFormAndSubmit(), 0);
  };

  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryLogParam({ ...queryLogParam, pageNo: current, pageSize });
  };
  // 切换页码
  const logServicePageChange = (page: number) => {
    setQueryLogParam({
      ...queryLogParam,
      pageNo: page,
    });
  };

  const { getFieldDecorator } = props.form;

  const formItemLayout = {
    wrapperCol: { span: 24 },
  };

  const columns: ColumnProps<MessageLog>[] = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      ellipsis: true,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },

    {
      title: '上下行',
      dataIndex: 'flow',
      key: 'flow',
      align: 'center',
      ellipsis: true,
      width: '15%',
      render: (text: any) =>
        flowType.find((flow) => flow.value === text)?.label || '--',
    },
    // {
    //   title: '消息类型',
    //   dataIndex: 'type',
    //   key: 'type',
    //   align: 'center',
    //   ellipsis: true,
    //   render: (text: any) => msgType[parseInt(text, 10)],
    // },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      align: 'center',
      ellipsis: true,
      width: '30%',
    },

    {
      title: '消息内容',
      dataIndex: 'message',
      key: 'message',
      align: 'center',
      width: '35%',
      render: (text: string, record: MessageLog) => (
        <div className="message-box">
          <Collapse bordered={false} style={{ width: '100%' }}>
            <Panel header={text} key={record.rowKey} style={customPanelStyle}>
              <pre>{formatJson(text)}</pre>
            </Panel>
          </Collapse>
        </div>
      ),
    },
  ];

  return (
    <div className="device-log">
      <Header mClassName="device-log-header" title="日志服务" />
      <Tabs defaultActiveKey="1">
        <TabPane tab="消息查看" key="1">
          <div className="device-log-search">
            <Form onSubmit={handleSubmit} layout="inline">
              <Form.Item {...formItemLayout}>
                {getFieldDecorator('deviceId', {
                  rules: [{ required: true, message: '请选择设备' }],
                  initialValue: deviceId,
                })(
                  <Select
                    className="basic-select"
                    showSearch
                    style={{ width: 240 }}
                    dropdownClassName="select-with-id"
                    placeholder="选择设备,支持按名称过滤"
                    notFoundContent={
                      loading ? <Spin size="small" /> : '暂无数据'
                    }
                    filterOption={false}
                    onSearch={onDeviceSearch}
                    onChange={onDeviceChange}
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                        <Divider style={{ margin: '4px 0' }} />
                        <div
                          style={{
                            padding: '4px 8px',
                            cursor: 'pointer',
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={pageChange}
                        >
                          共{pagination.total}条{' '}
                          {`${
                            pagination.lastPage === pagination.pageNo
                              ? '没有更多了'
                              : '加载更多'
                            }`}
                        </div>
                      </div>
                    )}
                  >
                    {list.length > 0 &&
                      list.map((item: SimpleDeviceItem, index: number) => (
                        <Option
                          value={`${item.deviceId}@@${item.deviceName}`}
                          key={`${item.deviceId}${item.deviceName}`}
                        >
                          {item.deviceName}
                          <div className="item-id">{item.deviceId}</div>
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                style={{ width: '15%', maxWidth: '182px' }}
              >
                {getFieldDecorator('type', {
                  initialValue: '',
                })(
                  <Select onChange={handleSelectChange}>
                    <Option key="all" value="">
                      全部
                    </Option>
                    {msgType.map((item, idx) => (
                      <Option key={item} value={`${idx}`}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                style={{ width: '9%', maxWidth: '96px' }}
              >
                {getFieldDecorator('flow', {
                  initialValue: '',
                })(
                  <Select onChange={handleSelectChange}>
                    <Option key="all" value="">
                      全部
                    </Option>
                    {flowType.map((item, idx) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                style={{ width: '30%', maxWidth: '350px' }}
              >
                {getFieldDecorator('range-time-picker', {
                  rules: [
                    {
                      type: 'array',
                      required: true,
                      message: '请选择时间范围!',
                    },
                  ],
                  initialValue: [dayjs().subtract(12, 'hour'), dayjs()],
                })(
                  <RangePicker
                    style={{ width: '100%' }}
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    placeholder={['开始时间', '结束时间']}
                    onChange={handleRangeChange}
                    suffixIcon={<span className="icon-calendar" />}
                  />
                )}
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                {/* <Button
                  type="primary"
                  onClick={() => {
                    props.form.resetFields();
                  }}
                >
                  重置
                </Button> */}
              </Form.Item>
            </Form>
          </div>
          <div className="device-log-list clearfix">
            <Table
              columns={columns}
              dataSource={msgLogList}
              pagination={logPagination}
              pageChange={logServicePageChange}
              loading={loading}
              rowKey={(record) => record.timestamp}
              onShowSizeChange={onShowSizeChange}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Form.create<Props>({})(LogService);
