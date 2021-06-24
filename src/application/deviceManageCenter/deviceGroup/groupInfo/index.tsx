import React, {
  useContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import { Form, Input, Col, Row } from 'antd';
import dayjs from 'dayjs';

import Textarea from 'components/TextArea';
import Toast from 'components/SimpleToast';
import { FormComponentProps } from 'antd/lib/form';
import AuthButton from 'components/AuthButton';

import {
  queryGroupInfo,
  getDeviceOnlineNums,
  getDeviceNums,
  updateGroupInfo,
} from '../../services/deviceGroup';
import { EditContext, SET_REFRESH_GROUP_LIST } from '../context';
import './index.less';

// 分组信息的form

type InfoFormProps = FormComponentProps;
const InfoForm = forwardRef<FormComponentProps, InfoFormProps>(
  ({ form }: InfoFormProps, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const { state, dispatch } = useContext(EditContext);
    const { editInfo, authVOList } = state;
    const { getFieldDecorator } = form;
    const [onlineNum, setOnlineNum] = useState(0);
    const [deviceNum, setDeviceNum] = useState(0);
    // 初始化数据
    const initData = useCallback(() => {
      if (editInfo.level > 0) {
        try {
          getDeviceOnlineNums({ groupId: editInfo.id }).then((res) => {
            setOnlineNum(res.data);
          });
          getDeviceNums({ groupId: editInfo.id }).then((res) => {
            setDeviceNum(res.data);
          });
        } catch (error) {
          console.log(error);
        }
        // queryGroupInfo({ groupId: editInfo.id }),
      }
    }, [editInfo]);
    useEffect(() => {
      initData();
    }, [initData]);

    // 保存
    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      form.validateFields((err: any, values: any) => {
        if (!err) {
          console.log(editInfo, values);
          updateGroupInfo({ ...editInfo, ...values, groupNameChangeFlag: true })
            .then((res) => {
              if (res && res.code == 200) {
                initData();
                dispatch({
                  type: SET_REFRESH_GROUP_LIST,
                  refreshGroupList: true,
                });
                Toast('保存成功');
              }
            })
            ['catch']((error) => {
              console.log(error);
            });
        }
      });
    };
    return (
      <div className="group-info-sll">
        <header>
          <h3 className="tit">编辑分组信息</h3>
        </header>
        <div className="group-info">
          <Form
            className="basic-info-form"
            layout="inline"
            colon={false}
            onSubmit={handleSave}
          >
            <Row className="basic-form-row archive-col">
              <Col span={24}>
                <Form.Item label="分组名">
                  {getFieldDecorator('groupName', {
                    rules: [
                      {
                        required: true,
                        message: '分组名不能为空',
                      },
                    ],
                    initialValue: editInfo.groupName,
                  })(
                    <Input
                      placeholder="分组名称，仅支持30个字符"
                      maxLength={30}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="分组层级">
                  {editInfo.level ? `第${editInfo.level}级` : '--'}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="创建时间">
                  {(editInfo.createTime &&
                    dayjs(editInfo.createTime).format('YYYY-MM-DD HH:mm:ss')) ||
                    '--'}
                </Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="设备总数">{deviceNum}</Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="当前在线数">{onlineNum}</Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={24}>
                <Form.Item label="分组描述">
                  {getFieldDecorator('description')(
                    <Textarea
                      rows={3}
                      placeholder="简单描述一下分组"
                      maxLength={200}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <div className="btn-box">
              <AuthButton
                type="primary"
                htmlType="submit"
                buttonKey="UPDATE_PERMISSION"
                className="btn"
                routeAuthVOList={authVOList}
              >
                保存
              </AuthButton>
            </div>
          </Form>
        </div>
      </div>
    );
  }
);

export default Form.create<InfoFormProps>()(InfoForm);
