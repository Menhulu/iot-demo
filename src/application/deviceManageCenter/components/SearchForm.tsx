import { Button, Col, Form, Input, Row, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { cloneDeep, uniqueId } from 'lodash';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { triggerEvent } from 'utils/tools';
import { displayNameRule64, REGION, nodeTypeConfig } from 'utils/constants';

import { getCityByProvinceName, loadProfile } from '../services';
import { Area, ProfileConfig, Tag } from '../types';
import ProfileDictSelect from './ProfileDictSelect';

import './index.less';

const { Option } = Select;

interface FormProps extends FormComponentProps {
  onSubmit: (submitParam: any) => void;
}
interface AreaOption extends Area {
  label: string;
  value: any;
  isLeaf: boolean;
}
const AdvancedSearchForm = forwardRef<FormComponentProps, FormProps>(
  ({ form, onSubmit }: FormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const ABOVE = 2;
    const BELOW = 4;

    // 设备状态选项
    const statusOption = {
      // 0: '停用',
      1: '未激活',
      2: '离线',
      3: '在线',
    };

    const initTag = [
      {
        id: uniqueId('tag_'),
        key: '',
        value: '',
      },
    ];

    const initSearchProfile = [
      {
        scope: 1,
        profileCode: '',
        profileName: '',
        profileDesc: '',
        profileValue: '',
        dataType: 4,
        mandatory: 0,
        editable: 0,
        id: null,
        uniqueKey: uniqueId('profile_'),
      },
    ];

    const [expand, setExpand] = useState<boolean>(false);
    const [configProfile, setConfigProfile] = useState<ProfileConfig[]>([]);
    // 搜索的tag的数据
    const [searchTag, setSearchTag] = useState<Tag[]>(initTag);
    // 搜索的档案的数据
    const [searchProfile, setSearchProfile] = useState<ProfileConfig[]>(
      initSearchProfile
    );
    // 所有省/自治区信息
    const [areaOption, setAreaOption] = useState<AreaOption[]>([]);

    // 点击添加条件，添加一个数据
    const addTag = () => {
      if (searchTag.length > 4) {
        return;
      }
      const tags: Tag = {
        id: uniqueId('tag_'),
        key: '',
        value: '',
      };
      setSearchTag([...searchTag, tags]);
    };

    // tag改变
    const handleTagsChange = (
      index: number,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = event.target;
      const tags = cloneDeep(searchTag);
      let tag = searchTag[index];
      tag = { ...tag, [name]: value };
      tags.splice(index, 1, tag);
      console.log(tags, '改变后的标签');
      setSearchTag(tags);
    };
    // 删除标签
    const delTag = (index: number) => {
      const tags = cloneDeep(searchTag);
      tags.splice(index, 1);
      setSearchTag(tags);
    };

    // 标签搜索条件
    const tagContent = (
      <div className="search-tag-container">
        <div className="mb-10">
          标签
          {/* <span className="tips">（提示：当Value值不输入时，默认为全部）</span> */}
        </div>
        <div className="list">
          {searchTag.length > 0 &&
            searchTag.map((item, index) => (
              <div className="item" key={item.id}>
                <Input
                  placeholder="请输入标签Key"
                  name="key"
                  defaultValue={item.key}
                  onChange={(event) => handleTagsChange(index, event)}
                  maxLength={30}
                />
                <Input
                  placeholder="请输入标签Value"
                  name="value"
                  defaultValue={item.value}
                  onChange={(event) => handleTagsChange(index, event)}
                  maxLength={30}
                />
                <div
                  title="删除"
                  className="del-btn-wrap"
                  onClick={() => delTag(index)}
                >
                  <span className="del-btn">
                    <span className="icon-delete" />
                  </span>
                </div>
                {(item.valErrMsg || item.keyErrMsg) && (
                  <div className="err-msg">
                    <i className="icon-error" />
                    {item.valErrMsg || item.keyErrMsg}
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className="mt-10">
          <span
            className={`add-btn ${searchTag.length > 4 ? 'disabled' : ''}`}
            onClick={addTag}
          >
            <span className="icon-add-to" />
            添加条件
          </span>
        </div>
      </div>
    );

    // 点击添加条件，添加一个数据
    const addProfile = () => {
      if (searchProfile.length > 4) {
        return;
      }
      const profile: ProfileConfig = {
        id: null,
        uniqueKey: uniqueId('profile_'),
        scope: 1,
        profileCode: '',
        profileName: '',
        profileDesc: '',
        profileValue: '',
        dataType: 4,
        mandatory: 0,
        editable: 0,
      };
      setSearchProfile([...searchProfile, profile]);
    };

    // 档案改变
    const handleProfilesChange = (
      index: number,
      name: string,
      event: React.ChangeEvent<HTMLInputElement> | string,
      record: ProfileConfig
    ) => {
      const { value } = (event as React.ChangeEvent<HTMLInputElement>)
        .target || {
        value: event as string,
      };
      console.log(record);
      const IntRegRx = /^(-?\d+)(\d+)?$/;
      const FloatReg = /^(-?\d+)(\.\d+)?$/;
      const keyReg = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
      const valReg = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
      const { dataType } = record;
      const searchProfiles = cloneDeep(searchProfile);
      let profile = searchProfiles[index];
      if (name === 'profileName') {
        // eslint-disable-next-line prefer-destructuring
        if (!keyReg.test(value)) {
          profile.keyErrMsg = displayNameRule64;
        }
        profile = {
          ...profile,
          ...configProfile.filter((item) => item.profileName === value)[0],
          profileValue: '',
        };
      }
      if (name === 'profileValue') {
        profile.valErrMsg = '';

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
      searchProfiles.splice(index, 1, profile);
      console.log(searchProfiles, '改变后的档案');
      setSearchProfile([...searchProfiles]);
    };

    // 删除档案
    const delProfile = (index: number) => {
      const searchProfiles = cloneDeep(searchProfile);
      searchProfiles.splice(index, 1);
      setSearchProfile(searchProfiles);
    };

    // 档案搜索条件
    const profileContent = (
      <div className="search-tag-container">
        <div className="mb-10">
          档案
          {/* <span className="tips">（提示：当Value值不输入时，默认为全部）</span> */}
        </div>
        <div className="list">
          {searchProfile.length > 0 &&
            searchProfile.map((item, index) => (
              <div className="item" key={item.id}>
                <Select
                  showSearch
                  placeholder="请选择档案Key"
                  value={item.profileName || undefined}
                  optionFilterProp="children"
                  filterOption={(inputValue: string, option: any) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) >= 0
                  }
                  onChange={(val: string) =>
                    handleProfilesChange(index, 'profileName', val, item)
                  }
                >
                  {configProfile.map((profileItem) => (
                    <Option
                      value={profileItem.profileName}
                      key={profileItem.profileCode}
                    >
                      {profileItem.profileName}
                    </Option>
                  ))}
                </Select>
                {item.dataType === 5 ? (
                  <>
                    {item.profileCode === 'pd_area' ? (
                      <ProfileDictSelect
                        onChange={(val: string) =>
                          handleProfilesChange(index, 'profileValue', val, item)
                        }
                      />
                    ) : (
                      <Select
                        showSearch
                        placeholder="请选择档案Value"
                        value={item.profileValue}
                        onChange={(val: string) =>
                          handleProfilesChange(index, 'profileValue', val, item)
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
                  </>
                ) : (
                  <>
                    {item.dataType === 1 ? (
                      <Select
                        // style={{ width: '400px' }}
                        placeholder="请选择档案Value"
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
                        placeholder="请输入档案Value"
                        defaultValue={item.profileValue}
                        maxLength={64}
                        value={item.profileValue}
                        onChange={(event) =>
                          handleProfilesChange(
                            index,
                            'profileValue',
                            event,
                            item
                          )
                        }
                      />
                    )}
                  </>
                )}
                <div
                  title="删除"
                  className="del-btn-wrap"
                  onClick={() => delProfile(index)}
                >
                  <span className="del-btn">
                    <span className="icon-delete" />
                  </span>
                </div>
                {(item.valErrMsg || item.keyErrMsg) && (
                  <div className="err-msg">
                    <i className="icon-error" />
                    {item.valErrMsg || item.keyErrMsg}
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className="mt-10">
          <span
            className={`add-btn ${searchProfile.length > 4 ? 'disabled' : ''}`}
            onClick={addProfile}
          >
            <span className="icon-add-to" />
            添加条件
          </span>
        </div>
      </div>
    );

    // 搜索
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      let hasError = false;
      searchTag.forEach((item) => {
        item.valErrMsg = '';
        item.keyErrMsg = '';
        if (item.key && !item.value.trim()) {
          item.valErrMsg = '标签值不能为空';
        }
        if (item.value && !item.key.trim()) {
          item.keyErrMsg = '标签名称不能为空';
        }
      });
      setSearchTag([...searchTag]);
      searchProfile.forEach((item) => {
        item.valErrMsg = '';
        item.keyErrMsg = '';
        if (
          item.profileName &&
          (!item.profileValue || !item.profileValue.trim())
        ) {
          item.valErrMsg = '档案Value不能为空';
        }
        if (item.profileValue && !item.profileName.trim()) {
          item.keyErrMsg = '档案Key不能为空';
        }
      });
      setSearchProfile([...searchProfile]);
      try {
        // 验证档案数据是否合法
        searchProfile.forEach((item) => {
          if (item.keyErrMsg || item.valErrMsg) {
            hasError = true;
            throw new Error();
          }
        });
        // 验证标签数据是否合法
        searchTag.forEach((item) => {
          if (item.keyErrMsg || item.valErrMsg) {
            hasError = true;
            throw new Error();
          }
        });
      } catch (error) {
        hasError = true;
      }
      if (hasError) return; // 不合法停止操作

      const paramTags: Tag[] = [];
      searchTag.forEach((item: Tag) => {
        const { key, value } = item;
        if (key || value) {
          paramTags.push({ key, value });
        }
      });
      const paramSearchProfile: ProfileConfig[] = [];
      searchProfile.forEach((item: ProfileConfig) => {
        const { profileName, profileValue } = item;
        if (profileName && profileValue) {
          paramSearchProfile.push(item);
        }
      });
      onSubmit({
        deviceTagsList: paramTags,
        globalProfiles: paramSearchProfile,
      });
    };

    // 重置
    const handleReset = () => {
      form.resetFields();
      setSearchProfile(initSearchProfile);
      setSearchTag(initTag);
    };

    // 导入配置档案
    const loadConfigProfile = async (thingTypeCode?: string) => {
      const loadProfileParam = { thingTypeCode };

      try {
        const profilesConfig = await loadProfile(loadProfileParam);
        // profilesConfig.forEach((item: ProfileConfig) => {
        //   item.id = item.id ? item.id : uniqueId('profile_');
        // });
        const $profilesConfig = profilesConfig || [];
        setConfigProfile($profilesConfig);
      } catch (error) {
        console.log(error);
        setConfigProfile([]);
      }
    };

    // 获取市信息
    const getAllCityInfo = async () => {
      const provinceName = '';
      try {
        const res = await getCityByProvinceName({
          provinceName,
        });
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
        setAreaOption([]);
        console.log(error);
      }
    };

    const { getFieldDecorator } = form;

    const count = expand ? 10 : 3;

    useEffect(() => {
      getAllCityInfo();
      loadConfigProfile();
    }, []);

    useEffect(() => {
      triggerEvent(window, 'resize');
    }, [expand, searchProfile.length, searchTag.length]);

    return (
      <Form className="IOT-advanced-search-form" onSubmit={handleSearch}>
        <Row gutter={24}>
          <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
            <Form.Item label="设备ID">
              {getFieldDecorator(`deviceId`)(<Input placeholder="设备ID" />)}
            </Form.Item>
          </Col>
          <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
            <Form.Item label="设备名称">
              {getFieldDecorator(`deviceName`)(
                <Input placeholder="设备名称" />
              )}
            </Form.Item>
          </Col>
          <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
            <Form.Item label="所属物类型">
              {getFieldDecorator(`thingTypeName`)(
                <Input placeholder="所属物类型" />
              )}
            </Form.Item>
          </Col>
          {/* <Col span={8} style={{ display: BELOW < count ? 'block' : 'none' }}>
            <Form.Item label="设备型号ID">
              {getFieldDecorator(`code`)(
                <Input placeholder="设备型号ID" />
              )}
            </Form.Item>
          </Col> */}
          <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
            <Form.Item label="设备状态">
              {getFieldDecorator(`status`, {
                initialValue: 999,
              })(
                <Select>
                  <Option value={999}>全部状态</Option>
                  {Object.keys(statusOption).map((k) => (
                    <Option value={parseInt(k, 10)} key={k}>
                      {
                        statusOption[
                          (k as unknown) as keyof typeof statusOption
                        ]
                      }
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
            <Form.Item label="节点类型">
              {getFieldDecorator(`nodeType`, {
                initialValue: 999,
              })(
                <Select>
                  <Option value={999}>全部节点类型</Option>

                  {nodeTypeConfig.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          {/* {['jichang'].includes(REGION as string) && ( */}
            <Col span={8} style={{ display: ABOVE < count ? 'block' : 'none' }}>
              <Form.Item label="设备物理ID">
                {getFieldDecorator(`uniqueId`)(
                  <Input placeholder="设备物理ID" />
                )}
              </Form.Item>
            </Col>
          {/* )} */}

          {/*<Col span={8} style={{ display: BELOW < count ? 'block' : 'none' }}>
            <Form.Item label={$t('城市')}>
              {getFieldDecorator('area')(
                <Select
                  showSearch
                  placeholder={$t('请选择城市')}
                  optionFilterProp="children"
                  filterOption={(inputValue: string, option: any) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) >= 0
                  }
                >
                  {areaOption.map(k => (
                    <Option
                      value={JSON.stringify({
                        areaCity: k.name,
                        areaCityCode: k.code,
                      })}
                      key={k.code}
                    >
                      {k.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>*/}
          <Col span={12} style={{ display: BELOW < count ? 'block' : 'none' }}>
            <div>{tagContent}</div>
          </Col>
          <Col span={12} style={{ display: BELOW < count ? 'block' : 'none' }}>
            <div>{profileContent}</div>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={handleReset}
            >
              清除
            </Button>
            <span
              style={{ marginLeft: 8, fontSize: 12 }}
              className="cursor-pointer primary-color"
              onClick={() => setExpand(!expand)}
            >
              <span>{expand ? '收起' : '展开'}</span>
              {expand ? (
                <span className="icon-upico" />
              ) : (
                <span className="icon-dowico" />
              )}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
);

export default Form.create<FormProps>({ name: 'advanced_search' })(
  AdvancedSearchForm
);
