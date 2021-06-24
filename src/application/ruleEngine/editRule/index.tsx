/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable react/no-array-index-key */
import { Button, Form, Input, Radio, Select, Tooltip, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import Header from 'components/Header';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Modal from 'components/Modal/index';
import Toast from 'components/SimpleToast/index';
import { cloneDeep, debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Prompt,
  useParams,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';

import { formatJson } from 'utils/format-json';

import {
  checkNameRepeat,
  editRule,
  getCustomFunc,
  getRuleInfo,
  getTopicList,
} from '../service/api';
import { EditRuleParams, FuncItem, RuleInfo, UserFuncItem } from '../types';
import './style.less';

const { TextArea } = Input;
const { Option } = Select;

interface EditRuleFormProps extends RouteComponentProps, FormComponentProps {
  // 设置编辑标记
  setFormDirty: (flag: boolean) => void;
}
function EditRuleFormContent(props: EditRuleFormProps) {
  const jcqSelectOptions = [
    {
      name: '全部无序',
      key: 'standard',
    },
    {
      name: '全部有序',
      key: 'fifo',
    },
  ];
  const { getFieldDecorator } = props.form;
  enum TargetTypeEnum {
    'MySQL' = 1000,
    'Kafka' = 1001,
    // 'RocketMQ' = 1002,
    'JCQ' = 1006,
  }

  const initRuleInfo: RuleInfo = {
    createdTime: '',
    dataSample: '',
    id: '',
    name: '',
    // qps: null,
    runState: 0,
    sqlStr: '',
    srcTopic: '',
    status: 'running',
    targetInfoTO: {},
    targetInfoVO: {},
    targetInfoTOStr: '',
    targetType: 'kafka',
    updateTime: '',
    // ownerSources: '',
  };
  const initFuncList: FuncItem[] = [];
  const { id } = useParams<{ id: string }>();
  const [ruleInfo, setRuleInfo] = useState<RuleInfo>(initRuleInfo);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isRun, setIsRun] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('新建规则');
  const [selectedTargetType, setTargetType] = useState<number>(1001);

  const [funcList, setFuncList] = useState<FuncItem[]>(initFuncList);
  const [isUserSet, setIsUserSet] = useState<boolean>(false);
  const [userFuncList, setUserFuncList] = useState<UserFuncItem[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const fetchRuleInfo = useCallback(() => {
    getRuleInfo({ ruleId: id })
      .then((res) => {
        if (res) {
          res.targetInfoTO = res.targetInfoTO || {};
          // res.targetType && setTargetType(res.targetType);
          setRuleInfo(res);
          setIsRun(res.runState === 1);
          setTitle(res.runState === 1 ? '查看规则' : '编辑规则');
          getCustomFunc()
            .then((data) => {
              if (data) {
                setFuncList(data);
                const udfsInfo = res.udfs && JSON.parse(res.udfs);
                if (Array.isArray(udfsInfo) && udfsInfo.length > 0) {
                  setIsUserSet(true);
                  udfsInfo.forEach((item: string) => {
                    const columnId = item.split('(')[0];
                    const column = data.filter(
                      (i: any) => i.id === columnId
                    )[0];
                    const sub_list = column.sub_list || [];
                    const subId = item.split(')')[0].split('(')[1];
                    const rename = item.split('as')[1].trim();
                    userFuncList.push({
                      id: columnId,
                      name: column.name,
                      desc: column.desc,
                      subId,
                      rename,
                      sub_list,
                    });
                  });
                  console.log(userFuncList);
                  setUserFuncList([...userFuncList]);
                }
              }
            })
            ['catch']((error) => {
              //
            });
        }
      })
      ['catch']((err) => {
        Toast('规则信息查询失败');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  // 拉渠归属渠道 地产中废弃这个接口
  // const fetchOwnerSources = async () => {
  //   try {
  //     const data = await getOwnerSources();
  //     data && setOwnerResources(data);
  //   } catch (error) {
  //     //
  //   }
  // };
  // 拉渠自定义函数列表
  const fetchCustomFunc = async () => {
    try {
      const data = await getCustomFunc();
      data && setFuncList(data);
    } catch (error) {
      // setFuncList([]);
    }
  };
  // 更改jcq消息类型下拉
  const jcqSelectChange = async (value: any) => {
    console.log('jcqSelectChange');
    // ruleInfo.targetInfoTO.queueType = value;
  };

  useEffect(() => {
    if (id === 'null') {
      setIsNew(true);
      setTitle('新建规则');
      // fetchOwnerSources();
      setIsRun(false);
    } else {
      setIsNew(false);
      setTitle('编辑规则');
      fetchRuleInfo();
      // fetchOwnerSources();
    }
  }, [fetchRuleInfo, id]);
  // 校验规则名称是否重复
  const checkName = debounce((rule: any, value: any, callback: any) => {
    if (id === 'null' && !!value) {
      checkNameRepeat({ ruleName: value })
        .then((res: any) => {
          console.log(res);
          callback();
        })
        ['catch']((error: any) => {
          if (error && error.code == '202') {
            callback('规则名称重复');
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  }, 500);
  /**
   * @description: 判断字符串是否是JSON
   * @param {type}
   * @return:
   */
  function checkJson(rule: any, value: any, callback: any) {
    if (typeof value == 'string') {
      try {
        const obj = JSON.parse(value);
        if (typeof obj == 'object' && obj) {
          callback();
        } else {
          callback('您输入的json不合法');
        }
      } catch (e) {
        callback('您输入的json不合法');
      }
    }
  }
  // 类型变化
  const targetTypeChange = (e: RadioChangeEvent) => {
    setTargetType(e.target.value);
  };
  // 选择用户自定义设置
  const userSetChange = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setIsUserSet(value);
    if (value) {
      fetchCustomFunc();
      if (userFuncList.length === 0) {
        userFuncList.push({
          id: '',
          name: '',
          desc: '请选择扩展列，查看使用帮助',
          sub_list: [],
          subId: '',
          rename: '',
        });
      }
      setUserFuncList([...userFuncList]);
    } else {
      setVisible(true);
    }
  };
  // 删除自定义方法
  const doDelCustomFunc = () => {
    setIsUserSet(false);
    setVisible(false);
    setUserFuncList([]);
  };
  // 关闭弹出层
  const closeModal = () => {
    setIsUserSet(true);
    setVisible(false);
  };
  // 选择列
  const handleColumnChange = (value: SelectValue, index: number) => {
    const selectedColumn: UserFuncItem = cloneDeep(
      funcList.filter((item) => item.id === value).slice()[0]
    );
    userFuncList.splice(index, 1, selectedColumn);
    setUserFuncList([...userFuncList]);
  };
  // 选择设备
  const handleSubListChange = (value: SelectValue, index: number) => {
    const curUserFunc = userFuncList[index];
    curUserFunc.subId = value as string;
    curUserFunc.subIdErr = '';
    userFuncList.splice(index, 1, curUserFunc);
    setUserFuncList([...userFuncList]);
  };
  // 自定义函数输入框
  const handleSubInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const curUserFunc = userFuncList[index];
    const subIdReg = /^[a-zA-Z0-9\-_,，.]{0,255}$/;
    const renameReg = /^[a-z]([a-zA-Z0-9\-_]*){0,30}$/;
    curUserFunc[name as 'subId' | 'rename'] = value;
    curUserFunc[`${name}Err`] = '';
    if (name === 'subId' && !subIdReg.test(value)) {
      curUserFunc[`${name}Err`] =
        '仅支持255字符内的英文、数字、下划线（_）、连字符（-）、点（.）和逗号（，或,）';
    }
    if (name === 'rename' && !renameReg.test(value)) {
      curUserFunc[`${name}Err`] =
        '仅支持30字符内的英文、数字、下划线（_）、连字符（-）,且必须以英文开头';
    }
    // 重复性校验
    userFuncList.forEach((item, idx) => {
      if (name === 'rename' && index !== idx && item.rename === value) {
        curUserFunc[`${name}Err`] = '重命名不能重复';
      }
    });
    userFuncList.splice(index, 1, curUserFunc);
    setUserFuncList([...userFuncList]);
  };

  // 添加一行自定义函数
  const addUserFunc = () => {
    userFuncList.push({
      id: '',
      name: '',
      desc: '请选择扩展列，查看使用帮助',
      sub_list: [],
      subId: '',
      rename: '',
    });
    setUserFuncList([...userFuncList]);
  };
  // 删除一行自定义函数
  const delUserFunc = (index: number) => {
    userFuncList.splice(index, 1);
    if (userFuncList.length === 0) {
      setIsUserSet(false);
    }
    setUserFuncList([...userFuncList]);
  };

  // 保存规则
  const submitRuleInfo = async (params: EditRuleParams) => {
    const url = isNew ? 'v2/rule/create' : 'v2/rule/update';
    try {
      const res = await editRule(url, params);
      if (res && res.code === '200') {
        props.setFormDirty(false);
        props.history.push('/rule/list');
        Toast('保存成功');
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let hasErr = false;
    userFuncList.forEach((item) => {
      if (item.subIdErr || item.renameErr || item.idErr) {
        hasErr = true;
      }
      if (!item.id && !item.subId && !item.rename) {
        item.idErr = '函数名没有填写';
        item.subIdErr = '条件没有填写';
        item.renameErr = '重命名名字没有填写';
        hasErr = true;
      }
      if (item.id && (!item.subId || !item.rename)) {
        if (!item.subId) {
          console.log('111');
          item.subIdErr = '条件没有填写';
        }
        if (!item.rename) {
          console.log('222');
          item.renameErr = '重命名名字没有填写';
        }
        hasErr = true;
      }
      if (item.subId && (!item.id || !item.rename)) {
        if (!item.id) {
          item.idErr = '函数名没有填写';
        }
        if (!item.rename) {
          item.renameErr = '重命名名字没有填写';
        }
        hasErr = true;
      }
      if (item.rename && (!item.id || !item.subId)) {
        if (!item.id) {
          item.idErr = '函数名没有填写';
        }
        if (!item.subId) {
          item.subIdErr = '条件没有填写';
        }
        hasErr = true;
      }
    });
    setUserFuncList([...userFuncList]);
    console.log(hasErr);
    if (hasErr) return;
    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values, 'values---');
        const targetInfoTO: Record<string, any> = {};
        const targetParams = [
          'targetName',
          'url',
          'topic',
          'dbName',
          'tableName',
          'username',
          'password',
          'columnName',
          'batchSize',
          'groupId',
          'host',
          'topic',
          'secretAccessKey',
          'queueType',
          'accessKey',
          'secretKey',
          'tenantId',
          'projectId',
          'appId',
        ];
        // 获取用户自定义数据
        const udfs: string[] = [];
        if (userFuncList.length) {
          userFuncList.forEach((item) => {
            udfs.push(`${item.id}(${item.subId}) as ${item.rename}`);
          });
        }
        // 获取数据转发的数据
        Object.keys(values).forEach((key) => {
          if (targetParams.includes(key)) {
            if (key === 'targetName') {
              targetInfoTO.name = values[key];
            } else {
              targetInfoTO[key] = values[key];
            }
          }
        });
        const {
          name,
          srcTopic,
          sqlStr,
          // qps,
          dataSample,
          targetType,
          deviceMetaIds,
          // ownerSources,
        } = values;
        const params = {
          id: id === 'null' ? '' : id,
          name,
          // ownerSources,
          srcTopic: '$iot/v1/edge/1/things/shadow/post',
          deviceMetaIds,
          sqlStr,
          udfs: JSON.stringify(udfs),
          qps: 1,
          dataSample,
          targetType,
          targetInfoTOStr: JSON.stringify(targetInfoTO),
        };
        // console.log(targetInfoTO);
        submitRuleInfo(params);
      }
    });
  };
  return (
    <>
      <Header back to="/rule/list" title={title} />
      <div className="rule-wrap">
        <ObtainHeight bgColor={isNew ? '#fff' : ''}>
          <Form
            className="basic-info-form"
            colon={false}
            layout="inline"
            onSubmit={handleSubmit}
          >
            <h3>基本信息</h3>
            {getFieldDecorator('id', {
              initialValue: ruleInfo.id,
            })(<Input type="hidden" />)}
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="规则名称">
                  {getFieldDecorator('name', {
                    rules: [
                      { required: true, message: '请输入规则名称' },
                      {
                        pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_]{2,30}$/,
                        message:
                          '请输入2-30个字符，支持中文、英文、数字、下划线（_）和连字符（-）',
                      },
                      { validator: checkName },
                    ],
                    initialValue: ruleInfo.name,
                    validateTrigger: 'onBlur',
                  })(
                    <Input
                      maxLength={30}
                      disabled={isRun}
                      placeholder="请输入2-30个字符，支持中文、英文、数字、下划线（_）和连字符（-）"
                    />
                  )}
                </Form.Item>
                <Tooltip title="支持2-30个字符内的中文、英文、数字、下划线（_）和连字符（-）">
                  <div className="primary-color rule">查看规则</div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Form.Item label="物类型编码">
                  {getFieldDecorator('deviceMetaIds', {
                    initialValue: ruleInfo.deviceMetaIds,
                  })(
                    <TextArea
                      placeholder="请输入物类型编码，多个用逗号分隔"
                      disabled={isRun}
                      rows={1}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/*
            <Form.Item label="归属渠道">
                      {getFieldDecorator('ownerSources', {
                        initialValue: ruleInfo.ownerSources,
                      })(
                        <Select
                          className="basic-select"
                          disabled={isRun}
                          placeholder="请选择归属渠道"
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
                          <Option value="" key="不限">
                            不限
                          </Option>
                          {ownerResources &&
                            Object.keys(ownerResources).map(k => (
                              <Option value={k} key={ownerResources[k]}>
                                {ownerResources[k]}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </Form.Item> */}
            {/* <Row className="basic-form-row"> */}
            {/* <Col span={12}>
                <Form.Item label="MQTT Topic">
                  {getFieldDecorator('srcTopic', {
                    rules: [
                      {
                        required: true,
                        message: '请输入设备上报的MQTT的Topic，支持通配符',
                      },
                    ],
                    initialValue: ruleInfo.srcTopic,
                  })(
                    <Input
                      placeholder="请输入设备上报的MQTT的Topic，支持通配符"
                      disabled={isRun}
                    />
                  )}
                </Form.Item>
              </Col> */}
            {/* <Col span={12}>
                <Form.Item label="qps">
                  {getFieldDecorator('qps', {
                    rules: [
                      {
                        required: true,
                        message: '请输入每秒发送消息的最大数值',
                      },
                      { pattern: /^[1-9]\d*$/, message: '仅支持正整数' },
                    ],
                    initialValue: ruleInfo.qps,
                  })(
                    <Input
                      placeholder="请输入每秒发送消息的最大数值"
                      disabled={isRun}
                    />
                  )}
                </Form.Item>
              </Col> */}
            {/* </Row> */}
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="SQL语句">
                  {getFieldDecorator('sqlStr', {
                    rules: [
                      {
                        required: true,
                        message:
                          '请输入类SQL语句，例如：select devicenName, voltage from topic where voltage>220',
                      },
                    ],
                    initialValue: formatJson(ruleInfo.sqlStr),
                    validateTrigger: 'onBlur',
                  })(
                    <TextArea
                      placeholder="请输入类SQL语句，例如：select devicenName, voltage from topic where voltage>220"
                      rows={2}
                      disabled={isRun}
                    />
                  )}
                </Form.Item>

                <Tooltip
                  title={
                    <ul>
                      目前仅支持以下几种格式：
                      <li>1. SELECT * FROM Orders</li>
                      <li>2. SELECT a, c AS d FROM Orders</li>
                      <li>3. SELECT * FROM Orders WHERE b = &apos;red&apos;</li>
                      <li>4. SELECT * FROM Orders WHERE a&gt; 0 </li>
                    </ul>
                  }
                >
                  <div className="primary-color rule">使用帮助</div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Form.Item label="设备上报数据">
                  {getFieldDecorator('dataSample', {
                    rules: [
                      {
                        required: true,
                        message: '请输入设备上报数据结构的例子,json字符串',
                      },
                      { validator: checkJson },
                    ],
                    initialValue: formatJson(ruleInfo.dataSample),
                  })(
                    <TextArea
                      placeholder="设备上报数据结构的例子,json字符串"
                      rows={2}
                      disabled={isRun}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="用户自定义设置">
                  <Radio.Group
                    onChange={userSetChange}
                    value={isUserSet}
                    disabled={isRun}
                  >
                    <Radio value>是</Radio>
                    <Radio value={false}>否</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            {isUserSet && (
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item label="函数定义">
                    {userFuncList.map((item, index: number) => (
                      <div className="func-item" key={item.id + index}>
                        <div className="column-input">
                          <Select
                            className="basic-select basic-select-s"
                            disabled={isRun}
                            placeholder="请选择函数"
                            defaultValue={item.id}
                            onChange={(value: SelectValue) =>
                              handleColumnChange(value, index)
                            }
                            getPopupContainer={(triggerNode: HTMLElement) =>
                              triggerNode.parentNode as HTMLElement
                            }
                          >
                            {Array.isArray(funcList) &&
                              funcList.map((func) => (
                                <Option key={func.id} value={func.id}>
                                  {func.name}
                                </Option>
                              ))}
                          </Select>
                          {item.idErr && (
                            <div className="err-msg">
                              <i className="icon-error" />
                              {item.idErr}
                            </div>
                          )}
                        </div>
                        <div className="column-input subId">
                          {Array.isArray(item.sub_list) &&
                          item.sub_list.length > 0 ? (
                            <Select
                              className="basic-select basic-select-s"
                              disabled={isRun}
                              placeholder="请选择条件"
                              defaultValue={item.subId}
                              onChange={(value: SelectValue) =>
                                handleSubListChange(value, index)
                              }
                              getPopupContainer={(triggerNode: HTMLElement) =>
                                triggerNode.parentNode as HTMLElement
                              }
                            >
                              {item.sub_list.map((sub: FuncItem) => (
                                <Option key={sub.id} value={sub.id}>
                                  {sub.name}
                                </Option>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              name="subId"
                              className="basic-inp-s"
                              disabled={isRun}
                              defaultValue={item.subId}
                              maxLength={255}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => handleSubInputChange(event, index)}
                            />
                          )}
                          <Tooltip title={item.desc}>
                            <span className="icon-help column-help" />
                          </Tooltip>
                          {item.subIdErr && (
                            <div className="err-msg">
                              <i className="icon-error" />
                              {item.subIdErr}
                            </div>
                          )}
                        </div>
                        <div className="rename-input">
                          <Input
                            name="rename"
                            className="basic-inp-s"
                            placeholder="重命名"
                            maxLength={30}
                            disabled={isRun}
                            defaultValue={item.rename}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => handleSubInputChange(event, index)}
                          />
                          {item.renameErr && (
                            <div className="err-msg">
                              <i className="icon-error" />
                              {item.renameErr}
                            </div>
                          )}
                        </div>
                        {!isRun && (
                          <span
                            className="del-func"
                            onClick={() => delUserFunc(index)}
                          >
                            <span className="icon-delete" />
                          </span>
                        )}

                        {index === userFuncList.length - 1 && !isRun && (
                          <div className="add-func">
                            <Button
                              type="link"
                              disabled={isRun}
                              onClick={addUserFunc}
                            >
                              + 添加
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </Form.Item>
                </Col>
              </Row>
            )}

            <div className="basic-info-con">
              <h3>数据转发</h3>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item label="类型">
                    {getFieldDecorator('targetType', {
                      rules: [{ required: true, message: '请输入类型名称' }],
                      initialValue: ruleInfo.targetType,
                    })(
                      <Radio.Group
                        onChange={targetTypeChange}
                        disabled={!isNew}
                      >
                        <Radio value={1001}>Kafka</Radio>
                        <Radio value={1000}>MySQL</Radio>
                        {/* <Radio value={1002}>RocketMQ</Radio> */}
                        <Radio value={1006}>JCQ</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              {selectedTargetType === TargetTypeEnum.Kafka && (
                <>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="名称">
                        {getFieldDecorator('targetName', {
                          rules: [
                            { required: true, message: '请输入类型名称' },
                          ],
                          initialValue: ruleInfo.targetInfoTO.name,
                        })(
                          <Input
                            placeholder="请输入类型名称"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="地址">
                        {getFieldDecorator('url', {
                          rules: [
                            { required: true, message: '请输入类型地址' },
                            {
                              pattern: /^((https|http):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
                              message:
                                '您填写的 URL 地址有误，需是合法 URL 地址，请重新填写',
                            },
                          ],
                          initialValue: ruleInfo.targetInfoTO.url,
                        })(
                          <Input
                            placeholder="请输入类型地址"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="Topic">
                        {getFieldDecorator('topic', {
                          rules: [{ required: true, message: '请输入Topic' }],
                          initialValue: ruleInfo.targetInfoTO.topic,
                        })(
                          <Input placeholder="请输入Topic" disabled={isRun} />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
              {selectedTargetType === TargetTypeEnum.MySQL && (
                <>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="名称">
                        {getFieldDecorator('targetName', {
                          rules: [
                            { required: true, message: '请输入类型名称' },
                          ],
                          initialValue: ruleInfo.targetInfoTO.name,
                        })(
                          <Input
                            placeholder="请输入类型名称"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="地址">
                        {getFieldDecorator('url', {
                          rules: [
                            { required: true, message: '请输入类型地址' },
                            {
                              pattern: /^((https|http):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
                              message:
                                '您填写的 URL 地址有误，需是合法 URL 地址，请重新填写',
                            },
                          ],
                          initialValue: ruleInfo.targetInfoTO.url,
                        })(
                          <Input
                            placeholder="请输入类型地址"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="库名">
                      {getFieldDecorator('dbName', {
                        rules: [
                          { required: true, message: '请输入数据库名字' },
                        ],
                        initialValue: ruleInfo.targetInfoTO.dbName,
                      })(
                        <Input
                          placeholder="请输入数据库名字"
                          disabled={isRun}
                        />
                      )}
                    </Form.Item>
                    <Form.Item label="表名">
                      {getFieldDecorator('tableName', {
                        rules: [
                          { required: true, message: '请输入数据库表名' },
                        ],
                        initialValue: ruleInfo.targetInfoTO.tableName,
                      })(
                        <Input
                          placeholder="请输入数据库表名"
                          disabled={isRun}
                        />
                      )}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="列名">
                      {getFieldDecorator('columnName', {
                        rules: [{ required: true, message: '请输入列名' }],
                        initialValue: ruleInfo.targetInfoTO.columnName,
                      })(<Input placeholder="请输入列名" disabled={isRun} />)}
                    </Form.Item>
                    <Form.Item
                      label={
                        <span>
                          批量
                          <Tooltip title="数据入库阈值">
                            <span className="icon-help primary-color" />
                          </Tooltip>
                        </span>
                      }
                    >
                      {getFieldDecorator('batchSize', {
                        rules: [
                          { required: true, message: '请输入数字' },
                          {
                            pattern: /^\d+$/,
                            message: '请输入数字',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.batchSize,
                      })(<Input placeholder="请输入批量" disabled={isRun} />)}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="账号">
                      {getFieldDecorator('username', {
                        rules: [{ required: true, message: '请输入账号' }],
                        initialValue: ruleInfo.targetInfoTO.username,
                      })(
                        <Input
                          placeholder="请输入账号"
                          disabled={isRun}
                          autoComplete=""
                        />
                      )}
                    </Form.Item>
                    <Form.Item label="密码">
                      {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码' }],
                        initialValue: ruleInfo.targetInfoTO.password,
                      })(
                        <Input
                          type="password"
                          placeholder="请输入密码"
                          disabled={isRun}
                          autoComplete=""
                        />
                      )}
                    </Form.Item>
                  </Row>
                </>
              )}

              {/* {selectedTargetType === TargetTypeEnum.RocketMQ && (
                <>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="名称">
                        {getFieldDecorator('targetName', {
                          rules: [
                            { required: true, message: '请输入类型名称' },
                          ],
                          initialValue: ruleInfo.targetInfoTO.name,
                        })(
                          <Input
                            placeholder="请输入类型名称"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="地址">
                        {getFieldDecorator('url', {
                          rules: [
                            { required: true, message: '请输入类型地址' },
                            {
                              pattern: /^((https|http):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
                              message:
                                '您填写的 URL 地址有误，需是合法 URL 地址，请重新填写',
                            },
                          ],
                          initialValue: ruleInfo.targetInfoTO.url,
                        })(
                          <Input
                            placeholder="请输入类型地址"
                            disabled={isRun}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="accessKey">
                      {getFieldDecorator('accessKey', {
                        rules: [
                          { required: true, message: '请输入accessKey' },
                          {
                            pattern: /^[a-zA-Z0-9]+$/,
                            message: '仅支持64个字符内的英文字母、数字',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.accessKey,
                      })(
                        <Input
                          placeholder="请输入accessKey"
                          disabled={isRun}
                          maxLength={64}
                        />
                      )}
                    </Form.Item>

                    <Form.Item label="secretKey">
                      {getFieldDecorator('secretKey', {
                        rules: [
                          { required: true, message: '请输入secretKey' },
                          {
                            pattern: /^[a-zA-Z0-9]+$/,
                            message: '仅支持64个字符内的英文字母、数字',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.secretKey,
                      })(
                        <Input
                          placeholder="请输入secretKey"
                          disabled={isRun}
                          maxLength={64}
                        />
                      )}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="groupId">
                      {getFieldDecorator('groupId', {
                        rules: [
                          { required: true, message: '请输入groupId' },
                          {
                            pattern: /^[a-zA-Z]+[a-zA-Z0-9_]*$/,
                            message:
                              '仅支持20个字符内的英文字母、数字，且只能以英文字母开头',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.groupId,
                      })(
                        <Input
                          placeholder="请输入groupId"
                          disabled={isRun}
                          maxLength={20}
                        />
                      )}
                    </Form.Item>

                    <Form.Item label="Topic">
                      {getFieldDecorator('topic', {
                        rules: [{ required: true, message: '请输入Topic' }],
                        initialValue: ruleInfo.targetInfoTO.topic,
                      })(<Input placeholder="请输入Topic" disabled={isRun} />)}
                    </Form.Item>
                  </Row>
                </>
              )} */}
              {selectedTargetType === TargetTypeEnum.JCQ && (
                <>
                  <Row className="basic-form-row">
                    <Form.Item label="地址">
                      {getFieldDecorator('url', {
                        rules: [
                          { required: true, message: '请输入类型地址' },
                          {
                            pattern: /^((https|http):\/\/)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
                            message:
                              '您填写的 URL 地址有误，需是合法 URL 地址，请重新填写',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.url,
                      })(
                        <Input placeholder="请输入类型地址" disabled={isRun} />
                      )}
                    </Form.Item>
                    <Form.Item label="Topic">
                      {getFieldDecorator('topic', {
                        rules: [{ required: true, message: '请输入Topic' }],
                        initialValue: ruleInfo.targetInfoTO.topic,
                      })(<Input placeholder="请输入Topic" disabled={isRun} />)}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="accessKey">
                      {getFieldDecorator('accessKey', {
                        rules: [
                          { required: true, message: '请输入accessKey' },
                          {
                            pattern: /^[a-zA-Z0-9]+$/,
                            message: '仅支持64个字符内的英文字母、数字',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.accessKey,
                      })(
                        <Input
                          placeholder="请输入accessKey"
                          disabled={isRun}
                          maxLength={64}
                        />
                      )}
                    </Form.Item>

                    <Form.Item label="secretKey">
                      {getFieldDecorator('secretKey', {
                        rules: [
                          { required: true, message: '请输入secretKey' },
                          {
                            pattern: /^[a-zA-Z0-9]+$/,
                            message: '仅支持64个字符内的英文字母、数字',
                          },
                        ],
                        initialValue: ruleInfo.targetInfoTO.secretKey,
                      })(
                        <Input
                          placeholder="请输入secretKey"
                          disabled={isRun}
                          maxLength={64}
                        />
                      )}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="消息类型">
                        {getFieldDecorator('queueType', {
                          initialValue:
                            ruleInfo.targetInfoTO.queueType || 'standard',
                        })(
                          <Select
                            disabled={isRun}
                            placeholder="请选择消息类型"
                            onChange={jcqSelectChange}
                          >
                            {jcqSelectOptions.map((item, idx) => (
                              <Option key={item.key} value={item.key}>
                                {item.name}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
            </div>
            <Form.Item className="btn-box">
              <Button type="primary" htmlType="submit" disabled={isRun}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </ObtainHeight>
      </div>
      {/* 删除自定义设置确认--start */}
      <Modal
        title="提示"
        visible={visible}
        onCancel={closeModal}
        onOk={doDelCustomFunc}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>自定义设置后不可恢复，您确定要删除吗?</p>
      </Modal>
      {/* 删除规则确认--end */}
    </>
  );
}

const EditRuleForm = withRouter(
  Form.create<EditRuleFormProps>({
    onValuesChange: (props) => {
      props.setFormDirty(true);
    },
  })(EditRuleFormContent)
);

const EditRule = (props: any) => {
  const [formDirty, setFormDirty] = useState<boolean>(false);
  return (
    <>
      <Prompt when={formDirty} message="" />
      <EditRuleForm setFormDirty={setFormDirty} />
    </>
  );
};

export default EditRule;
