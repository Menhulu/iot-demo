import React, { useEffect, useState, useRef } from 'react';

import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Table,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RadioChangeEvent } from 'antd/lib/radio';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';
import Textarea from 'components/TextArea';

import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  nodeTypeConfig,
  initConnectionTypeOptions,
  connectionAgentTypeOptions,
  objectNameReg,
  objectNameRule,
  displayNameReg64,
  displayNameRule64,
  hardwareOptions,
  osOptions,
} from 'utils/constants';

import { uniqueId } from 'lodash';
import { addThingType, getGlobalProfiles } from '../services';
import { ConfigProfile, CustomProfile, ThingTypeItem } from '../types/index';
import './index.less';

const { Column } = Table;
const { Option } = Select;

interface EditThingTypeInfoProps
  extends FormComponentProps,
    RouteComponentProps {
  setFormDirty: (flag: boolean) => void;
}
const ThingTypeInfoForm = (props: EditThingTypeInfoProps) => {
  const connectTypeInput = useRef<Input>(null);
  const { getFieldDecorator } = props.form;

  const initThingTypeInfo: ThingTypeItem = {
    name: '',
    desc: '',
    nodeType: 1,
    connectTypes: '',
    source: '1',
    authType: 1,
    globalProfiles: [],
    customProfiles: [],
  };

  const [modelInfo, setThingTypeInfo] = useState<ThingTypeItem>(
    initThingTypeInfo
  );

  const [globalConfigProfiles, setGlobalProfiles] = useState<ConfigProfile[]>(
    []
  );

  const [connectTypesLabel, setConnectTypesLabel] = useState<string>(
    '连网方式'
  );
  const [connectTypeOptions, setConnectTypeOptions] = useState<
    typeof initConnectionTypeOptions
  >(initConnectionTypeOptions);

  const [connectTypesInputErr, setConnectTypesInputErr] = useState<string>('');

  useEffect(() => {
    // 全局物类型
    const fetchGlobalProfiles = async () => {
      try {
        const data = await getGlobalProfiles({ scope: 2 });
        if (data) {
          setGlobalProfiles(data);
        } else {
          setGlobalProfiles([]);
        }
      } catch (error) {
        setGlobalProfiles([]);
      }
    };
    fetchGlobalProfiles();
  }, []);
  // 判断是否为边缘设备
  const [edgeEquipment, setEdgeEquipment] = useState<boolean>(false);
  /**
   * @description: 选择节点类型
   */
  const handleRadioChange = (e: RadioChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setThingTypeInfo({ ...modelInfo, [name]: value });
    }
    if (name === 'nodeType') {
      let connectTypeLabel = '连网方式';
      let $connectTypeOptions = initConnectionTypeOptions;
      switch (value) {
        case 1: // 直连设备
        case 2: // 连接代理设备
          connectTypeLabel = '连网方式';
          $connectTypeOptions = initConnectionTypeOptions;
          setEdgeEquipment(false);
          break;
        case 4: // 边缘节点
          connectTypeLabel = '连网方式';
          $connectTypeOptions = initConnectionTypeOptions;
          setEdgeEquipment(true);
          break;
        case 3: // 非直连设备
          connectTypeLabel = '接入连接代理通信协议';
          $connectTypeOptions = connectionAgentTypeOptions;
          setEdgeEquipment(false);
          break;
        default:
          connectTypeLabel = '连网方式';
          $connectTypeOptions = initConnectionTypeOptions;
          setEdgeEquipment(false);
          break;
      }
      setConnectTypesLabel(connectTypeLabel);
      setConnectTypeOptions([...$connectTypeOptions]);
    }
  };

  /**
   * @description 接入连接代理通信协议 选择其他时 输入框格式校验
   */
  const handleConnectTypeInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const reg = /^[a-zA-Z0-9\-_]{0,30}$/;
    const val = event.target.value;
    if (!reg.test(val)) {
      setConnectTypesInputErr('请输入30个字符内的英文、数字、下划线、连字符');
    } else {
      setConnectTypesInputErr('');
    }
  };

  /**
   * @description 接入连接代理通信协议 选择其他
   */

  const connectTypeChange = (e: RadioChangeEvent) => {
    console.log(e.target.value);
    setThingTypeInfo({ ...modelInfo, connectTypes: e.target.value });
  };
  /**
   * @description 接入连接代理通信协议 选择其他 输入框变化
   */

  /** 添加一条档案信息 */
  const addProfiles = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.setFormDirty(true);
    const customProfiles = modelInfo.customProfiles || [];
    if (customProfiles.length >= 20) return;
    customProfiles.push({
      profileName: '',
      profileValue: '',
      profileDesc: '',
      id: null,
      key: uniqueId('profile_'),
    });
    setThingTypeInfo({ ...modelInfo, customProfiles });
  };
  /** 删除一条档案信息 */
  const delProfile = (idx: number) => {
    props.setFormDirty(true);
    const { customProfiles } = modelInfo;
    customProfiles.splice(idx, 1);
    setThingTypeInfo({ ...modelInfo, customProfiles });
  };
  /** 档案信息变化 */
  const handleProfilesChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
    dataType?: number
  ) => {
    props.setFormDirty(true);
    const { name, value } = event.target;
    const { customProfiles } = modelInfo;
    const allProfiles = [...globalConfigProfiles, ...customProfiles];
    const regExp = displayNameReg64;
    const errMsg = displayNameRule64;

    // 自定义档案配置
    const customIndex = index;
    let profile = customProfiles[customIndex];
    if (name === 'profileName') {
      profile.keyErrMsg = '';
      if (!regExp.test(value)) {
        profile.keyErrMsg = errMsg;
      }
      allProfiles.forEach((item, idx) => {
        if (index !== idx && item.profileName === value) {
          profile.keyErrMsg = '档案名称不能重复';
        }
      });
    }
    if (name.includes('profileValue')) {
      profile.valErrMsg = '';
      if (!regExp.test(value)) {
        profile.valErrMsg = errMsg;
      }
    }

    if (name === 'profileDesc') {
      profile.descErrMsg = '';
      if (!regExp.test(value)) {
        profile.descErrMsg =
          '仅支持100个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字';
      }
    }
    if (name.includes('profileValue')) {
      profile = { ...profile, profileValue: value };
    } else {
      profile = { ...profile, [name]: value };
    }
    customProfiles.splice(customIndex, 1, profile);
    setThingTypeInfo({ ...modelInfo, customProfiles });
  };

  // 提交
  const submitThingTypeInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values);
        let hasError = false;
        const {
          name,
          code,
          desc,
          nodeType,
          connectTypes,
          authType,
          manufacturerName,
          manufacturerId,
          deviceTypeCode,
          deviceTypeName,
          hardware,
          os,
          ...restParams
        } = values;
        const connectTypeInputValue =
          connectTypeInput.current && connectTypeInput.current.state.value;

        if (connectTypes === '-1' && !connectTypeInputValue) {
          setConnectTypesInputErr('请输入请输入通讯协议名称');
          return;
        }

        const paramprofiles: CustomProfile[] = [];
        const { customProfiles } = modelInfo;
        customProfiles.forEach((item) => {
          console.log(item);
          if (item.profileName && !item.profileValue.trim()) {
            item.valErrMsg = '档案值不能为空';
          }
          if (item.value && !item.profileName.trim()) {
            item.keyErrMsg = '档案名称不能为空';
          }
        });
        setThingTypeInfo({ ...modelInfo, customProfiles });
        try {
          // 验证档案数据是否合法
          customProfiles.forEach((item) => {
            if (item.keyErrMsg || item.valErrMsg || item.descErrMsg) {
              hasError = true;
              throw new Error();
            }
          });
        } catch (error) {
          hasError = true;
        }
        if (hasError) return; // 不合法停止操作

        customProfiles.forEach((item: CustomProfile) => {
          const { profileName, profileValue, profileDesc } = item;
          if (profileName || profileValue || profileDesc) {
            paramprofiles.push({
              profileCode: profileName,
              profileName,
              profileValue,
              profileDesc,
            });
          }
        });

        const paramGlobalProfiles: Partial<ConfigProfile>[] = [];

        globalConfigProfiles.forEach((item) => {
          item.profileValue = restParams[item.profileName];
          const {
            profileValue,
            profileName,
            profileCode,
            profileDesc,
            id,
          } = item;
          paramGlobalProfiles.push({
            profileValue,
            profileName,
            profileCode,
            profileDesc,
            id,
          });
        });

        const params = {
          name,
          code,
          desc,
          nodeType,
          connectTypes:
            connectTypes === '-1' ? connectTypeInputValue : connectTypes,
          authType,
          manufacturerName,
          manufacturerId,
          deviceTypeCode,
          deviceTypeName,
          hardware,
          os,
          customProfiles: paramprofiles,
          globalProfiles: paramGlobalProfiles,
        };
        addThingType(params)
          .then((res) => {
            if (res.code === 200) {
              props.setFormDirty(false);
              Toast('创建物类型成功');
              props.history.replace(`/thingtype/edit/${res.data}/${nodeType}`);
            }
          })
          ['catch']((error) => {
            console.log(error);
          });
      }
    });
  };
  // 渲染档案名称
  const renderProfileName = (
    text: string,
    record: Partial<ConfigProfile>,
    idx: number
  ) => (
    <div className="profile-input">
      <Input
        defaultValue={text}
        name="profileName" // 直接使用key，会有每次输入后焦点丢失的问题
        maxLength={64}
        placeholder="最多64个字符，如Light"
        onChange={(event) => handleProfilesChange(idx, event)}
      />
      {!!record.keyErrMsg && <div className="err-msg">{record.keyErrMsg}</div>}
    </div>
  );
  // 渲染档案值
  const renderProfileValue = (
    text: string,
    record: Partial<ConfigProfile>,
    idx: number
  ) => (
    <div className="profile-input">
      <Input
        defaultValue={text}
        placeholder="最多64个字符，如灯"
        name={`profileValue${idx}`}
        maxLength={64}
        onChange={(event) => handleProfilesChange(idx, event)}
      />
      {!!record.valErrMsg && (
        <div className="err-msg">
          <i className="icon-error" />
          {record.valErrMsg}
        </div>
      )}
    </div>
  );
  // 全局档案提示信息
  const profileTipContent = (item: ConfigProfile) => {
    const tips = [
      '',
      '仅支持整数',
      '仅支持浮点类型的值',
      displayNameRule64,
      '',
    ];
    return (
      <Tooltip
        title={
          <div
            className="tips"
            // eslint-disable-next-line prettier/prettier
            title={`${item.editable === 0 ? '保存后不可修改' : ''}${
              tips[item.dataType]
            }`}
          >
            {!(item.editable === 0 && item.initVal) && (
              <span>
                {item.editable === 0 && '保存后不可修改；'}
                {tips[item.dataType - 1]}
              </span>
            )}
          </div>
        }
      >
        <div className="primary-color rule">查看规则</div>
      </Tooltip>
    );
  };

  // 获取表单校验Form
  const getFormPattern = (dataType: number) => {
    let ret;
    const IntRegRx = /^(-?\d+)(\d+)?$/;
    const FloatReg = /^(-?\d+)(\.\d+)?$/;
    const StringReg = displayNameReg64;
    switch (dataType) {
      case 2:
        ret = IntRegRx;
        break;
      case 3:
        ret = FloatReg;
        break;
      case 4:
        ret = StringReg;
        break;
      default:
        ret = StringReg;
        break;
    }
    return ret;
  };
  const labelContent = (item: ConfigProfile) => (
    <span>
      <Tooltip
        title={item.profileName}
        placement="bottom"
        overlayClassName="table-cell-tooltip"
      >
        <span className="label-name">{item.profileName}</span>
      </Tooltip>
      {item.profileDesc && (
        <Tooltip title={item.profileDesc}>
          <span className="icon-help" />
        </Tooltip>
      )}
    </span>
  );

  return (
    <ObtainHeight bgColor="#fff">
      <div className="thing-type-info">
        <Form
          className="basic-info-form"
          colon={false}
          layout="inline"
          onSubmit={submitThingTypeInfo}
        >
          <h3>基本信息</h3>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="名称">
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: '请输入物类型名称' },
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message:
                        '仅支持汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格',
                    },
                  ],
                  initialValue: modelInfo.name,
                })(<Input placeholder="名称，如：电管家" maxLength={30} />)}
              </Form.Item>
              <Tooltip title="仅支持30个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格">
                <div className="primary-color rule">查看规则</div>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Form.Item label="物类型编码">
                {getFieldDecorator('code', {
                  rules: [
                    { required: true, message: '请输入物类型编码' },
                    {
                      pattern: objectNameReg,
                      message: objectNameRule,
                    },
                  ],
                  initialValue: modelInfo.code,
                })(<Input placeholder="编码" maxLength={30} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12} className="node-type-row">
              <Form.Item label="节点类型">
                {getFieldDecorator('nodeType', {
                  rules: [{ required: true, message: '请选择节点类型' }],
                  initialValue: modelInfo.nodeType,
                })(
                  <Radio.Group onChange={handleRadioChange} name="nodeType">
                    {nodeTypeConfig.map((item) => (
                      <Radio value={item.value} key={item.value}>
                        {item.label}
                        {item.desc && (
                          <Tooltip title={item.desc}>
                            <span className="ml-5 primary-color icon-help" />
                          </Tooltip>
                        )}
                      </Radio>
                    ))}
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={connectTypesLabel}>
                {getFieldDecorator('connectTypes', {
                  rules: [{ required: true, message: '请选择连接类型' }],
                  initialValue: modelInfo.connectTypes,
                })(
                  <Radio.Group onChange={connectTypeChange}>
                    {connectTypeOptions.map((item) => (
                      <Radio
                        value={item.value}
                        key={item.label}
                        className={item.value === '-1' ? 'block' : ''}
                      >
                        {item.label}

                        {modelInfo.connectTypes === '-1' &&
                          item.value === '-1' && (
                            <span>
                              <Input
                                ref={connectTypeInput}
                                onChange={handleConnectTypeInputChange}
                                maxLength={30}
                                style={{ width: 100, marginLeft: 10 }}
                              />
                              {!!connectTypesInputErr && (
                                <span className="err-msg ml-10 red">
                                  {connectTypesInputErr}
                                </span>
                              )}
                            </span>
                          )}
                      </Radio>
                    ))}
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="认证方式">
                {getFieldDecorator('authType', {
                  rules: [{ required: true, message: '' }],
                  initialValue: 1,
                })(
                  <Radio.Group disabled>
                    <Radio value={1}>一机一密</Radio>
                    <Radio value={2}>一型一密</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="制造商名称">
                {getFieldDecorator('manufacturerName', {
                  rules: [
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message:
                        '仅支持汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格',
                    },
                  ],
                  initialValue: modelInfo.manufacturerName,
                })(<Input placeholder="制造商名称" maxLength={30} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="制造商编码">
                {getFieldDecorator('manufacturerId', {
                  rules: [
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message:
                        '仅支持汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格',
                    },
                  ],
                  initialValue: modelInfo.manufacturerId,
                })(<Input placeholder="制造商编码" maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备类型名称">
                {getFieldDecorator('deviceTypeName', {
                  rules: [
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message:
                        '仅支持汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格',
                    },
                  ],
                  initialValue: modelInfo.deviceTypeName,
                })(
                  <Input
                    placeholder="请输入设备类型名称，例如：ttu、电表"
                    maxLength={30}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="设备类型编码">
                {getFieldDecorator('deviceTypeCode', {
                  rules: [
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message:
                        '仅支持汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格',
                    },
                  ],
                  initialValue: modelInfo.deviceTypeCode,
                })(<Input placeholder="设备类型编码" maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="描述">
                {getFieldDecorator('desc', {
                  initialValue: modelInfo.desc,
                })(
                  <Textarea
                    placeholder="请输入物类型描述"
                    maxLength={200}
                    height={80}
                    name="desc"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {edgeEquipment ? (
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="硬件平台">
                  {getFieldDecorator('hardware', {
                    rules: [{ required: true, message: '请选择硬件平台' }],
                    initialValue: 'arm64',
                  })(
                    <Radio.Group name="hardware">
                      {hardwareOptions.map((item) => (
                        <Radio
                          value={item.value}
                          key={item.value}
                          disabled={item.disabled}
                        >
                          {item.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="操作系统">
                  {getFieldDecorator('os', {
                    rules: [{ required: true, message: '请选择操作系统' }],
                    initialValue: 'Linux',
                  })(
                    // <Radio.Group name="os">
                    //   {osOptions.map((item) => (
                    //     <Radio value={item.value} key={item.value}>
                    //       {item.label}
                    //     </Radio>
                    //   ))}
                    // </Radio.Group>
                    <span>Linux</span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          ) : null}

          {!!globalConfigProfiles.length && <h3>全局物类型档案</h3>}
          {globalConfigProfiles.map((item) => {
            switch (item.dataType) {
              case 1: // 布尔值
                return (
                  <Row className="basic-form-row" key={item.profileCode}>
                    <Col span={12} key={item.profileCode}>
                      <Form.Item
                        label={labelContent(item)}
                        key={item.profileCode}
                      >
                        {getFieldDecorator(`${item.profileName}`, {
                          rules: [
                            {
                              required: !!item.mandatory,
                              message: `请选择${item.profileName}`,
                            },
                          ],
                          initialValue: item.profileValue || undefined,
                        })(
                          <Select
                            placeholder={`请选择${item.profileName}`}
                            className="basic-select"
                            getPopupContainer={(triggerNode: HTMLElement) =>
                              triggerNode.parentNode as HTMLElement
                            }
                          >
                            <Option key="true" value="true">
                              true
                            </Option>
                            <Option key="false" value="false">
                              false
                            </Option>
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                );
              case 5: // 字典类型
                return (
                  <Row className="basic-form-row" key={item.profileCode}>
                    <Col span={12} key={item.profileCode}>
                      <Form.Item
                        label={labelContent(item)}
                        key={item.profileCode}
                      >
                        {getFieldDecorator(`${item.profileName}`, {
                          rules: [
                            {
                              required: !!item.mandatory,
                              message: `请选择${item.profileName}`,
                            },
                          ],
                          initialValue: item.profileValue || undefined,
                        })(
                          <Select
                            placeholder={`请选择${item.profileName}`}
                            className="basic-select"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input: any, option: any) =>
                              option.key
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            getPopupContainer={(triggerNode: HTMLElement) =>
                              triggerNode.parentNode as HTMLElement
                            }
                          >
                            {!!item.dictDatas &&
                              item.dictDatas.map((dict) => (
                                <Option key={dict} value={dict}>
                                  {dict}
                                </Option>
                              ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                );
              default:
                return (
                  <Row className="basic-form-row" key={item.profileCode}>
                    <Col span={12} key={item.profileCode}>
                      <Form.Item label={labelContent(item)}>
                        {getFieldDecorator(`${item.profileName}`, {
                          rules: [
                            {
                              required: item.mandatory === 1,
                              message: `${item.profileName}不能为空`,
                            },
                            {
                              pattern: getFormPattern(item.dataType as number),
                              message: `${item.profileName}格式不正确`,
                            },
                          ],
                        })(
                          <Input
                            placeholder="64个字符，如：灯"
                            maxLength={64}
                          />
                        )}
                      </Form.Item>
                      {profileTipContent(item)}
                    </Col>
                  </Row>
                );
            }
          })}

          <div className="profiles">
            <div className="title-wrap">
              <h3 className="title">档案信息</h3>
              <span className="desc">
                可维护物类型对应的信息，如设备厂商、生产日期、颜色等，现阶段可不必填写
              </span>
            </div>

            <Table
              bordered
              className="profiles-table"
              dataSource={[...modelInfo.customProfiles]}
              pagination={false}
              rowKey={(record: ConfigProfile, index) => record.key + record.id}
            >
              <Column
                title="档案名称"
                dataIndex="profileName"
                key="profileName"
                ellipsis
                render={renderProfileName}
              />
              <Column
                title="档案值"
                dataIndex="profileValue"
                key="profileValue"
                ellipsis
                render={renderProfileValue}
              />
              {/* <Column
                      title="档案描述"
                      dataIndex="profileDesc"
                      key="profileDesc"
                      className="description"
                      width="20%"
                      render={renderProfileDesc}
                    /> */}
              <Column
                title="操作"
                dataIndex="action"
                key="action"
                className="action"
                ellipsis
                width={80}
                render={(text, record: Partial<ConfigProfile>, idx) => (
                  <Button
                    shape="circle"
                    className="handle-profiles"
                    disabled={!!record.dataType}
                    onClick={() => delProfile(idx)}
                  >
                    <i className="icon icon-delete" />
                  </Button>
                )}
              />
            </Table>
            <div className="handle-profiles">
              <span
                className={`add ${
                  modelInfo.customProfiles.length >= 20 ? 'disabled' : ''
                }`}
                onClick={addProfiles}
              >
                + 添加档案
              </span>
              {modelInfo.customProfiles.length >= 20 && (
                <span className="warning ml-20">已添加至最大</span>
              )}
            </div>
          </div>
          <div className="btn-box">
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </div>
        </Form>
      </div>
    </ObtainHeight>
  );
};

const CreateThingTypeInfo = Form.create<EditThingTypeInfoProps>({
  onValuesChange: (props) => {
    props.setFormDirty(true);
  },
})(ThingTypeInfoForm);

export default withRouter(CreateThingTypeInfo);
