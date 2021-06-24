import { Button, Form, Input, Select, Table, Tooltip, Row, Col } from 'antd';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';
import { cloneDeep, uniqueId } from 'lodash';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ProfileDictSelect from 'application/deviceManageCenter/components/ProfileDictSelect';
import { displayNameRule64 } from 'utils/constants';

import { deviceEditRequest, getProvince } from '../../services/index';
import { Area, CustomProfile, ProfileConfig, Tag } from '../../types/index';
import {
  EditContext,
  SET_WHEN,
  SET_DEVICE_INFO,
  REFRESH_DEVICE_INFO,
} from '../context';
import './deviceInfo.less';

const { Column } = Table;
const { Option } = Select;

interface AreaOption extends Area {
  label: string;
  value: any;
  isLeaf: boolean;
}

function DeviceInfoCom(props: any) {
  const cascaderEl = useRef(null);
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo } = state;
  // 获取字典档案配置信息
  const {
    globalProfiles,
    areaProvince,
    areaCity,
    areaDistrict,
    customProfiles,
  } = deviceInfo;

  const PROFILES_LENGTH = 20; // 最大档案条数

  // 档案信息
  const [deviceProfiles, setDeviceProfiles] = useState<any[]>([]);
  // 全局设备档案
  const [realGlobalProfiles, setRealGlobalProfiles] = useState<ProfileConfig[]>(
    []
  );

  // 所有省/自治区信息
  const [areaOption, setAreaOption] = useState<AreaOption[]>([]);
  // 省市县的设备初始值

  const [initialAreaValue, setInitialAreaValue] = useState<string>(() =>
    areaProvince ? `${areaProvince} / ${areaCity} / ${areaDistrict}` : ''
  );
  // 地域编辑
  const [areaEdit, setAreaEdit] = useState<boolean>(!areaProvince);
  useEffect(() => {
    // 设备档案 = 全局设备档案 + 自定义档案
    const _customProfiles = customProfiles || [];
    const profileRet1 = globalProfiles
      ? globalProfiles.filter((item: ProfileConfig) => item.scope === 3)
      : [];
    for (const i of profileRet1) {
      i.uniqueKey = uniqueId('profile_');
    }
    for (const i of _customProfiles) {
      i.uniqueKey = uniqueId('profile_');
    }
    console.log('deviceProfiles', [...profileRet1, ..._customProfiles]);
    setDeviceProfiles([...profileRet1, ..._customProfiles]);
    // 全局档案
    const profileRet2 = globalProfiles
      ? globalProfiles.filter((item: ProfileConfig) => item.scope === 1)
      : [];
    for (const k of profileRet2) {
      k.uniqueKey = uniqueId('profile_');
    }
    console.log(profileRet2);
    setRealGlobalProfiles(profileRet2);
  }, [customProfiles, globalProfiles]);

  /** 添加一条档案信息 */
  const addProfiles = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const profiles = [...deviceProfiles] || [];
    if (profiles.length >= PROFILES_LENGTH) return;
    profiles.push({
      uniqueKey: uniqueId('profile_'),
      id: null,
      profileCode: '',
      profileName: '',
      profileValue: '',
      profileDesc: '',
    });
    setDeviceProfiles(profiles);
  };
  /** 删除一条档案信息 */
  const delProfile = (idx: number) => {
    console.log(idx);
    const profiles = JSON.parse(JSON.stringify(deviceProfiles));
    profiles.splice(idx, 1);
    setDeviceProfiles(profiles);
  };

  /** 档案信息变化 */
  const handleProfilesChange = (
    index: number,
    name: string,
    event: React.ChangeEvent<HTMLInputElement> | string,
    record: CustomProfile | ProfileConfig
  ) => {
    const { value } = (event as React.ChangeEvent<HTMLInputElement>).target || {
      value: event as string,
    };
    dispatch({
      type: SET_WHEN,
      when: true,
    });
    console.log(name, value);
    const { dataType, mandatory } = record;
    let profile = deviceProfiles[index];
    const IntRegRx = /^(-?\d+)(\d+)?$/;
    const FloatReg = /^(-?\d+)(\.\d+)?$/;
    const keyReg = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
    const valReg = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
    if (name === 'profileName') {
      profile.keyErrMsg = '';
      if (!keyReg.test(value)) {
        profile.keyErrMsg = displayNameRule64;
      }
      profile = {
        ...profile,
        [name]: value,
        profileCode: value,
        profileDesc: value,
      };
    }
    if (name === 'profileValue') {
      profile.valErrMsg = '';
      // 非必需且值为空不需要校验
      if (mandatory !== 0 || (mandatory === 0 && value)) {
        if (!valReg.test(value)) {
          profile.valErrMsg = displayNameRule64;
        }
        if (dataType === 2 && !IntRegRx.test(value)) {
          profile.valErrMsg = '值类型错误，请输入整数';
        } else if (dataType === 3 && !FloatReg.test(value)) {
          profile.valErrMsg = '值类型错误，请输入浮点数';
        }
      }
      profile = { ...profile, [name]: value };
    }
    const ret = [...deviceProfiles];
    ret.splice(index, 1, profile);
    setDeviceProfiles(ret);
  };

  // 标签信息变化
  const handleTagsChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    console.log(name, value);
    const { deviceTagsList } = deviceInfo;
    let tag = deviceTagsList[index];
    tag.keyErrMsg = '';
    tag.valErrMsg = '';
    const keyReg = /^[a-zA-Z0-9]{0,30}$/;
    const valReg = /^[\u4e00-\u9fa5a-zA-Z]{0,30}$/;
    if (name === 'name' && !keyReg.test(value)) {
      tag.keyErrMsg = '仅支持30个英文_数字';
    }
    if (name === 'value' && !valReg.test(value)) {
      tag.valErrMsg = '仅支持30个中文_英文字符';
    }
    tag = { ...tag, [name]: value };
    // 输入标签的value值的时候，判断是否已经存在了
    const alreadyExit = deviceTagsList.filter((item) => {
      return item.name === tag.name && item.value === tag.value;
    });
    if (name === 'value' && alreadyExit.length > 0) {
      tag.keyErrMsg = '已经存在此标签';
    }
    deviceTagsList.splice(index, 1, tag);
    dispatch({
      type: SET_DEVICE_INFO,
      deviceInfo: { ...deviceInfo, deviceTagsList },
    });
  };

  /** 删除一个标签 */
  const delTag = (idx: number) => {
    const { deviceTagsList } = deviceInfo;
    deviceTagsList.splice(idx, 1);
    dispatch({
      type: SET_DEVICE_INFO,
      deviceInfo: { ...deviceInfo, deviceTagsList },
    });
  };

  /** 添加一个标签 */
  const addTag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const deviceTagsList = deviceInfo.deviceTagsList || [];
    deviceTagsList.push({
      uniqueKey: uniqueId('tag_'),
      id: null,
      description: '',
      key: '',
      value: '',
      name: '',
    });
    dispatch({
      type: SET_DEVICE_INFO,
      deviceInfo: { ...deviceInfo, deviceTagsList },
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    props.form.validateFields(async (err: any, fieldsValue: any) => {
      if (!err) {
        console.log('fieldsValue', fieldsValue);
        let hasError = false;
        const paramTags: Tag[] = [];
        const { deviceTagsList } = deviceInfo;
        deviceProfiles.forEach((item) => {
          if (item.mandatory !== 0 && item.profileName && !item.profileValue) {
            item.valErrMsg = '档案Value不能为空';
          }
          if (item.profileValue && !item.profileName.trim()) {
            item.keyErrMsg = '档案Key不能为空';
          }
        });
        deviceTagsList.forEach((item) => {
          if (item.name && !item.value.trim()) {
            item.valErrMsg = '标签值不能为空';
          }
          if (item.value && !(item.name as string).trim()) {
            item.keyErrMsg = '标签名称不能为空';
          }
        });
        // setDeviceInfo({ ...deviceInfo, profiles, tags });
        try {
          // 验证档案数据是否合法
          deviceProfiles.forEach((item) => {
            if (item.keyErrMsg || item.valErrMsg || item.descErrMsg) {
              hasError = true;
              throw new Error();
            }
          });
          // 校验标签合法
          deviceTagsList.forEach((item) => {
            if (item.keyErrMsg || item.valErrMsg) {
              hasError = true;
              throw new Error();
            }
          });
        } catch (error) {
          hasError = true;
        }
        if (hasError) return; // 不合法停止操作
        deviceTagsList.forEach((item: Tag) => {
          const { name, value, id } = item;
          paramTags.push({
            key: name as string,
            value,
            id,
          });
        });
        // 校验档案key是否重复
        const profileCodes = deviceProfiles.map((item) => item.profileCode);
        if (profileCodes.length !== Array.from(new Set(profileCodes)).length) {
          Toast('档案重复');
          return;
        }
        const gProfile = cloneDeep(realGlobalProfiles);
        for (const p of gProfile) {
          p.profileValue = fieldsValue[p.profileCode];
          Reflect.deleteProperty(fieldsValue, p.profileCode);
        }
        // 拼装area相关字段
        let areaParam = {};
        const { area } = fieldsValue;
        if (Array.isArray(area) && area.length) {
          for (const areaIter of area) {
            areaParam = { ...areaParam, ...JSON.parse(areaIter) };
          }
        }
        const param = {
          ...deviceInfo,
          deviceId: deviceInfo.deviceId,
          ...fieldsValue,
          globalProfiles: gProfile
            .concat(
              deviceProfiles.filter(
                (item: ProfileConfig | CustomProfile) => item.scope === 3
              ) as ProfileConfig[]
            )
            .map((item: ProfileConfig) => {
              const { profileCode, profileValue, profileName, id } = item;
              return { profileCode, profileValue, profileName, id };
            }),
          customProfiles: deviceProfiles
            .filter((item: CustomProfile) => item.scope === undefined)
            .filter((item: CustomProfile) => !!item.profileCode)
            .map((item: CustomProfile) => {
              const { profileCode, profileValue, profileName, id } = item;
              return { profileCode, profileValue, profileName, id };
            }),
          deviceTagsList: paramTags,
          ...areaParam,
        };
        deviceEditRequest(param)
          .then((res) => {
            if (res && res.code == 200) {
              Toast('保存成功');
              dispatch({
                type: SET_WHEN,
                when: false,
              });
              dispatch({
                type: REFRESH_DEVICE_INFO,
                refreshing: true,
              });
            } else {
              res && Toast(res.message);
            }
          })
          ['catch']((error) => {
            Toast(error.message);
          });
      }
    });
  };

  // input change 触发事件
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: SET_WHEN,
      when: true,
    });
  };

  // 地域改变触发事件
  const onAreaChange = () => {
    dispatch({
      type: SET_WHEN,
      when: true,
    });
  };

  // 档案key
  const renderProfileKey = (
    text: string,
    record: CustomProfile | ProfileConfig,
    idx: number
  ) => {
    const { profileName, mandatory, profileDesc, scope, profileCode } = record;
    const isConfigProfile = scope !== undefined; // 是否是物类型设备档案
    let content = null;
    if (isConfigProfile) {
      content = (
        <div>
          {mandatory === 1 && <span className="required" />}
          <span>{profileName}</span>
          {profileDesc && (
            <Tooltip placement="top" title={profileDesc}>
              <span className="primary-color ml-10 icon-help" />
            </Tooltip>
          )}
        </div>
      );
    } else {
      content = (
        <Input
          name="name"
          defaultValue={text}
          maxLength={64}
          placeholder="六十四个字符,如:灯"
          onChange={(event) =>
            handleProfilesChange(idx, 'profileName', event, record)
          }
        />
      );
    }
    return (
      <div className="profile-input">
        {content}
        {!!record.keyErrMsg && (
          <div className="err-msg">
            <i className="icon-error" />
            {record.keyErrMsg}
          </div>
        )}
      </div>
    );
  };

  // 档案值
  const renderProfileValue = (
    text: string,
    record: CustomProfile | ProfileConfig,
    idx: number
  ) => {
    const { scope, dataType, dictDatas, editable, profileValue } = record;
    const isConfigProfile = scope !== undefined; // 是否是物类型设备档案
    let content = null;
    if (isConfigProfile) {
      content =
        editable === 0 && profileValue ? (
          <span>{profileValue}</span>
        ) : (
          <>
            {dataType === 5 ? (
              <Select
                showSearch
                placeholder="选择档案值"
                defaultValue={profileValue || undefined}
                onChange={(val: string) =>
                  handleProfilesChange(idx, 'profileValue', val, record)
                }
                optionFilterProp="children"
                filterOption={(inputValue: string, option: any) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0
                }
                getPopupContainer={(triggerNode: HTMLElement) =>
                  triggerNode.parentNode as HTMLElement
                }
              >
                {dictDatas.map((v: string) => {
                  return (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  );
                })}
              </Select>
            ) : (
              <>
                {dataType === 1 ? (
                  <Select
                    placeholder="选择档案值"
                    onChange={(val: string) =>
                      handleProfilesChange(idx, 'profileValue', val, record)
                    }
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
                ) : (
                  <Input
                    placeholder="64个字符，如：灯"
                    defaultValue={text}
                    maxLength={64}
                    onChange={(event) =>
                      handleProfilesChange(idx, 'profileValue', event, record)
                    }
                  />
                )}
              </>
            )}
          </>
        );
    } else {
      content = (
        <Input
          // name="value"
          placeholder="64个字符，如：灯"
          defaultValue={text}
          maxLength={64}
          onChange={(event) =>
            handleProfilesChange(idx, 'profileValue', event, record)
          }
        />
      );
    }
    return (
      <div className="profile-input" style={{ textAlign: 'left' }}>
        {content}
        {editable === 0 && !profileValue && (
          <span className="profile-tip">保存后不可修改</span>
        )}
        {!!record.valErrMsg && (
          <div className="err-msg">
            <i className="icon-error" />
            {record.valErrMsg}
          </div>
        )}
      </div>
    );
  };
  // 全局设备档案值
  // const globalArchivesValContent = (item: ProfileConfig) => {
  //   const { editable, profileValue, dataType, dictDatas } = item;
  //   return editable === 0 && profileValue ? (
  //     <span>{profileValue}</span>
  //   ) : (
  //     <>
  //       {dataType === 5 ? (
  //         <Select style={{ width: '260px' }} placeholder="选择档案值">
  //           {dictDatas &&
  //             dictDatas.map((v: string) => {
  //               return (
  //                 <Option key={v} value={v}>
  //                   {v}
  //                 </Option>
  //               );
  //             })}
  //         </Select>
  //       ) : (
  //         <Input
  //           style={{ width: '260px' }}
  //           placeholder="64个字符，如：灯"
  //           maxLength={64}
  //         />
  //       )}
  //     </>
  //   );
  // };

  // 获取省市县信息
  const getAllProvinceInfo = async () => {
    try {
      const res = await getProvince();
      for (const i of res) {
        i.label = i.name;
        i.value = JSON.stringify({
          areaProvince: i.name,
          areaProvinceCode: i.code,
        });
        i.isLeaf = false;
      }
      setAreaOption(res);
    } catch (error) {
      console.log(error);
    }
  };

  // 全局档案提示信息
  const profileTipContent = (item: ProfileConfig) => {
    const tips = [
      '',
      '仅支持整数',
      '仅支持浮点类型的值',
      '仅支持64个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字',
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
    const StringReg = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
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

  // useEffect(() => {
  //   getAllProvinceInfo();
  // }, []);

  useEffect(() => {
    if (cascaderEl && cascaderEl.current) {
      console.log(cascaderEl.current);
      if ('createEvent' in document) {
        // modern browsers, IE9+
        const e = document.createEvent('HTMLEvents');
        e.initEvent('click', false, true);
        // cascaderEl.current.dispatchEvent(e);
      }
      // cascaderEl.current.focus();
    }
  }, [areaEdit]);

  const labelContent = (item: ProfileConfig) => (
    <span>
      <Tooltip
        title={item.profileName}
        placement="bottom"
        overlayClassName="table-cell-tooltip"
      >
        <span className="profile-name"> {item.profileName}</span>
      </Tooltip>
      {item.profileDesc && (
        <Tooltip title={item.profileDesc}>
          <span className="primary-color icon-help" />
        </Tooltip>
      )}
    </span>
  );

  const { getFieldDecorator } = props.form;

  return (
    <div className="device-info">
      <ObtainHeight bgColor="#fff">
        <Form
          className="basic-info-form"
          onSubmit={handleSubmit}
          layout="inline"
          colon={false}
        >
          <h3 className="title">基本信息</h3>
          <Row className="basic-form-row ">
            <Col span={12}>
              <Form.Item label="设备ID">{deviceInfo.deviceId}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="名称">
                {getFieldDecorator('deviceName', {
                  rules: [
                    {
                      pattern: getFormPattern(4),
                      message: '名称格式不正确',
                    },
                  ],
                  initialValue: deviceInfo.deviceName,
                })(
                  <Input
                    // style={{ width: '400px' }}
                    placeholder="设备名称"
                    maxLength={30}
                    onChange={onInputChange}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="物类型">{deviceInfo.thingTypeName}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="物模型版本">
                <span>{deviceInfo.thingModelVersion}</span>
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="设备物理ID">
                {deviceInfo.uniqueId ? deviceInfo.uniqueId : '--'}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mac地址">
                {getFieldDecorator('macAddress', {
                  rules: [
                    {
                      pattern: /((([a-f0-9]{2}:){5}))[a-z0-9]{2}/gi,
                      message: 'Mac地址格式不正确',
                    },
                  ],
                  initialValue: deviceInfo.macAddress,
                })(
                  <Input
                    maxLength={17}
                    placeholder="Mac 地址请用冒号(:)分割"
                    onChange={onInputChange}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={24}>
              <Form.Item label="注册时间">
                {deviceInfo.createTime
                  ? dayjs(deviceInfo.createTime).format('YYYY-MM-DD HH:mm:ss')
                  : ''}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
                  {areaEdit ? (
                    <Form.Item label='地域'>
                      {getFieldDecorator('area', {
                        initialValue: [],
                      })(
                        <Cascader
                          style={{ width: 400 }}
                          ref={cascaderEl}
                          options={areaOption}
                          loadData={loadAreaData}
                          // changeOn
                          getPopupContainer={(triggerNode: HTMLElement) =>
                            triggerNode.parentNode as HTMLElement
                          }
                          onChange={onAreaChange}
                        />
                      )}
                    </Form.Item>
                  ) : (
                    <Form.Item label={$t('地域')}>
                      {getFieldDecorator('area', {
                        initialValue: initialAreaValue,
                      })(
                        <Input onFocus={onAreaFocus} placeholder={$t('地域')} />
                      )}
                    </Form.Item>
                  )}
                </Col> */}
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="经度">
                {getFieldDecorator('longitude', {
                  rules: [
                    {
                      pattern: /^(-?\d+)(\.\d+)?$/,
                      message: '经度格式不正确',
                    },
                  ],
                  initialValue: deviceInfo.longitude,
                })(
                  <Input
                    maxLength={10}
                    placeholder="设备的经度"
                    onChange={onInputChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="纬度">
                {getFieldDecorator('latitude', {
                  rules: [
                    {
                      pattern: /^(-?\d+)(\.\d+)?$/,
                      message: '纬度格式不正确',
                    },
                  ],
                  initialValue: deviceInfo.latitude,
                })(
                  <Input
                    maxLength={10}
                    placeholder="设备的纬度"
                    onChange={onInputChange}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row" hidden={deviceInfo.nodeType !== 4}>
            <Col span={24}>
              <Form.Item label="边缘引擎版本">
                {deviceInfo.nodeType !== 4 ? (
                  <span></span>
                ) : (
                  getFieldDecorator('edgeEngineVersion', {
                    initialValue: deviceInfo.edgeEngineVersion,
                  })(<span>{deviceInfo.edgeEngineVersion}</span>)
                )}
              </Form.Item>
            </Col>
          </Row>
          {/* 全局设备档案 */}
          {!!realGlobalProfiles.length && <h3>全局设备档案</h3>}
          {realGlobalProfiles.map((item, idx) => {
            const {
              editable,
              profileValue,
              dataType,
              dictDatas,
              uniqueKey,
            } = item;
            return editable === 0 && profileValue ? (
              <Row className="basic-form-row" key={item.uniqueKey}>
                <Col span={24}>
                  <Form.Item label={labelContent(item)}>
                    <span>{profileValue}</span>
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <Row className="basic-form-row" key={item.uniqueKey}>
                <Col span={12}>
                  {dataType === 5 ? (
                    <>
                      {item.profileCode === 'pd_area' ? (
                        <Form.Item
                          key={item.profileCode}
                          label={labelContent(item)}
                        >
                          {getFieldDecorator(`${item.profileCode}`, {
                            rules: [
                              {
                                required: item.mandatory === 1,
                                message: `${item.profileName}不能为空`,
                              },
                            ],
                            initialValue: item.profileValue,
                          })(
                            <ProfileDictSelect
                              defaultVal={item.profileValue}
                              style={{ width: '400px' }}
                            />
                          )}
                        </Form.Item>
                      ) : (
                        <Form.Item
                          key={item.profileCode}
                          label={labelContent(item)}
                        >
                          {getFieldDecorator(`${item.profileCode}`, {
                            rules: [
                              {
                                required: item.mandatory === 1,
                                message: `${item.profileName}不能为空`,
                              },
                            ],
                            initialValue: item.profileValue,
                          })(
                            <Select
                              showSearch
                              placeholder="选择档案值"
                              getPopupContainer={(triggerNode: HTMLElement) =>
                                triggerNode.parentNode as HTMLElement
                              }
                              onChange={onInputChange}
                              optionFilterProp="children"
                              filterOption={(inputValue: string, option: any) =>
                                option.props.children
                                  .toLowerCase()
                                  .indexOf(inputValue.toLowerCase()) >= 0
                              }
                            >
                              {dictDatas &&
                                dictDatas.map((v: string) => {
                                  return (
                                    <Option key={v} value={v}>
                                      {v}
                                    </Option>
                                  );
                                })}
                            </Select>
                          )}
                        </Form.Item>
                      )}
                    </>
                  ) : (
                    <>
                      {item.dataType === 1 ? (
                        <Form.Item label={labelContent(item)}>
                          {getFieldDecorator(`${item.profileCode}`, {
                            rules: [
                              {
                                required: item.mandatory === 1,
                                message: `${item.profileName}不能为空`,
                              },
                            ],
                            initialValue: item.profileValue,
                          })(
                            <Select
                              placeholder="选择档案值"
                              getPopupContainer={(triggerNode: HTMLElement) =>
                                triggerNode.parentNode as HTMLElement
                              }
                              onChange={onInputChange}
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
                      ) : (
                        <Form.Item
                          key={item.profileCode}
                          label={labelContent(item)}
                        >
                          {getFieldDecorator(`${item.profileCode}`, {
                            rules: [
                              {
                                required: item.mandatory === 1,
                                message: `${item.profileName}不能为空`,
                              },
                              {
                                pattern: getFormPattern(dataType),
                                message: `${item.profileName}格式不正确`,
                              },
                            ],
                            initialValue: item.profileValue,
                          })(
                            <Input
                              placeholder="64个字符，如：灯"
                              maxLength={64}
                              onChange={onInputChange}
                            />
                          )}
                        </Form.Item>
                      )}
                    </>
                  )}
                  {profileTipContent(item)}
                </Col>
              </Row>
            );
          })}
          <div className="profiles">
            <div className="title-wrap">
              <h3 className="title">档案信息</h3>
              <span className="desc">
                可维护设备对应的信息，如所在台区、接入时间/激活时间等，现阶段可不必填写
              </span>
            </div>
            <Table
              bordered
              className="profiles-table"
              dataSource={deviceProfiles}
              pagination={false}
              rowKey={(record) => record.uniqueKey || uniqueId('profile_')}
            >
              <Column
                title="档案Key"
                dataIndex="profileCode"
                key="profileCode"
                ellipsis
                render={renderProfileKey}
              />
              <Column
                title="档案值"
                dataIndex="profileValue"
                key="profileValue"
                ellipsis
                render={renderProfileValue}
              />
              <Column
                title="操作"
                dataIndex="action"
                key="action"
                className="action"
                width={100}
                render={(text, record: CustomProfile | ProfileConfig, idx) => (
                  <div style={{ padding: '0 20px' }}>
                    <Button
                      title="删除"
                      disabled={record.scope !== undefined}
                      className="delete-btn"
                      shape="circle"
                      onClick={() => delProfile(idx)}
                    >
                      <i className="icon icon-delete" />
                    </Button>
                  </div>
                )}
              />
            </Table>
            <div className="primary-color mt-10 mb-20">
              <span
                className={`cursor-pointer add ${
                  deviceProfiles.length >= PROFILES_LENGTH ? 'disabled' : ''
                }`}
                onClick={addProfiles}
              >
                + 添加档案
              </span>
              {deviceProfiles.length >= PROFILES_LENGTH && (
                <span className="warning ml-20">已添加至最大</span>
              )}
            </div>
          </div>
          {/* {deviceInfo.canDirectlyConnect && (
              <div className="basic-info">
                <h3 className="title">连接代理设备信息</h3>
                <Form.Item label="连接代理设备">
                  {deviceInfo.deviceId}{' '}
                  <a className="ml-20" href="#">
                    查看
                  </a>
                </Form.Item>
                <Form.Item label="密钥文件">
                  {deviceInfo.deviceName}{' '}
                  <a className="ml-20" href="#">
                    下载
                  </a>
                </Form.Item>
              </div>
            )} */}
          {/* 标签 */}
          <div className="profiles profiles-tag2">
            <h3 className="title">标签信息</h3>
            <Table
              bordered
              className="profiles-table"
              dataSource={deviceInfo.deviceTagsList}
              pagination={false}
              rowKey={(record) => record.uniqueKey || uniqueId('tag')}
            >
              <Column
                title="标签Key"
                dataIndex="key"
                key="key"
                render={(text, record: Tag, idx) => (
                  <div className="profile-input">
                    <Input
                      defaultValue={text}
                      name="name" // 直接使用key，会有每次输入后焦点丢失的问题
                      maxLength={30}
                      placeholder="30个英文、数字，如city"
                      onChange={(event) => handleTagsChange(idx, event)}
                    />
                    {!!record.keyErrMsg && (
                      <div className="err-msg">
                        <i className="icon-error" />
                        {record.keyErrMsg}
                      </div>
                    )}
                  </div>
                )}
              />
              <Column
                title="标签值"
                dataIndex="value"
                key="value"
                render={(text, record: Tag, idx) => (
                  <div className="profile-input">
                    <Input
                      placeholder="30个中文、英文字符，如：bj"
                      name="value"
                      defaultValue={text}
                      maxLength={30}
                      onChange={(event) => handleTagsChange(idx, event)}
                    />
                    {!!record.valErrMsg && (
                      <div className="err-msg">
                        <i className="icon-error" />
                        {record.valErrMsg}
                      </div>
                    )}
                  </div>
                )}
              />
              <Column
                title="操作"
                dataIndex="action"
                key="action"
                className="action"
                width={100}
                render={(text, record, idx) => (
                  <div
                    style={{ padding: '0 20px' }}
                    className="primary-color cursor-pointer"
                    onClick={() => delTag(idx)}
                  >
                    <Button title="删除" className="delete-btn" shape="circle">
                      <i className="icon icon-delete" />
                    </Button>
                  </div>
                )}
              />
            </Table>
            <div className="primary-color mt-10">
              <span
                className={`add cursor-pointer ${
                  deviceInfo.deviceTagsList &&
                  deviceInfo.deviceTagsList.length > 10
                    ? 'disabled'
                    : ''
                }`}
                onClick={addTag}
              >
                + 添加标签
              </span>
              {deviceInfo.deviceTagsList &&
                deviceInfo.deviceTagsList.length >= 10 && (
                  <span className="warning ml-20">已添加至最大</span>
                )}
            </div>
          </div>
          <div className="btn-box">
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </ObtainHeight>
    </div>
  );
}
export default Form.create<any>({})(DeviceInfoCom);
