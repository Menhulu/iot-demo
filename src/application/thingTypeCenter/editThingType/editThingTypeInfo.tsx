import React, { useState, useEffect } from 'react';
import { withRouter, RouteComponentProps, useParams } from 'react-router-dom';
import { Table, Input, Button, Form, Select, Tooltip, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Textarea from 'components/TextArea';
import Toast from 'components/SimpleToast';
import { uniqueId, cloneDeep } from 'lodash';
import { ThingTypeItem, CustomProfile, ConfigProfile } from '../types/index';

import { editThingType, queryThingType } from '../services/index';

import './index.less';
import {
  nodeTypeConfig,
  initConnectionTypeOptions,
  connectionAgentTypeOptions,
  displayNameReg64,
  displayNameRule64,
} from 'utils/constants';

const { Column } = Table;
const { Option } = Select;
interface EditThingTypeInfoProps
  extends FormComponentProps,
    RouteComponentProps<{ id: string }> {
  setFormDirty: (flag: boolean) => void;
  changeTab: (tab: string) => void;
  activeTab: string;
}

const EditThingTypeForm = (props: EditThingTypeInfoProps) => {
  const { getFieldDecorator, setFieldsValue } = props.form;

  const { setFormDirty, activeTab, changeTab } = props;
  const { id } = useParams<{ id: string; nodeType: string }>();

  const [modelInfo, setModelInfo] = useState<ThingTypeItem>({
    desc: '',
    name: '',
    code: '',
    connectTypes: '',
    nodeType: -1,
    authType: 1,
    source: '',
    customProfiles: [],
    globalProfiles: [],
  });
  useEffect(() => {
    const queryModeInfo = () => {
      queryThingType({ code: id })
        .then((res) => {
          if (res.code === 200) {
            const data = res.data;
            console.log(data, '我试试---');
            data.globalProfiles = data.globalProfiles || [];
            data.customProfiles = data.customProfiles || [];
            data.nodeTypeName = nodeTypeConfig.find(
              (item) => item.value === data.nodeType
            )?.label;
            //  匹配显示的中文文本，选择其他时，直接显示返回内容
            data.connectTypeName =
              [
                ...initConnectionTypeOptions,
                ...connectionAgentTypeOptions,
              ].find((item) => item.value === data.connectTypes)?.label ||
              data.connectTypes;
            setModelInfo(data);
            setFieldsValue({
              name: data.name,
              desc: data.desc,
              code: data.code,
              manufacturerName: data.manufacturerName,
              manufacturerId: data.manufacturerId,
              deviceTypeCode: data.deviceTypeCode,
              deviceTypeName: data.deviceTypeName,
            });
            setFormDirty(false);
          }
        })
        ['catch']((err) => {
          console.log(err);
        });
    };
    activeTab === '1' && queryModeInfo();
  }, [id, activeTab, setFormDirty, setFieldsValue, modelInfo.nodeType]);
  /** 添加一条档案信息 */
  const addProfiles = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // 设置是否编辑过的标记
    const profiles = modelInfo.customProfiles || [];
    if (profiles.length >= 20) return;
    profiles.push({
      profileDesc: '',
      profileName: '',
      profileValue: '',
      profileCode: '',
      id: null,
      key: uniqueId('profile_'),
    });
    setModelInfo({ ...modelInfo, customProfiles: profiles });
    setFormDirty(true);
  };
  /** 删除一条档案信息 */
  const delProfile = (idx: number) => {
    // 设置是否编辑过的标记
    props.setFormDirty(true);

    const { customProfiles } = modelInfo;
    customProfiles.splice(idx, 1);
    setModelInfo({ ...modelInfo, customProfiles });
  };
  /** 档案信息变化 */
  const handleProfilesChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
    dataType?: number
  ) => {
    // 设置是否编辑过的标记
    props.setFormDirty(true);
    const { name, value } = event.target;
    const { customProfiles, globalProfiles } = modelInfo;
    const allProfiles = [...globalProfiles, ...customProfiles];

    const regExp = /^[\u4e00-\u9fa5a-zA-Z0-9]+([-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9]+)*$/;

    const valErrMsg =
      '仅支持64个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字';
    const keyErrMsg =
      '仅支持64个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字';

    // 自定义档案配置
    const customIndex = index;
    let profile = customProfiles[customIndex];
    if (name === 'profileName') {
      profile.keyErrMsg = '';
      if (!regExp.test(value)) {
        profile.keyErrMsg = keyErrMsg;
      }
      allProfiles.forEach((item, idx) => {
        if (index !== idx && item.profileName === value) {
          profile.keyErrMsg = '档案名称不能重复';
        }
      });
    }
    if (name === 'profileValue') {
      profile.valErrMsg = '';
      if (!regExp.test(value)) {
        profile.valErrMsg = valErrMsg;
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
    console.log('进入change值的时候----');
    setModelInfo({ ...modelInfo, customProfiles });
  };

  // 提交
  const submitModelInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let hasError = false;
        const paramprofiles: CustomProfile[] = [];
        const { customProfiles } = modelInfo;
        console.log(customProfiles, 'submitModelInfo--------');
        customProfiles.forEach((item: CustomProfile) => {
          if (item.profileName && !item.profileValue.trim()) {
            item.valErrMsg = '档案值不能为空';
          } else {
            item.valErrMsg = '';
          }
          if (item.profileValue && !item.profileName.trim()) {
            item.keyErrMsg = '档案Key不能为空';
          }
        });
        setModelInfo({ ...modelInfo, customProfiles });
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
          const { profileName, profileValue, profileDesc, id } = item;
          if (profileName || profileValue || profileDesc) {
            paramprofiles.push({
              id: id,
              profileCode: profileName,
              profileName,
              profileValue,
              profileDesc,
            });
          }
        });
        const {
          name,
          desc,
          manufacturerName,
          manufacturerId,
          deviceTypeCode,
          deviceTypeName,
          ...restParams
        } = values;

        const paramGlobalProfiles: Pick<
          ConfigProfile,
          'profileValue' | 'profileName' | 'profileCode' | 'profileDesc' | 'id'
        >[] = [];

        // 取全局档案的值
        modelInfo.globalProfiles.forEach((item) => {
          item.profileValue = restParams[item.profileName];

          const {
            profileValue,
            profileName,
            profileCode,
            profileDesc,
            id,
          } = item;
          paramGlobalProfiles.push({
            id: id,
            profileValue,
            profileName,
            profileCode,
            profileDesc,
          });
        });

        const params = {
          ...modelInfo,
          desc,
          name,
          manufacturerName,
          manufacturerId,
          deviceTypeCode,
          deviceTypeName,
          customProfiles: paramprofiles,
          globalProfiles: paramGlobalProfiles,
        };

        editThingType(params)
          .then((res) => {
            if (res.code === 200) {
              // 设置是否编辑过的标记
              setFormDirty(false);
              Toast('编辑物类型成功');
              changeTab(modelInfo.nodeType === 3 ? '2' : '3');
            } else {
              Toast(res.message);
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
      {!!record.keyErrMsg && (
        <div className="err-msg">
          <i className="icon-error" />
          {record.keyErrMsg}
        </div>
      )}
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
        placeholder="最多64个字符，如灯"
        // name="profileValue" // 这样会导致改的时候
        name={`profileValue${idx}`}
        defaultValue={text}
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
  console.log(modelInfo);
  return (
    <ObtainHeight bgColor="#fff">
      <div className="thing-type-info">
        <Form
          className="basic-info-form"
          colon={false}
          layout="inline"
          onSubmit={submitModelInfo}
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
                })(<Input placeholder="名称，如：电管家" maxLength={30} />)}
              </Form.Item>
              <Tooltip title="仅支持30个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字">
                <div className="primary-color rule">查看规则</div>
              </Tooltip>
            </Col>
            <Col span={12}>
              <Form.Item label="物类型编码">{modelInfo.code}</Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="节点类型">{modelInfo.nodeTypeName}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    {modelInfo.nodeType === 3
                      ? '接入连接代理通信协议'
                      : '连网方式'}
                  </span>
                }
              >
                {modelInfo.connectTypeName}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="认证方式">一机一密</Form.Item>
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
                })(<Input placeholder="设备类型编码" maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="描述">
                {getFieldDecorator('desc')(
                  <Textarea
                    placeholder="请输入物类型描述"
                    maxLength={200}
                    height={60}
                    name="desc"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {modelInfo.nodeType === 4 ? (
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="硬件平台">{modelInfo.hardware}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="操作系统">{modelInfo.os}</Form.Item>
              </Col>
            </Row>
          ) : null}
          {!!modelInfo.globalProfiles.length && <h3>全局物类型档案</h3>}
          {modelInfo.globalProfiles.map((item) => {
            if (!item.editable && !!item.profileValue) {
              return (
                <Row className="basic-form-row" key={item.profileCode}>
                  <Col span={12} key={item.profileCode}>
                    <Form.Item
                      label={labelContent(item)}
                      key={item.profileCode}
                    >
                      {item.profileValue}
                    </Form.Item>
                  </Col>
                </Row>
              );
            }
            switch (item.dataType) {
              case 1: // 布尔值
                return (
                  <Row className="basic-form-row" key={item.profileCode}>
                    <Col span={12}>
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
                            disabled={!item.editable && !!item.profileValue}
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
                    <Col span={12}>
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
                            disabled={!item.editable && !!item.profileValue}
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
                    <Col span={12}>
                      <Form.Item
                        key={item.profileCode}
                        label={labelContent(item)}
                      >
                        {getFieldDecorator(`${item.profileName}`, {
                          rules: [
                            {
                              required: item.mandatory === 1,
                              message: `${item.profileName}不能为空`,
                            },
                            {
                              pattern: getFormPattern(item.dataType),
                              message: `${item.profileName}格式不正确`,
                            },
                          ],
                          initialValue: item.profileValue,
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
              rowKey={(record, index) => record.key + record.id}
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
                      width="20%"
                      className="description"
                      render={renderProfileDesc}
                    /> */}
              <Column
                title="操作"
                dataIndex="action"
                key="action"
                className="action"
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
          {/* <div className="btn-box" hidden={modelInfo.nodeType === 4}> */}
          <div className="btn-box">
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </div>
    </ObtainHeight>
  );
};
const EditThingTypeInfo = Form.create<EditThingTypeInfoProps>({
  onValuesChange: (props) => {
    props.setFormDirty(true);
  },
})(EditThingTypeForm);

export default withRouter(EditThingTypeInfo);
