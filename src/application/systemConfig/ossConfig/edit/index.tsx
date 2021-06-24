/*
 * @Author:  shaoym
 * @Date: 2021-03-08 10:47:59
 * @LastEditTime: 2021-03-11 16:12:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 */
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Form, Input, Row, Col, Button, Icon } from 'antd';
import Header from 'components/Header';
import TextArea from 'components/TextArea';
import { OSS } from 'application/systemConfig/types';
import {
  findById,
  saveOss,
  modifyOss,
  testOss,
} from 'application/systemConfig/service';
import SimpleToast from 'components/SimpleToast';
import './index.less';

const EditOSS = (props: any) => {
  const { action, id } = useParams<{ action: any; id: string }>();

  const history = useHistory();
  const initOssInfo: OSS = {
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    endpoint: '',
  };
  const [ossInfo, setOssInfo] = useState<OSS>(initOssInfo);
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 19 },
  };
  const titleList = {
    create: '创建',
    edit: '编辑',
    view: '查看',
  };

  let initShowKeyData = {
    accessKeyId: false,
    accessKeySecret: false,
  };
  const [showKeyData, setShowKeyData] = useState(initShowKeyData);

  const ShowDataCom = (props: any) => {
    const { dataKey, data } = props;
    const str = '****************';

    return showKeyData[dataKey as keyof typeof showKeyData] ? (
      <span>
        {data}
        <span
          className="icon-eye"
          onClick={() => {
            setShowKeyData({ ...showKeyData, [dataKey]: false });
          }}
        />
      </span>
    ) : (
      <span>
        {str}
        <span
          className="icon-eye-blocked"
          onClick={() => {
            setShowKeyData({ ...showKeyData, [dataKey]: true });
          }}
        />
      </span>
    );
  };

  const handleSubmit = async (reqFun: any, param: OSS, message?: string) => {
    try {
      const res = await reqFun(param);
      if (res && res.code === 200) {
        SimpleToast(message || `保存成功`);
        if (!message) history.goBack();
      }
    } catch (error) {}
  };

  const onSubmit = (action: string) => {
    props.form.validateFieldsAndScroll((err: any, values: OSS) => {
      if (!err) {
        console.log(values, 'values---');
        switch (action) {
          // 创建对象存储
          case 'create':
            handleSubmit(saveOss, values);
            break;
          // 修改对象存储
          case 'edit':
            handleSubmit(modifyOss, { ...values, id });
            break;
          // 测试连接对象存储
          case 'test':
            handleSubmit(testOss, values, '连接成功');
            break;
        }
      }
    });
  };

  // 查询OSS详情
  const getOssInfo = async () => {
    const res = await findById({ id });
    if (res) {
      setOssInfo(res);
    } else {
      console.log('查询失败');
    }
  };

  useEffect(() => {
    if (id && JSON.parse(id) !== null) {
      getOssInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return (
    <>
      <Header
        back
        to="/systemConfig/ossConfig"
        title={`${titleList[action as keyof typeof titleList]}对象存储`}
      />
      <div className="oss-info">
        <Form className="basic-info-form" layout="inline" {...formItemLayout}>
          {action === 'view' ? (
            <>
              <Row className="basic-form-row">
                <Col span={12}>
                  <Form.Item label="Endpoint">
                    <span>{ossInfo.endpoint}</span>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Bucket">
                    <span>{ossInfo.bucket}</span>
                  </Form.Item>
                </Col>
              </Row>
              <Row className="basic-form-row">
                <Col span={12}>
                  <Form.Item label="AccessKeyId">
                    <ShowDataCom
                      dataKey="accessKeyId"
                      data={ossInfo.accessKeyId}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="AccessKeySecret">
                    <ShowDataCom
                      dataKey="accessKeySecret"
                      data={ossInfo.accessKeySecret}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item
                    label="描述"
                    style={{ minHeight: 80 }}
                    labelCol={{ span: 2 }}
                  >
                    <span>{ossInfo.description}</span>
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row className="basic-form-row">
                <Col span={12}>
                  <Form.Item label="Endpoint">
                    {getFieldDecorator('endpoint', {
                      rules: [
                        {
                          required: true,
                          message: '请填写Endpoint',
                        },
                      ],
                      initialValue: ossInfo.endpoint,
                    })(<Input placeholder="请填写Endpoint" />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Bucket">
                    {getFieldDecorator('bucket', {
                      rules: [
                        {
                          required: true,
                          message: '请填写Bucket',
                        },
                      ],
                      initialValue: ossInfo.bucket,
                    })(<Input placeholder="请填写Bucket" />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className="basic-form-row">
                <Col span={12}>
                  <Form.Item label="AccessKeyId">
                    {getFieldDecorator('accessKeyId', {
                      rules: [
                        {
                          required: true,
                          message: '请填写AccessKeyId',
                        },
                      ],
                      initialValue: ossInfo.accessKeyId,
                    })(<Input placeholder="请填写AccessKeyId" />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="AccessKeySecret">
                    {getFieldDecorator('accessKeySecret', {
                      rules: [
                        {
                          required: true,
                          message: '请填写AccessKeySecret',
                        },
                      ],
                      initialValue: ossInfo.accessKeySecret,
                    })(<Input placeholder="请填写AccessKeySecret" />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item label="描述" labelCol={{ span: 2 }}>
                    {getFieldDecorator('description', {
                      rules: [],
                    })(<TextArea maxLength={200} height={80} />)}
                  </Form.Item>
                </Col>
              </Row>
              <div className="submit-btn-wrap">
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    onSubmit('test');
                  }}
                >
                  测试
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: 16 }}
                  onClick={() => {
                    onSubmit(action);
                  }}
                >
                  保存
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </>
  );
};

export default Form.create<any>({})(EditOSS);
