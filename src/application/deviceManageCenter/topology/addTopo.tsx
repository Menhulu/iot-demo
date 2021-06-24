import React, { useState, useEffect, useContext } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Spin,
  Divider,
  Table,
  Row,
  Col,
} from 'antd';

import { useParams, Link } from 'react-router-dom';
import { FormComponentProps } from 'antd/lib/form';
import debounce from 'lodash/debounce';
import Toast from 'components/SimpleToast';
import { addDeviceTopo, updateDeviceTopo } from '../services/topo';
import {
  getDeviceListSimples,
  queryDeviceInfo,
  deviceEditRequest,
} from '../services';
import {
  SimpleDeviceItem,
  QuerySimpleDeviceListParams,
  DeviceInfo,
  ProfileConfig,
  SubDeviceIdsParams,
  DeviceTopoParams,
} from '../types';
import { EditContext, SET_WHEN } from '../editDevice/context';
import { ColumnProps } from 'antd/lib/table';

const { Option } = Select;

/**
 * @description: 组定义hook, 当参数变化时重新拉去数据，并更新数据
 * @param {type}
 * @return: querParams 查询参数，页面查询条件显示的值
 * pagination 分页相关参数
 * deviceList 表示个数据
 * setQueryParams 更新查询参数的方法，请求列表数据的方法依赖querParams， 通过setQueryParams更新querParams时会自动调用拉取列表数据的方法
 */
function useFetch(initialParams: QuerySimpleDeviceListParams) {
  const [queryParams, setQueryParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    lastPage: 1,
  });
  const [deviceList, setDeviceList] = useState<SimpleDeviceItem[]>([]);
  const [fetching, setFetching] = useState<boolean>(false); // 下拉框是否在加载中

  useEffect(() => {
    setFetching(true);
    const fetchDeviceList = async () => {
      try {
        const res = await getDeviceListSimples(queryParams);
        setFetching(false);
        if (res && res.data) {
          const paginationInfo = {
            current: res.data.pageVO.pageNo,
            pageSize: res.data.pageVO.pageSize,
            total: res.data.pageVO.total,
            lastPage: Math.ceil(
              res.data.pageVO.total / res.data.pageVO.pageSize
            ),
          };
          const list = res.data.list || [];
          setPagination(paginationInfo);
          setDeviceList(list);
        } else {
          setDeviceList([]);
        }
      } catch (error) {
        console.log(error);
        setFetching(false);
        setDeviceList([]);
      }
    };
    fetchDeviceList();
  }, [queryParams]);
  return [
    {
      queryParams,
      deviceList,
      fetching,
      pagination,
    },
    setQueryParams,
  ] as const;
}

interface EditColumnProps<T> extends ColumnProps<ProfileConfig> {
  editable?: boolean; // 是否可以编辑
}
const EditableContext = React.createContext<any>({});

interface AddTopoFormProps extends FormComponentProps {
  subDeviceId?: string;
  closeSlideBox: () => void;
  visible: boolean;
}

