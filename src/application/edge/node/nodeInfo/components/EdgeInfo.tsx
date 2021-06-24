import { Button, Form, Row, Col, Input } from 'antd';
import Toast from 'components/SimpleToast/index';
import dayjs from 'dayjs';
import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import TextArea from 'components/TextArea';
import { deviceEditRequest } from 'application/deviceManageCenter/services/index';
import {
  EditContext,
  SET_WHEN,
  REFRESH_DEVICE_INFO,
} from 'application/deviceManageCenter/editDevice/context';
import './basicInfo.less';

function DeviceInfoCom(props: any) {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [disabled, setDisabled] = useState<boolean>(!!nodeId);
  const { state, dispatch } = useContext(EditContext);
  const { deviceInfo } = state;
  const { setFormDirty, viewMeta } = props;
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
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    props.form.validateFields(async (err: any, fieldsValue: any) => {
      if (!err) {
        console.log('fieldsValue', fieldsValue);
        let hasError = false;
        if (hasError) return; // 不合法停止操作
        const param = {
          ...deviceInfo,
          deviceId: deviceInfo.deviceId,
          ...fieldsValue,
        };
        deviceEditRequest(param)
          .then((res) => {
            if (res && res.code == 200) {
              Toast('保存成功');
              dispatch({
                type: SET_WHEN,
                when: false,
              });
            } else {
              // res && Toast(res.message);
            }
          })
          ['catch']((error) => {
            // Toast(error.message);
          })
          ['finally'](() => {
            dispatch({
              type: REFRESH_DEVICE_INFO,
              refreshing: true,
            });
            setDisabled(true);
            setFormDirty(false);
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
  const { getFieldDecorator } = props.form;
  const edit = () => {
    setDisabled(false);
    setFormDirty(true);
  };

  return (
    <div className="device-info">
      {/* <ObtainHeight bgColor="#fff"> */}
      <Form className="basic-info-form" layout="inline" colon={false}>
        <Row className="basic-form-row ">
          <Col span={12}>
            {/* <Form.Item label="名称">{deviceInfo.deviceName}</Form.Item> */}
            <Form.Item label="名称">
              {disabled ? (
                deviceInfo.deviceName
              ) : (
                <>
                  {getFieldDecorator('deviceName', {
                    rules: [
                      {
                        pattern: /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/,
                        message: '名称格式不正确',
                      },
                    ],
                    initialValue: deviceInfo.deviceName,
                  })(
                    <Input
                      // style={{ width: '400px' }}
                      placeholder="节点名称"
                      maxLength={30}
                      onChange={onInputChange}
                    />
                  )}
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ID">
              <span>{deviceInfo.deviceId}</span>
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="物类型名称">
              <span
                className="cursor-pointer primary-color"
                onClick={() => {
                  viewMeta();
                }}
              >
                {deviceInfo.thingTypeName}
              </span>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="节点状态">
              {/* {statusOption[(deviceInfo.status as unknown) as keyof typeof statusOption]}
               */}
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
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="最后接入时间">
              {deviceInfo.lastConnectTime
                ? dayjs(deviceInfo.lastConnectTime).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : '--'}
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Form.Item label="描述">
              {disabled ? (
                deviceInfo.description
              ) : (
                <>
                  {getFieldDecorator('description', {
                    initialValue: deviceInfo.description,
                  })(<TextArea maxLength={200} placeholder="请输入描述" />)}
                </>
              )}
            </Form.Item>
          </Col> */}
        </Row>
        <div className="btn-box">
          {disabled ? (
            <Button type="primary" htmlType="button" onClick={edit}>
              编辑
            </Button>
          ) : (
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              保存
            </Button>
          )}
        </div>
      </Form>
      {/* </ObtainHeight> */}
    </div>
  );
}
export default Form.create<any>({})(DeviceInfoCom);
