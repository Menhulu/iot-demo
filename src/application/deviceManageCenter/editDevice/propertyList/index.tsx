/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2020-03-23 12:25:12
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-09 17:53:06
 */
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Input, Tooltip, Select } from 'antd';

import { FormComponentProps } from 'antd/es/form';
import { ColumnProps } from 'antd/es/table';

import Toast from 'components/SimpleToast';
import Table from 'components/Table';
import { useParams } from 'react-router-dom';
import {
  PropertyInfo,
  StepInfo,
  EnumInfo,
} from 'application/thingTypeCenter/types/funcDefinition';

import DesiredValueForm from './desiredValueForm';
import {
  getSnapshot,
  updateShadowInfo,
  getProperty,
  clearDesiredProperty,
} from '../../services/property';
import { queryThingModelInfo } from 'application/thingTypeCenter/services/thingModelApi';
import { numberValidator } from './validators';

import { EditContext, SET_WHEN } from '../context';

import './index.less';
import { ThingModelContent } from 'application/thingTypeCenter/types';
import { StringInfo } from '../../../thingTypeCenter/types/funcDefinition';

const { Option } = Select;

interface EditColumnProps<T> extends ColumnProps<PropertyInfo> {
  editable?: boolean; // 是否可以编辑
}

const EditableContext = React.createContext<any>({});
// 可编辑表格
const EditTable = ({ form }: FormComponentProps) => {
  const statusOption = {
    0: '停用',
    1: '未激活',
    2: '离线',
    3: '在线',
    4: '离线',
  };
  const statusClassName = {
    0: 'default',
    1: 'default',
    2: 'offline',
    3: 'online',
    4: 'offline',
  };
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useContext(EditContext);
  const [dataSource, setDataSource] = useState<PropertyInfo[]>([]);

  const [cmd, setCmd] = useState<Record<string, string>>({});
  const [version, setVersion] = useState<number>(0);
  const [savable, setSavable] = useState<boolean>(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [desiredValueModalData, setDesiredValueModalData] = useState<
    PropertyInfo
  >({
    id: '',
    description: '',
    access: 'rw',
    desired: null,
    'display-name': 'wqw',
    type: 'array',
    valuedef: {
      specs: {
        item: {
          specs: {
            unitdesc: '',
            min: '1',
            max: '11111',
            step: '11',
          },
          type: 'int16',
        },
        size: '128',
      },
      type: 'array',
    },
    reported: null,
    key: 'dsd.wqw',
  });
  const [desiredValueModalVisible, setDesiredValueModalVisible] = useState<
    boolean
  >(false);
  const { deviceInfo } = state;

  // const fetchData = useCallback(() => {
  //   getShadowQuery({ deviceId: id }).then((res: any) => {
  //     if (res && res.data) {
  //       setDeviceType(res.data.deviceType);
  //       const thingmodel = JSON.parse(res.data.thingmodel);
  //       const modelList = thingmodel.models || [];

  //       console.log('modelList', modelList);
  //       const propertyData: PropertyListItem[] = [];
  //       modelList.forEach((model: ModelInfo) => {
  //         model.properties.forEach(prop => {
  //           propertyData.push({
  //             modelKey: model.key as string,
  //             key: prop.key as string,
  //             displayName: prop['display-name'],
  //             type: prop.valuedef.type,
  //             access: prop.access,
  //             reported:
  //               prop.reported !== null ? prop.reported.toString() : null,
  //             valuedef: prop.valuedef,
  //             desired: prop.desired || null,
  //           });
  //         });
  //       });
  //       console.log(propertyData);
  //       // 如果有一条数据权限有W的，保存按钮就可点击
  //       const hasWriteable = propertyData.some(item =>
  //         item.access.toLowerCase().includes('w')
  //       );
  //       setVersion(res.data.version);
  //       setDataSource(propertyData);
  //       setSavable(hasWriteable);
  //     }
  //   });
  // }, [id]);
  const fetchData = useCallback(() => {
    Promise.all([
      queryThingModelInfo({
        thingModelId: deviceInfo.thingModelCode,
        modelVersion: deviceInfo.thingModelVersion,
      }),
      getProperty({ deviceId: id }),
    ])
      .then((res) => {
        const thingModelInfo = res[0];
        // 字符串转成json格式
        const thingModelContent: ThingModelContent =
          typeof thingModelInfo.content === 'string'
            ? JSON.parse(thingModelInfo.content)
            : thingModelInfo.content;
        const modelPropertyList: PropertyInfo[] = [];
        thingModelContent.models.forEach((item) => {
          modelPropertyList.push(...item.properties);
        });
        let propertyReportedData: Record<string, any> = {};
        let propertyDesiredData: Record<string, any> = {};
        if (res[1].code === 200) {
          propertyReportedData =
            res[1].data && res[1].data.state ? res[1].data.state.reported : {};
          propertyDesiredData =
            res[1].data && res[1].data.state ? res[1].data.state.desired : {};
          res[1].data && setVersion((res[1].data.version || 0) + 1);
        }
        if (propertyReportedData && Object.keys(propertyReportedData).length) {
          Object.keys(propertyReportedData).forEach((prop) => {
            modelPropertyList.forEach((item) => {
              if (item.key && item.key === prop) {
                item.reported = propertyReportedData[prop];
              }
            });
          });
        }
        if (propertyDesiredData && Object.keys(propertyDesiredData).length) {
          Object.keys(propertyDesiredData).forEach((prop) => {
            modelPropertyList.forEach((item) => {
              if (item.key && item.key === prop) {
                item.desired = propertyDesiredData[prop];
              }
            });
          });
        }
        // 如果有一条数据权限有W的，保存按钮就可点击
        const hasWriteable = modelPropertyList.some((item) =>
          item.access.toLowerCase().includes('w')
        );
        console.log(modelPropertyList);
        setDataSource(modelPropertyList);
        setSavable(hasWriteable);
        console.log(modelPropertyList);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [deviceInfo, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // 清除枚举类型期望值
  const clearDesireValue = (item: PropertyInfo) => {
    const key = item.key;
    form.setFieldsValue({ [`${key}`]: '' });
    clearDesiredProperty({ deviceId: id, keys: [key as string] })
      .then((res) => {
        if (res.success) {
          Toast('清除成功');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 保存期望值
  const saveDesired = () => {
    setSavable(false);
    form.validateFields(
      (errors: any, values: Record<string, Record<string, string>>) => {
        if (errors) {
          console.log(errors);
        } else {
          console.log(values);
          let cmdParam = { ...cmd };
          Object.keys(values).forEach((mKey) => {
            Object.keys(values[mKey]).forEach((pKey) => {
              // if (values[mKey][pKey]) {
              cmdParam = {
                ...cmdParam,
                [`${mKey}.${pKey}`]: values[mKey][pKey] || '',
              };
              // }
            });
          });
          console.log(cmdParam);
          updateShadowInfo({
            deviceId: id,
            deviceName: deviceInfo.deviceName,
            thingTypeName: deviceInfo.thingTypeName,
            version: version,
            cmd: cmdParam,
          })
            .then((res) => {
              if (res && res.code === 200) {
                // // // console.log('--------进入toast');
                dispatch({
                  type: SET_WHEN,
                  when: false,
                });
                Toast('保存成功');
                fetchData();
              } else if (res && (res.code === 8202 || res.code === 8203)) {
                setVersion(version + 1);
              }
            })
            ['catch']((err) => {
              console.log(err);
            })
            .finally(() => {
              setTimeout(() => {
                setSavable(true);
              }, 500);
            });
        }
      }
    );
  };
  // 召测
  const handleCall = () => {
    //
    const callParams = {
      deviceId: id,
      deviceName: deviceInfo.deviceName,
      thingTypeName: deviceInfo.thingTypeName,
      params: selectedRowKeys,
    };
    getSnapshot(callParams)
      .then((data: any) => {
        if (data && data.code == 200) {
          Toast('召测成功');
        }
        fetchData();
      })
      ['catch']((err) => {
        console.log(err);
      });
  };

  const rowSelection = {
    onChange: (selectedKeys: any, selectedRows: any) => {
      console.log(selectedKeys);
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: () => ({
      disabled: deviceInfo.status !== 3,
    }),
  };

  // 打开填写json串的modal
  const openDesiredValueModal = (record: PropertyInfo) => {
    setDesiredValueModalData(record);
    setDesiredValueModalVisible(true);
  };
  // 保存值
  const saveValue = (val: Record<string, string>) => {
    console.log(val);
    const propKey = Object.keys(val)[0];
    const newDataSource = dataSource.map((item) => {
      if (item.key === propKey) {
        item.desired = JSON.parse(val[propKey]);
      }
      return item;
    });
    setDataSource(newDataSource);
    setCmd({ ...cmd, ...val });
    setDesiredValueModalVisible(false);
  };

  const renderCell = (record: PropertyInfo) => {
    const disabled = !record.access.toLowerCase().includes('w');
    let childNode = null;
    if (disabled) {
      childNode = record.desired ? record.desired.toString() : '';
      return childNode;
    }
    // 校验数值类型的输入
    const validateNum = (rule: any, value: any, callback: any) => {
      const { min, max, step } = record.valuedef.specs as StepInfo;
      numberValidator(
        rule,
        value,
        callback,
        record.valuedef.type,
        max,
        min,
        step
      );
    };

    const { type, specs } = record.valuedef;
    switch (type) {
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'float':
      case 'double':
        const { min, max, step } = specs as StepInfo;
        childNode = (
          <Form.Item>
            {form.getFieldDecorator(`${record.key}`, {
              rules: [
                {
                  validator: validateNum,
                },
              ],
              initialValue: record.desired ? record.desired.toString() : '',
            })(<Input disabled={disabled} />)}
            <Tooltip
              autoAdjustOverflow={false}
              title={
                <div className="range-tip">
                  值类型:{type},最大值:{max},最小值{min},步长值{step}
                </div>
              }
            >
              <span className="icon-help" />
            </Tooltip>
          </Form.Item>
        );
        break;
      case 'string':
      case 'binary':
        const { length } = specs as StringInfo;
        childNode = (
          <Form.Item>
            {form.getFieldDecorator(`${record.key}`, {
              initialValue: record.desired ? record.desired.toString() : '',
            })(<Input disabled={disabled} maxLength={Number(length)} />)}
            <Tooltip
              autoAdjustOverflow={false}
              title={
                <div className="range-tip">
                  值类型:{type},最大长度{length}
                </div>
              }
            >
              <span className="icon-help" />
            </Tooltip>
          </Form.Item>
        );
        break;
      case 'date':
        childNode = (
          <Form.Item>
            {form.getFieldDecorator(`${record.key}`, {
              initialValue: record.desired ? record.desired.toString() : '',
            })(<Input />)}
          </Form.Item>
        );
        break;
      case 'bool':
        childNode = (
          <Form.Item>
            {form.getFieldDecorator(`${record.key}`, {
              initialValue:
                !record.desired && record.desired !== false
                  ? ''
                  : record.desired.toString(),
            })(
              <Select>
                <Option value="false">false</Option>
                <Option value="true">true</Option>
              </Select>
            )}
            <Button type="link" onClick={() => clearDesireValue(record)}>
              清除
            </Button>
          </Form.Item>
        );
        break;
      case 'enum':
        const { values } = specs as EnumInfo;
        childNode = (
          <Form.Item>
            {form.getFieldDecorator(`${record.key}`, {
              initialValue: record.desired ? record.desired.toString() : '',
            })(
              <Select allowClear>
                {Object.keys(values).map((k) => (
                  <Option key={k} value={k}>
                    {k}
                  </Option>
                ))}
              </Select>
            )}
            <Button type="link" onClick={() => clearDesireValue(record)}>
              清除
            </Button>
          </Form.Item>
        );
        break;
      case 'struct':
      case 'array':
        childNode = (
          <>
            <Button type="link" onClick={() => openDesiredValueModal(record)}>
              <span className="active icon-edit" />
            </Button>

            <span className="desired-text">
              {record.desired ? JSON.stringify(record.desired) : ''}
            </span>
          </>
        );
        break;

      default:
        childNode = null;
        break;
    }
    return childNode;
  };
  const getText = (text: any) => {
    switch (typeof text) {
      case 'number':
      case 'boolean':
        return `${text}`;
      case 'object':
        return JSON.stringify(text);
      case 'undefined':
        return '';
      default:
        return text;
    }
  };
  const columns: EditColumnProps<PropertyInfo>[] = [
    {
      title: '模型',
      key: 'modelKey',
      dataIndex: 'modelKey',
      align: 'center',
      render: (text: string, record: PropertyInfo) =>
        record.key ? record.key.split('.')[0] : '',
    },
    {
      title: '属性key',
      dataIndex: 'key',
      align: 'center',
    },
    {
      title: '属性名称',
      dataIndex: 'display-name',
      align: 'center',
    },
    {
      title: '数据类型',
      dataIndex: 'valuedef',
      align: 'center',
      render: (text: any) => text.type,
    },
    {
      title: '权限',
      dataIndex: 'access',
      align: 'center',
    },
    {
      title: '当前值',
      dataIndex: 'reported',
      align: 'center',
      render: (text: any) => getText(text),
    },
    {
      title: '期望值',
      dataIndex: 'desired',

      render: (text: number, record: PropertyInfo) => renderCell(record),
    },
  ];

  return (
    <div className="device-property-list">
      <div className="table-action-bar">
        <span className="device-status-wrap f-l">
          设备状态：
          <span
            className={`${
              statusClassName[
                (deviceInfo.status as unknown) as keyof typeof statusClassName
              ]
            } device-status`}
          >
            {
              statusOption[
                (deviceInfo.status as unknown) as keyof typeof statusOption
              ]
            }
          </span>
        </span>

        <Button type="primary" disabled={!savable} onClick={saveDesired}>
          更新期望值
        </Button>
        <Button
          type="primary"
          disabled={!selectedRowKeys.length}
          onClick={handleCall}
        >
          召测
        </Button>
        <Button type="primary" onClick={fetchData}>
          刷新
        </Button>
      </div>
      <EditableContext.Provider value={form}>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowSelection={rowSelection}
          rowKey={(record) => record.key}
        />
      </EditableContext.Provider>
      <DesiredValueForm
        visible={desiredValueModalVisible}
        record={desiredValueModalData}
        onCancel={() => setDesiredValueModalVisible(false)}
        onOk={saveValue}
      />
    </div>
  );
};

export default Form.create<FormComponentProps>()(EditTable);
