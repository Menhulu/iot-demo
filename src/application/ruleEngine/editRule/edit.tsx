/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable react/no-array-index-key */
import { Button, Form, Input, Radio, Select, Tooltip, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/es/form';

import Header from 'components/Header';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import TextArea from 'components/TextArea';
import Toast from 'components/SimpleToast/index';

import React, { useCallback, useEffect, useState } from 'react';
import { Prompt, useParams, useHistory } from 'react-router-dom';

import { formatJson } from 'utils/format-json';

import {
  checkNameRepeat,
  editRule,
  getRuleInfo,
  getTopicList,
  validateSql,
} from '../service/api';
import { EditRuleParams, RuleInfo } from '../types';
import './style.less';

const { Option } = Select;

interface EditRuleFormProps extends FormComponentProps {
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
  const { getFieldDecorator, getFieldValue } = props.form;

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
    targetInfoVO: {},
    targetInfoVOStr: '',
    targetType: 'kafka',
    updateTime: '',
    // ownerSources: '',
  };
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [ruleInfo, setRuleInfo] = useState<RuleInfo>(initRuleInfo);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isRun, setIsRun] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('新建规则');

  const [topicData, setTopicData] = useState<Record<string, string>>({});
  const fetchRuleInfo = useCallback(() => {
    getRuleInfo({ ruleId: id })
      .then((res) => {
        if (res) {
          res.targetInfoVO = res.targetInfoVO || {};

          setRuleInfo(res);
          setIsRun(res.status === 'running');
          setTitle(res.status === 'running' ? '查看规则' : '编辑规则');
        }
      })
      ['catch']((err) => {
        Toast('规则信息查询失败');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 更改jcq消息类型下拉
  const jcqSelectChange = async (value: any) => {
    console.log('jcqSelectChange');
    // ruleInfo.targetInfoVO.queueType = value;
  };
  // 获取srcTopic列表
  useEffect(() => {
    getTopicList()
      .then((res) => {
        if (res.code === '200') {
          setTopicData(res.data);
        } else {
          setTopicData({});
        }
      })
      .catch((error) => {});
  }, []);
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
  const checkName = (rule: any, value: any, callback: any) => {
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
  };
  // 校验SQL语句
  const checkSql = (rule: any, value: any, callback: any) => {
    if (id === 'null' && !!value) {
      validateSql({ sqlStr: value })
        .then((res: any) => {
          console.log(res);
          callback();
        })
        ['catch']((error: any) => {
          if (error && error.code == '202') {
            callback('sql语句不符合规范');
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  };
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

  // 保存规则
  const submitRuleInfo = async (params: EditRuleParams) => {
    const url = isNew ? 'v1/ruleengine/create' : 'v1/ruleengine/update';
    try {
      const res = await editRule(url, params);
      if (res && res.code === '200') {
        props.setFormDirty(false);
        history.push('/rule/list');
        Toast('保存成功');
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values, 'values---');
        const targetInfoVO: Record<string, any> = {};
        const targetParams = [
          'targetName',
          'server',
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

        // 获取数据转发的数据
        Object.keys(values).forEach((key) => {
          if (targetParams.includes(key)) {
            if (key === 'targetName') {
              targetInfoVO.name = values[key];
            } else {
              targetInfoVO[key] = values[key];
            }
          }
        });
        const {
          id,
          name,
          srcTopic,
          sqlStr,
          targetType,
          thingTypeCodes,
          description,
        } = values;
        const params = {
          id: id === 'null' ? '' : id,
          name,
          srcTopic,
          thingTypeCodes,
          sqlStr,
          description,
          targetType,
          targetInfoVOStr: JSON.stringify(targetInfoVO),
        };
        // console.log(targetInfoVO);
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
                <Form.Item label="topic类型">
                  {getFieldDecorator('srcTopic', {
                    rules: [
                      {
                        required: true,
                        message: '请选择topic类型',
                      },
                    ],
                    initialValue: ruleInfo.srcTopic,
                  })(
                    <Select placeholder="请选择topic类型" disabled={isRun}>
                      {Object.keys(topicData).map((key) => (
                        <Option key={key} value={key}>
                          {topicData[key]}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="SQL语句">
                  {getFieldDecorator('sqlStr', {
                    rules: [
                      {
                        required: true,
                        message:
                          '请输入类SQL语句，例如：select deviceName, voltage from topic where voltage>220',
                      },
                      { validator: checkSql },
                    ],
                    initialValue: formatJson(ruleInfo.sqlStr),
                    validateTrigger: 'onBlur',
                  })(
                    <TextArea
                      placeholder="请输入类SQL语句，例如：select deviceName, voltage from topic where voltage>220"
                      disabled={isRun}
                    />
                  )}
                </Form.Item>

                <Tooltip
                  title={
                    <ul>
                      目前仅支持以下几种格式：
                      <li>1. select * from temp</li>
                      <li>2. 包含SQL关键字</li>
                      <li>
                        select * from temp where "timestamp" &gt; 1604581585
                      </li>
                      <li>3. select deviceId as did from temp</li>
                      <li>
                        4.
                        目前支持将deviceId，thingTypeCode，deviceName，sn，uniqueId五种信息添加到设备消息里对外发送，扩展字段须以$开头
                      </li>
                      <li>select $deviceName ,$thingTypeCode from temp </li>
                      <li>
                        5. select * from temp where deviceId &lt;&gt;
                        1010631002e0500
                      </li>
                      <li>
                        6. select * from temp where deviceId like '%101063100%'
                      </li>
                      <li>7. 字段名包含小数点</li>
                      <li>
                        select * from temp where "properties['battery.voltage']"
                        = 10
                      </li>
                      <li>8. 数组</li>
                      <li>
                        select * from temp where events[0].key =
                        'connection_agent.online'
                      </li>
                    </ul>
                  }
                >
                  <div className="primary-color rule">使用帮助</div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Form.Item label="物类型编码">
                  {getFieldDecorator('thingTypeCodes', {
                    initialValue: ruleInfo.thingTypeCodes,
                  })(
                    <TextArea
                      placeholder="请输入物类型编码，多个用逗号分隔"
                      disabled={isRun}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="规则描述">
                  {getFieldDecorator('description', {
                    initialValue: ruleInfo.description,
                  })(
                    <TextArea placeholder="请输入规则描述" disabled={isRun} />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <div className="basic-info-con">
              <h3>数据转发</h3>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item label="类型">
                    {getFieldDecorator('targetType', {
                      rules: [{ required: true, message: '请输入类型名称' }],
                      initialValue: ruleInfo.targetType,
                    })(
                      <Radio.Group disabled={!isNew}>
                        <Radio value="kafka">Kafka</Radio>
                        <Radio value="mysql">MySQL</Radio>
                        {/* <Radio value={1002}>RocketMQ</Radio> */}
                        <Radio value="jcq">JCQ</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              {getFieldValue('targetType') === 'kafka' && (
                <Row className="basic-form-row">
                  <Col span={12}>
                    <Form.Item label="Server">
                      {getFieldDecorator('server', {
                        initialValue: ruleInfo.targetInfoVO.server,
                      })(
                        <Input
                          placeholder="请输入kafkaServer"
                          disabled={isRun}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Topic">
                      {getFieldDecorator('topic', {
                        rules: [
                          { required: true, message: '请输入kafkaTopic' },
                        ],
                        initialValue: ruleInfo.targetInfoVO.topic,
                      })(<Input placeholder="请输入Topic" disabled={isRun} />)}
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {getFieldValue('targetType') === 'mysql' && (
                <>
                  <Row className="basic-form-row">
                    <Col span={12}>
                      <Form.Item label="数据库名">
                        {getFieldDecorator('dbName', {
                          rules: [
                            { required: true, message: '请输入数据库名字' },
                          ],
                          initialValue: ruleInfo.targetInfoVO.dbName,
                        })(
                          <Input
                            placeholder="请输入数据库名字"
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
                          initialValue: ruleInfo.targetInfoVO.url,
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
                    <Form.Item label="表名">
                      {getFieldDecorator('tableName', {
                        rules: [
                          { required: true, message: '请输入数据库表名' },
                        ],
                        initialValue: ruleInfo.targetInfoVO.tableName,
                      })(
                        <Input
                          placeholder="请输入数据库表名"
                          disabled={isRun}
                        />
                      )}
                    </Form.Item>
                    <Form.Item label="列名">
                      {getFieldDecorator('columnName', {
                        rules: [{ required: true, message: '请输入列名' }],
                        initialValue: ruleInfo.targetInfoVO.columnName,
                      })(<Input placeholder="请输入列名" disabled={isRun} />)}
                    </Form.Item>
                  </Row>
                  <Row className="basic-form-row">
                    <Form.Item label="账号">
                      {getFieldDecorator('username', {
                        rules: [{ required: true, message: '请输入账号' }],
                        initialValue: ruleInfo.targetInfoVO.username,
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
                        initialValue: ruleInfo.targetInfoVO.password,
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
                  <Row className="basic-form-row">
                    <Col span={12}>
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
                          initialValue: ruleInfo.targetInfoVO.batchSize,
                        })(<Input placeholder="请输入批量" disabled={isRun} />)}
                      </Form.Item>
                    </Col>
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
                          initialValue: ruleInfo.targetInfoVO.name,
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
                          initialValue: ruleInfo.targetInfoVO.url,
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
                        initialValue: ruleInfo.targetInfoVO.accessKey,
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
                        initialValue: ruleInfo.targetInfoVO.secretKey,
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
                        initialValue: ruleInfo.targetInfoVO.groupId,
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
                        initialValue: ruleInfo.targetInfoVO.topic,
                      })(<Input placeholder="请输入Topic" disabled={isRun} />)}
                    </Form.Item>
                  </Row>
                </>
              )} */}
              {getFieldValue('targetType') === 'jcq' && (
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
                        initialValue: ruleInfo.targetInfoVO.url,
                      })(
                        <Input placeholder="请输入类型地址" disabled={isRun} />
                      )}
                    </Form.Item>
                    <Form.Item label="Topic">
                      {getFieldDecorator('topic', {
                        rules: [{ required: true, message: '请输入Topic' }],
                        initialValue: ruleInfo.targetInfoVO.topic,
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
                        initialValue: ruleInfo.targetInfoVO.accessKey,
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
                        initialValue: ruleInfo.targetInfoVO.secretKey,
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
                            ruleInfo.targetInfoVO.queueType || 'standard',
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
    </>
  );
}

const EditRuleForm = Form.create<EditRuleFormProps>({
  onValuesChange: (props) => {
    props.setFormDirty(true);
  },
})(EditRuleFormContent);

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
