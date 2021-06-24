import {
  Button,
  Cascader,
  Form,
  Input,
  Select,
  Table,
  Tooltip,
  Row,
  Col,
} from 'antd';

import Header from 'components/Header/index';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';
import { uniqueId, cloneDeep } from 'lodash';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { displayNameReg64, displayNameRule64 } from 'utils/constants';
import {
  deviceRegisterRequest,
  getCityByProvinceName,
  getThingTypeListRequest,
  getDistrictByCityName,
  getProvince,
  loadProfile,
  queryHistoryVersion,
  VersionItem,
} from '../services/index';
import {
  Area,
  CustomProfile,
  ThingType,
  DeviceInfo,
  ProfileConfig,
  Tag,
} from '../types/index';
import './addDevice.less';
import ProfileDictSelect from '../components/ProfileDictSelect';
import { queryThingType } from 'application/thingTypeCenter/services/index';

const { Column } = Table;
const { Option } = Select;

interface AreaOption extends Area {
  label: string;
  value: any;
  isLeaf: boolean;
}

function AddDevice(props: any) {
  const PROFILES_LENGTH = 20; // 最大档案条数
  const history = useHistory();
  const currentPath = history.location.pathname;
  const initDeviceInfo: DeviceInfo = {
    thingModelVersion: '',
    deviceId: '',
    deviceName: '',
    thingTypeCode: '',
    thingTypeName: '',
    thingModelCode: '',
    agentStatus: true, // 代理状态
    syncStatus: 1,
    createTime: 1,
    updateTime: 1,
    nodeType: 1,
    uniqueId: '',
    macAddress: '',
    deviceTagsList: [
      {
        id: null,
        uniqueKey: uniqueId('tag_'),
        key: '',
        value: '',
        description: '',
      },
    ],
    status: 1, // 设备状态{0 停用； 1 未激活； 2 离线； 3 在线}
    areaProvince: '',
    areaProvinceCode: '',
    areaCity: '',
    areaCityCode: '',
    areaDistrict: '',
    areaDistrictCode: '',
    longitude: '',
    latitude: '',
    ip: '',
    lastConnectTime: 1,
    lastDisconnectTime: 1,
    activateTime: 1,
    globalProfiles: [
      {
        scope: 1,
        profileCode: '',
        profileName: '',
        profileDesc: '',
        profileValue: '',
        dataType: 1,
        mandatory: 1,
        editable: 1,
        id: null,
        uniqueKey: uniqueId('profile_'),
      },
    ],
    customProfiles: [
      {
        id: null,
        uniqueKey: uniqueId('profile_'),
        profileCode: '',
        profileName: '',
        profileValue: '',
        profileDesc: '',
      },
    ],
  };

  // 全局档案
  const initRealGlobalProfiles: ProfileConfig[] = [
    // {
    //   scope: 1, // 档案类型，1=全局设备，2=全局物类型，3=物类型设备
    //   profileCode: 'sd1123', // 档案编号
    //   profileName: '边缘框架', // 档案名称
    //   profileDesc: 'edge_framework', // 档案描述
    //   profileValue: '', // 档案值
    //   dataType: 5, // 档案数据类型，1=布尔，2=整型，3=浮点型，4=字符串，5=DICT
    //   mandatory: 0, // 是否必填,1=必填，0非必填
    //   editable: 0, // 是否可修改，1=可修改，0=不可修改
    //   dictType: 'dictType', // data_type=DICT时，字典表的type
    //   dictDatas: ['joylink1.0', 'joylink2.0', 'joylink3.0'], // 档案数据类型为DICT时的字典数据
    // },
  ];

  const initDeviceMetaIdList: ThingType[] = [];
  const initDeviceProfiles: CustomProfile[] | ProfileConfig[] = [
    {
      uniqueKey: uniqueId('profile_'),
      id: null,
      profileCode: '',
      profileName: '',
      profileValue: '',
      profileDesc: '',
    },
  ];

  const [versionList, setVersionList] = useState<VersionItem[]>([]);

  const { getFieldDecorator } = props.form;
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(initDeviceInfo);
  const [thingTypeList, setThingTypeList] = useState(initDeviceMetaIdList);
  // 物理ID是否不限，地产中去掉这个限制
  // const [uniqueIdRequired, setUniqueIdRequired] = useState<boolean>(false);
  // 档案信息
  const [deviceProfiles, setDeviceProfiles] = useState(initDeviceProfiles);
  // 全局设备档案
  const [realGlobalProfiles, setRealGlobalProfiles] = useState(
    initRealGlobalProfiles
  );
  // 所有省/自治区信息
  const [areaOption, setAreaOption] = useState<AreaOption[]>([]);

  // 获取物类型列表
  const getThingTypeList = () => {
    getThingTypeListRequest()
      .then((res) => {
        if (res) {
          if (currentPath === '/edge/node/add') {
            const list = res.filter((item: any) => item.nodeType === 4);
            setThingTypeList(list);
          } else {
            setThingTypeList(res);
          }
        }
      })
      ['catch']((err) => {
        console.log(err);
        setThingTypeList([]);
      });
  };

  const loadConfigProfile = async (thingTypeCode?: string) => {
    const loadProfileParam = { thingTypeCode };
    try {
      const profilesConfig = await loadProfile(loadProfileParam);
      profilesConfig.forEach((item: ProfileConfig) => {
        item.uniqueKey = uniqueId('profile_');
      });
      // 物类型设备档案
      const profileRet1 = profilesConfig.filter(
        (item: ProfileConfig) => item.scope !== 1
      );
      // 全局设备档案
      const profileRet2 = profilesConfig.filter(
        (item: ProfileConfig) => item.scope === 1
      );
      setDeviceProfiles(profileRet1.concat(initDeviceProfiles));
      setRealGlobalProfiles(profileRet2);
    } catch (error) {
      console.log(error);
      setDeviceProfiles(initDeviceProfiles);
    }
  };
  // 判断是否为边缘节点
  const [edgeNode, setEdgeNode] = useState<boolean>(true);
  // 查询物类型信息
  const queryModeInfo = (id: string) => {
    queryThingType({ code: id })
      .then((res) => {
        if (res.code === 200) {
          res.data.nodeType === 4 ? setEdgeNode(false) : setEdgeNode(true);
        }
      })
      ['catch']((err) => {
        console.log(err);
      });
  };
  // 设备物类型改变
  const onThingTypeCodeChange = (thingTypeInfo: string) => {
    const thingTypeObj: ThingType = JSON.parse(thingTypeInfo);
    loadConfigProfile(thingTypeObj.id);
    getVersionByMetaId(thingTypeObj.id);
    queryModeInfo(thingTypeObj.id);
  };

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
    setDeviceInfo({ ...deviceInfo, deviceTagsList });
  };

  /** 删除一个标签 */
  const delTag = (idx: number) => {
    const { deviceTagsList } = deviceInfo;
    deviceTagsList.splice(idx, 1);
    setDeviceInfo({ ...deviceInfo, deviceTagsList });
  };

  /** 添加一个标签 */
  const addTag = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const deviceTagsList = deviceInfo.deviceTagsList || [];
    deviceTagsList.push({
      uniquekey: uniqueId('tag_'),
      id: null,
      description: '',
      key: '',
      value: '',
    });
    setDeviceInfo({ ...deviceInfo, deviceTagsList });
  };

  /**
   * @description: 点击创建，提交表单
   * @param {type}
   * @return:
   */

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    props.form.validateFields(async (err: any, fieldsValue: any) => {
      if (!err) {
        console.log('fieldsValue', fieldsValue);
        const thingTypeObj: ThingType = JSON.parse(fieldsValue.thingType);
        const thingTypeName = thingTypeObj.name;
        const thingTypeCode = thingTypeObj.id;
        const [
          thingModelVersion,
          thingModelCode,
        ] = fieldsValue.thingModelVersion.split('|');
        delete fieldsValue.thingType;
        const transFieldsValue = {
          ...fieldsValue,
          thingTypeCode,
          thingTypeName,
          thingModelCode,
          thingModelVersion,
        };
        let hasError = false;
        // const paramprofiles: Profile[] = [];
        const paramTags: Tag[] = [];
        const { deviceTagsList } = deviceInfo;
        deviceProfiles.forEach((item) => {
          if (item.mandatory !== 0 && item.profileName && !item.profileValue) {
            item.valErrMsg = '档案值不能为空';
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
        // setDeviceInfo({ ...deviceInfo, profiles: deviceProfiles, tags });
        try {
          // 验证档案数据是否合法
          deviceProfiles.forEach((item) => {
            if (item.keyErrMsg || item.valErrMsg || item.descErrMsg) {
              hasError = true;
              throw new Error();
            }
          });
          // 验证标签数据是否合法
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

        // 过滤非空tags
        deviceTagsList.forEach((item: Tag) => {
          const { name, value, id } = item;
          if (name && value) {
            paramTags.push({ key: name as string, value, id });
          }
        });
        // 校验档案key是否重复
        const profileCodes = deviceProfiles.map(
          (item: CustomProfile | ProfileConfig) => {
            return item.profileCode;
          }
        );
        if (profileCodes.length !== Array.from(new Set(profileCodes)).length) {
          Toast('档案重复');
          return;
        }
        const gProfile = cloneDeep(realGlobalProfiles);
        for (const p of gProfile) {
          p.profileValue = transFieldsValue[p.profileCode];
          Reflect.deleteProperty(transFieldsValue, p.profileCode);
        }
        console.log('gProfile', gProfile);

        const gParamProfile: Partial<ProfileConfig>[] = [];
        gProfile
          .concat(
            deviceProfiles.filter(
              (item: ProfileConfig | CustomProfile) => item.scope === 3
            ) as ProfileConfig[]
          )
          .forEach((item: ProfileConfig) => {
            const { profileCode, profileValue, profileName, scope, id } = item;
            if (profileCode) {
              gParamProfile.push({
                profileCode,
                profileValue,
                profileName,
                scope,
                id,
              });
            }
          });
        // 拼装area相关字段
        let areaParam = {};
        const { area } = fieldsValue;
        if (area && area.length) {
          for (const areaIter of area) {
            areaParam = { ...areaParam, ...JSON.parse(areaIter) };
          }
        }
        console.log(gParamProfile);
        const param = {
          ...transFieldsValue,
          globalProfiles: gParamProfile,
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
        console.log('param', param);
        deviceRegisterRequest(param)
          .then((res) => {
            if (res && res.code == 200) {
              Toast('创建成功');
              if (res.data) {
                currentPath === '/edge/node/add'
                  ? props.history.replace(`/edge/node/edit/${res.data}`)
                  : props.history.replace(
                      `/deviceManage/editDevice/${res.data}`
                    );
              }
            }
          })
          ['catch']((error) => {
            console.log(error);
          });
      }
    });
  };

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

  useEffect(() => {
    getThingTypeList();
    // getAllProvinceInfo();
    loadConfigProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 档案key
  const renderProfileKey = (
    text: string,
    record: CustomProfile | ProfileConfig,
    idx: number
  ) => {
    const { profileName, mandatory, profileDesc, scope } = record;
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
          placeholder="64个字符，如：灯"
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
    const { scope, dataType, dictDatas, editable } = record;
    const isConfigProfile = scope !== undefined; // 是否是物类型设备档案
    let content = null;
    if (isConfigProfile) {
      content =
        dataType === 5 ? (
          <Select
            showSearch
            placeholder="选择档案值"
            onChange={(val: string) =>
              handleProfilesChange(idx, 'profileValue', val, record)
            }
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
        {editable === 0 && <span className="profile-tip">保存后不可修改</span>}
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
  //   return item.dataType === 5 ? (
  //     <Select
  //       style={{ width: '400px' }}
  //       placeholder="选择档案值"
  //       // onChange={(val: string) =>
  //       //   handleProfilesChange(idx, 'value', val, record)
  //       // }
  //     >
  //       {item.dictDatas &&
  //         item.dictDatas.map((v: string) => {
  //           return (
  //             <Option key={v} value={v}>
  //               {v}
  //             </Option>
  //           );
  //         })}
  //     </Select>
  //   ) : (
  //     <Input
  //       // style={{ width: '260px' }}
  //       placeholder="64个字符，如：灯"
  //       // defaultValue={}
  //       maxLength={64}
  //       // onChange={event =>
  //       //   handleProfilesChange(idx, 'value', event, record)
  //       // }
  //     />
  //   );
  // };

  // 加载地域级联选项
  const loadAreaData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    console.log(targetOption);
    let optionChildren: AreaOption[] = [];
    const isLeaf = targetOption.level + 1 === 3;
    try {
      if (isLeaf) {
        optionChildren = await getDistrictByCityName({
          cityName: targetOption.label,
        });
      } else {
        optionChildren = await getCityByProvinceName({
          provinceName: targetOption.label,
        });
      }
      for (const i of optionChildren) {
        i.label = i.name;
        i.value = isLeaf
          ? JSON.stringify({
              areaDistrict: i.name,
              areaDistrictCode: i.code,
            })
          : JSON.stringify({ areaCity: i.name, areaCityCode: i.code });
        i.isLeaf = isLeaf;
      }
    } catch (error) {
      console.log(error);
    }

    targetOption.loading = false;
    targetOption.children = optionChildren;
    setAreaOption([...areaOption]);
  };

  // 全局档案提示信息
  const profileTipContent = (item: ProfileConfig) => {
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

  const labelContent = (item: ProfileConfig) => (
    <>
      <span className="profile-name" title={item.profileName}>
        {item.profileName}
      </span>
      {item.profileDesc && (
        <Tooltip title={item.profileDesc}>
          <span className="primary-color icon-help" />
        </Tooltip>
      )}
    </>
  );
  // ~~~~~~~~~~~~~~~~~~~~~物模型新协议~~~~~~~~~~~~~~~~~~~~~~~~

  const getVersionByMetaId = async (id: string) => {
    try {
      const res = await queryHistoryVersion({
        thingTypeId: id,
        publishedStatus: 1,
      });
      // console.log('data', data);
      if (res && res.data) {
        setVersionList(res.data);
      }
    } catch (error) {
      //
    } finally {
      // props.form.setFieldsValue({ thingModelVersion: '' });
    }
  };
  useEffect(() => {
    if (currentPath === '/edge/node/add' && versionList.length !== 0) {
      props.form.setFieldsValue({
        thingModelVersion: `${
          versionList[versionList.length - 1].thingModelVersion
        }|${versionList[versionList.length - 1].id}`,
      });
    } else {
      props.form.resetFields(['thingModelVersion']);
    }
  }, [currentPath, versionList]);

  return (
    <div className="add-device">
      <Header
        back
        mClassName="add-device-header"
        to={
          currentPath === '/edge/node/add'
            ? '/edge/node'
            : '/deviceManage/deviceList'
        }
        title={currentPath === '/edge/node/add' ? '注册节点' : '注册设备'}
      />
      <ObtainHeight bgColor="#fff">
        <Form
          onSubmit={handleSubmit}
          className="basic-info-form"
          layout="inline"
          colon={false}
        >
          <h3>基本信息</h3>
          <Row className="basic-form-row">
            <Col span={24}>
              <Form.Item label="名称">
                {getFieldDecorator('deviceName', {
                  rules: [
                    {
                      required: true,
                      message: '名称不能为空',
                    },
                    {
                      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]{0,30}$/,
                      message: '名称格式不正确',
                    },
                  ],
                })(
                  <Input
                    maxLength={30}
                    placeholder="仅支持30个汉字、英文字母、数字、下划线(_)、连字符(-)、点(.)、空格"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="物类型">
                {getFieldDecorator('thingType', {
                  rules: [
                    {
                      required: true,
                      message: '物类型没有选择',
                    },
                  ],
                })(
                  <Select
                    showSearch
                    dropdownClassName="add-device-select"
                    // style={{ width: 400 }}
                    placeholder={
                      currentPath === '/edge/node/add'
                        ? '选择节点类型为边缘节点的物类型'
                        : '选择物类型'
                    }
                    onChange={onThingTypeCodeChange}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    getPopupContainer={(triggerNode: HTMLElement) =>
                      triggerNode.parentNode as HTMLElement
                    }
                  >
                    {thingTypeList.map((v: ThingType, k) => {
                      return (
                        <Option key={v.name + v.id} value={JSON.stringify(v)}>
                          <div className="option-box">
                            <span className="option-name">{v.name}</span>
                            <br />
                            <span className="option-id">ID: {v.id}</span>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="物模型版本">
                {getFieldDecorator('thingModelVersion', {
                  rules: [{ required: true, message: '物模型版本没有选择' }],
                })(
                  <Select placeholder="选择版本">
                    {versionList.map((v: VersionItem) => (
                      <Option
                        key={v.id}
                        value={`${v.thingModelVersion}|${v.id}`}
                      >
                        {v.thingModelVersion}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="Mac地址">
                {getFieldDecorator('macAddress', {
                  rules: [
                    {
                      pattern: /((([a-f0-9]{2}:){5}))[a-z0-9]{2}/gi,
                      message: 'Mac地址格式不正确',
                    },
                    {
                      // required: true,
                      message: 'Mac地址不能为空',
                    },
                  ],
                })(
                  <Input maxLength={17} placeholder="Mac 地址请用冒号(:)分割" />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span>设备物理ID</span>}>
                {getFieldDecorator('uniqueId', {
                  rules: [
                    { required: true, message: '物理ID不能为空' },
                    {
                      pattern: /^[a-zA-Z0-9-_]{1,32}$/,
                      message: '设备物理ID格式不正确',
                    },
                  ],
                })(
                  <Input
                    maxLength={32}
                    placeholder="仅支持32个英文字符、数字、下划线(_)、连字符(-)"
                  />
                )}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
                  <Form.Item label={$t('地域')}>
                    {getFieldDecorator('area')(
                      <Cascader
                        style={{ width: 400 }}
                        options={areaOption}
                        loadData={loadAreaData}
                        getPopupContainer={(triggerNode: HTMLElement) =>
                          triggerNode.parentNode as HTMLElement
                        }
                        // changeOnSelect
                      />
                    )}
                  </Form.Item>
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
                })(<Input maxLength={10} placeholder="设备的经度" />)}
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
                })(<Input maxLength={10} placeholder="设备的纬度" />)}
              </Form.Item>
            </Col>
          </Row>
          <h3>全局设备档案</h3>

          {realGlobalProfiles.map((item, idx) => {
            return item.dataType === 5 ? (
              <Row className="basic-form-row" key={item.profileCode}>
                <Col span={24}>
                  {item.profileCode === 'pd_area' ? (
                    <Form.Item label={labelContent(item)}>
                      {getFieldDecorator(`${item.profileCode}`, {
                        rules: [
                          {
                            required: item.mandatory === 1,
                            message: `${item.profileName}不能为空`,
                          },
                        ],
                      })(<ProfileDictSelect style={{ width: '400px' }} />)}
                    </Form.Item>
                  ) : (
                    <Form.Item label={labelContent(item)}>
                      {getFieldDecorator(`${item.profileCode}`, {
                        rules: [
                          {
                            required: item.mandatory === 1,
                            message: `${item.profileName}不能为空`,
                          },
                        ],
                      })(
                        <Select
                          showSearch
                          placeholder="选择档案值"
                          filterOption={(inputValue: string, option: any) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(inputValue.toLowerCase()) >= 0
                          }
                          getPopupContainer={(triggerNode: HTMLElement) =>
                            triggerNode.parentNode as HTMLElement
                          }
                        >
                          {item.dictDatas &&
                            item.dictDatas.map((v: string) => {
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
                </Col>
              </Row>
            ) : (
              <Row className="basic-form-row" key={item.profileCode}>
                <Col span={12}>
                  {item.dataType === 1 ? (
                    <Form.Item label={labelContent(item)}>
                      {getFieldDecorator(`${item.profileCode}`, {
                        rules: [
                          {
                            required: item.mandatory === 1,
                            message: `${item.profileName}不能为空`,
                          },
                        ],
                      })(
                        <Select
                          style={{ width: '400px' }}
                          placeholder="选择档案值"
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
                  ) : (
                    <Form.Item label={labelContent(item)}>
                      {getFieldDecorator(`${item.profileCode}`, {
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
                      })(
                        <Input placeholder="64个字符，如：灯" maxLength={64} />
                      )}
                    </Form.Item>
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
              rowKey={(record, idx) => record.uniqueKey + record.id}
            >
              <Column
                title="档案Key"
                dataIndex="profileName"
                key="profileName"
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
            <div className="primary-color mt-10">
              <span
                className={`add cursor-pointer ${
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
          {/* 标签 */}
          <div className="profiles tag-profiles">
            <h3 className="title">标签信息</h3>
            <Table
              bordered
              className="profiles-table"
              dataSource={deviceInfo.deviceTagsList}
              pagination={false}
              rowKey={(record) => record.uniqueKey}
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
                  deviceInfo &&
                  Array.isArray(deviceInfo.deviceTagsList) &&
                  deviceInfo.deviceTagsList.length > 10
                    ? 'disabled'
                    : ''
                }`}
                onClick={addTag}
              >
                + 添加标签
              </span>
              {deviceInfo.deviceTagsList.length >= 10 && (
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
      </ObtainHeight>
    </div>
  );
}
export default Form.create<any>({})(AddDevice);