function AddTopoForm(props: AddTopoFormProps) {
  const [thingTypeProfileData, setThingTypeProfileData] = useState<
    ProfileConfig[]
  >([]);
  const [subDeviceInfo, setSubDeviceInfo] = useState<DeviceInfo>();
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo } = state;
  const { getFieldDecorator, setFieldsValue } = props.form;
  const { id } = useParams<{ id: string }>();
  const initQueryParams: QuerySimpleDeviceListParams = {
    deviceInfo: { deviceId: '', deviceName: '', nodeType: 3 },
    pageNo: 1,
    pageSize: 40,
  };
  const [
    { queryParams, deviceList, fetching, pagination },
    setQueryParams,
  ] = useFetch(initQueryParams);
  // 请求子设备信息
  const fetchProtocolData = (editSubDeviceId: string) => {
    queryDeviceInfo({
      deviceId: editSubDeviceId,
    }).then((data) => {
      setSubDeviceInfo(data);
    });
  };
  useEffect(() => {
    if (props.subDeviceId) {
      fetchProtocolData(props.subDeviceId);
      setFieldsValue({ deviceId: props.subDeviceId });
    } else {
      setFieldsValue({ deviceId: '' });
      setSubDeviceInfo(undefined);
    }
  }, [props.subDeviceId, setFieldsValue]);

  useEffect(() => {
    if (subDeviceInfo) {
      let { globalProfiles } = subDeviceInfo;
      // 只需要物类型档案
      const profiles = globalProfiles.filter((item) => item.scope === 3);
      console.log('profiles', profiles);
      setThingTypeProfileData(profiles);
    } else {
      setThingTypeProfileData([]);
    }
  }, [subDeviceInfo]);

  // 下拉框加载更多
  const pageChange = () => {
    if (pagination.current === pagination.lastPage) {
      setQueryParams({
        ...queryParams,
        pageNo: 1,
      });
    } else {
      setQueryParams({
        ...queryParams,
        pageNo: pagination.current + 1,
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
      setQueryParams({
        ...queryParams,
        pageNo: 1,
        deviceInfo: { ...queryParams.deviceInfo, deviceId: value },
      });
    } else {
      setQueryParams({
        ...queryParams,
        pageNo: 1,
        deviceInfo: { ...queryParams.deviceInfo, deviceName: value },
      });
    }
  }, 1000);
  /**
   * @description: 从下拉选择设备
   */
  const onDeviceSelected = (value: string) => {
    fetchProtocolData(value);
  };
  const addOrUpdateTopo = async (params: DeviceTopoParams) => {
    try {
      let result;
      if (!props.subDeviceId) {
        result = await addDeviceTopo(params);
      } else {
        result = await updateDeviceTopo(params);
      }
      if (result.code === 200) {
        const { data } = result;
        let errMsg = '';
        Object.keys(data.errorTerminalDevice).forEach((key) => {
          errMsg += `${key}${data.errorTerminalDevice[key]}`;
        });

        if (!errMsg) {
          dispatch({
            type: SET_WHEN,
            when: false,
          });
          Toast('关联成功');
          props.form.resetFields();
          props.closeSlideBox();
        } else {
          Toast(errMsg);
        }
      }
    } catch (error) {
      console.log(error);
      Toast(error.message);
    }
  };

  /** 单个关联代理关系 */
  const associateOrUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { deviceId, deviceName, ...rest } = props.form.getFieldsValue();
    console.log('协议档案值', rest);
    thingTypeProfileData.forEach((profile) => {
      profile.profileValue = rest[profile.profileCode];
    });
    console.log('更新协议档案值', thingTypeProfileData);
    if (subDeviceInfo) {
      const updateSubDeviceParam: DeviceInfo = {
        ...subDeviceInfo,
        globalProfiles: [
          ...subDeviceInfo.globalProfiles,
          ...thingTypeProfileData,
        ],
      };
      deviceEditRequest(updateSubDeviceParam).then((res) => {
        if (res && res.code == 200) {
          props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
              const protocolSpec: Record<string, string> = {};
              thingTypeProfileData.forEach(
                (item) => (protocolSpec[item.profileCode] = item.profileValue)
              );
              const subDeviceIds: SubDeviceIdsParams[] = [];
              subDeviceIds.push({
                subDeviceId: subDeviceInfo.deviceId,
                subDeviceName: subDeviceInfo.deviceName,
                protocolSpec: JSON.stringify(protocolSpec),
              });
              const addOrUpdateTopoParam = {
                deviceId: id,
                deviceName: state.deviceInfo.deviceName,
                thingTypeName: state.deviceInfo.thingTypeName,
                subDeviceIds,
              };
              addOrUpdateTopo(addOrUpdateTopoParam);
            }
          });
        }
      });
    }
  };

  const renderCell = (record: ProfileConfig) => {
    return (
      <Form.Item>
        {getFieldDecorator(record.profileCode, {
          initialValue: record.profileValue
            ? record.profileValue.toString()
            : '',
        })(<Input maxLength={64} placeholder="最多64个字符，如灯" />)}
      </Form.Item>
    );
  };
  const columns: EditColumnProps<ProfileConfig>[] = [
    {
      title: '协议属性名称',
      key: 'profileCode',
      dataIndex: 'profileCode',
    },
    {
      title: '协议属性值',
      dataIndex: 'profileValue',
      render: (text: number, record: ProfileConfig) => renderCell(record),
    },
  ];

  return (
    <div className="add-topo">
      <div className="basic-wrap">
        <div className="basic-info-wrap">
          <Form
            layout="inline"
            onSubmit={associateOrUpdate}
            className="basic-info-form"
          >
            <div className="basic-info-main">
              <div className="title-wrap">
                <div className="title1">
                  {!!props.subDeviceId ? '更新协议属性档案：' : '添加代理关系'}
                </div>
              </div>

              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item label="选择设备" className="flex-form-item">
                    {getFieldDecorator('deviceId', {
                      rules: [{ required: true, message: '请选择设备' }],
                      initialValue: props.subDeviceId,
                    })(
                      <Select
                        disabled={!!props.subDeviceId}
                        className="basic-select"
                        showSearch
                        dropdownClassName="select-with-id"
                        placeholder="选择设备，支持按id和名称过滤"
                        notFoundContent={
                          fetching ? <Spin size="small" /> : '暂无数据'
                        }
                        filterOption={false}
                        onSearch={onDeviceSearch}
                        onChange={onDeviceSelected}
                        dropdownRender={(menu) => (
                          <div>
                            {menu}
                            <Divider style={{ margin: '4px 0' }} />
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                color: '#006569',
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={pageChange}
                            >
                              共{pagination.total}条{' '}
                              {`${
                                pagination.lastPage === pagination.current
                                  ? '没有更多了'
                                  : '加载更多'
                              }`}
                            </div>
                          </div>
                        )}
                      >
                        {deviceList.length > 0 &&
                          deviceList.map((item: SimpleDeviceItem) => (
                            <Option value={item.deviceId} key={item.deviceId}>
                              {item.deviceName}
                              <div className="item-id">{item.deviceId}</div>
                            </Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                  {!!subDeviceInfo && (
                    <Link
                      className="rule"
                      to={`/thingtype/edit/${subDeviceInfo.thingTypeCode}/3`}
                    >
                      创建协议档案
                    </Link>
                  )}
                </Col>
              </Row>

              <Form.Item>
                {getFieldDecorator('deviceName', {
                  initialValue: deviceInfo.deviceName,
                })(<Input type="hidden" />)}
              </Form.Item>

              <div className="protocol-profile">
                <div className="title">设备协议档案</div>
                <EditableContext.Provider value={props.form}>
                  <Table
                    bordered
                    className="profiles-table"
                    dataSource={thingTypeProfileData}
                    columns={columns}
                    pagination={false}
                    rowKey={(record: any, index) => index.toString()}
                  ></Table>
                </EditableContext.Provider>
              </div>
              <div className="btn-box">
                <Button type="primary" htmlType="submit">
                  {!!props.subDeviceId ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

const AddTopo = Form.create<AddTopoFormProps>()(AddTopoForm);
export default AddTopo;
