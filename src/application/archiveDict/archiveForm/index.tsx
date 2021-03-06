/* eslint-disable no-shadow */
import React, { useState, useEffect, forwardRef } from 'react';
import { Radio, Select, Form, Input, Modal } from 'antd';
import Textarea from 'components/TextArea';
import Toast from 'components/SimpleToast';

import { FormComponentProps } from 'antd/lib/form';

import {
  addProfileConfig,
  updateProfileConfig,
  findAllType,
  listAll,
} from '../services/index';
import { ArchiveItem } from '../types/index';
import './index.less';

const { Option } = Select;
interface ArchiveFormProps extends FormComponentProps {
  visible: boolean;
  data: ArchiveItem | undefined;
  onCancel: () => void;
  onOk: () => void;
}
type Ref = FormComponentProps;
const ArchiveForm = forwardRef<Ref, ArchiveFormProps>(
  ({ form, visible, data, onCancel, onOk }: ArchiveFormProps, ref) => {
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };

    const [dataType, setDataType] = useState<number>(4);
    // const [archiveArr, setArchiveArr] = useState<Array<any>>([]);
    const { getFieldDecorator, setFieldsValue, resetFields } = form;
    const [scope, setScope] = useState<number>(1);
    const [dictArr, setDictArr] = useState<Array<string>>([]);
    const [archiveObjectOptions, setArchiveObjectOptions] = useState<
      Array<any>
    >([]);
    useEffect(() => {
      if (data) {
        setScope(data.scope);
        if (data.thingTypeCode) {
          listAll().then((res) => {
            if (res && res.code === 200 && res.data) {
              setArchiveObjectOptions(res.data);
              const {
                profileName,
                profileCode,
                profileDesc,
                mandatory,
                editable,
                dataType,
                thingTypeCode,
                scope,
              } = data;
              setFieldsValue({
                profileName,
                profileCode,
                profileDesc,
                mandatory,
                editable,
                dataType,
                thingTypeCode,
                scope,
              });
            } else {
              setArchiveObjectOptions([]);
            }
          });
        } else {
          const {
            profileName,
            profileCode,
            profileDesc,
            mandatory,
            editable,
            dataType,
            thingTypeCode,
            scope,
          } = data;
          setFieldsValue({
            profileName,
            profileCode,
            profileDesc,
            mandatory,
            editable,
            dataType,
            thingTypeCode,
            scope,
          });
        }
      } else {
        resetFields();
        setScope(1);
      }
    }, [data, resetFields, setFieldsValue]);

    const scopeChange = async (scope: number) => {
      if (scope === 3) {
        const res = await listAll();
        setArchiveObjectOptions(res.data);
      }
      setScope(scope);
    };
    // ??????????????????
    const dataTypeOnChange = async (e: any) => {
      const { value } = e.target;
      setDataType(value);
      if (value === 5) {
        const data = await findAllType();
        if (data && data.length > 0) {
          setDictArr(data);
        }
      }
    };

    const archiveKeyCheck = (rule: any, value: any, callback: any) => {
      if (value) {
        // ?????????64????????????????????????????????????????????????(_)????????????(-)??????(.)?????????????????????????????????????????????????????????????????????
        const regRx = /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
        const isRight = regRx.test(value);
        console.log(regRx.test(value), '===============');
        if (!isRight) {
          callback(
            '?????????64????????????????????????????????????????????????(_)????????????(-)??????(.)?????????????????????????????????????????????????????????????????????'
          );
        }
      }
      callback();
    };
    // ????????????
    const handleFormSubmit = () => {
      form.validateFields((err: any, values: any) => {
        console.log(err, values);
        if (!err) {
          console.log('???????????????', values);
          let archiveArrPostData: any = [];
          archiveArrPostData.push({ ...values });
          console.log('??????????????????,?????????????????????:', archiveArrPostData);
          if (!data) {
            addProfileConfig(archiveArrPostData)
              .then((data) => {
                if (data && data.code === 200) {
                  Toast('????????????');
                  // ????????????
                  setDataType(4);
                  form.resetFields();
                  onOk();
                } else {
                  archiveArrPostData = [];
                }
              })
              .catch((err) => {
                Toast(err);
              });
          } else {
            updateProfileConfig({ ...data, ...values })
              .then((data) => {
                if (data && data.code === 200) {
                  Toast('????????????');
                  // ????????????
                  setDataType(4);
                  form.resetFields();
                  onOk();
                } else {
                  archiveArrPostData = [];
                }
              })
              .catch((err) => {
                Toast(err);
              });
          }
        }
      });
    };

    return (
      <Modal
        title={data ? '????????????' : '????????????'}
        centered
        visible={visible}
        okText="??????"
        cancelText="??????"
        onOk={handleFormSubmit}
        onCancel={onCancel}
        wrapClassName="info-modal"
      >
        <div className="achive-info">
          <Form {...formItemLayout}>
            <Form.Item label="????????????">
              {getFieldDecorator('scope', {
                initialValue: 1,
                rules: [{ required: true, message: '??????????????????????????????' }],
              })(
                <Select onChange={scopeChange} disabled={!!data && !!data.id}>
                  <Option value={1}>????????????</Option>
                  <Option value={2}>???????????????</Option>
                  <Option value={3}>???????????????</Option>
                </Select>
              )}
            </Form.Item>

            {scope === 3 && (
              <Form.Item label="?????????">
                {getFieldDecorator('thingTypeCode', {
                  rules: [
                    {
                      required: true,
                      message: '??????????????????????????????',
                    },
                  ],
                })(
                  <Select
                    placeholder="????????????????????????"
                    disabled={!!data && !!data.id}
                  >
                    {archiveObjectOptions.map((v: any, k: any) => {
                      return (
                        <Option key={v.id + k} value={v.id}>
                          {v.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            )}

            <Form.Item label="????????????">
              {getFieldDecorator('profileName', {
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                  {
                    validator: archiveKeyCheck,
                  },
                ],
              })(
                <Input
                  maxLength={64}
                  placeholder="??????????????????A?????????"
                  disabled={!!data && !!data.id}
                />
              )}
            </Form.Item>

            <Form.Item label="????????????">
              {getFieldDecorator('profileCode', {
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                  // {
                  //   validator: profileCodeCheck,
                  // },
                ],
              })(
                <Input
                  maxLength={64}
                  placeholder="?????????????????????"
                  disabled={!!data && !!data.id}
                />
              )}
            </Form.Item>

            <Form.Item label="????????????">
              {getFieldDecorator('mandatory', {
                initialValue: 1,
                rules: [
                  {
                    required: true,
                    message: '????????????????????????',
                  },
                ],
              })(
                <Radio.Group>
                  <Radio value={1}>???</Radio>
                  <Radio value={0}>???</Radio>
                </Radio.Group>
              )}
            </Form.Item>

            <Form.Item label="???????????????">
              {getFieldDecorator('editable', {
                initialValue: 1,
                rules: [
                  {
                    required: true,
                    message: '????????????????????????',
                  },
                ],
              })(
                <Radio.Group>
                  <Radio value={1}>???</Radio>
                  <Radio value={0}>???</Radio>
                </Radio.Group>
              )}
            </Form.Item>

            <Form.Item label="????????????">
              {getFieldDecorator('dataType', {
                initialValue: 4,
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              })(
                <Radio.Group
                  onChange={dataTypeOnChange}
                  disabled={!!data && !!data.id}
                >
                  <Radio value={4}>String</Radio>
                  <Radio value={1}>Bool</Radio>
                  <Radio value={2}>Int</Radio>
                  <Radio value={3}>Double</Radio>
                  {/* <Radio value={5}>Dict</Radio> */}
                </Radio.Group>
              )}
            </Form.Item>

            <Form.Item label="????????????">
              {getFieldDecorator('profileDesc', {
                rules: [],
              })(
                <Textarea
                  placeholder="????????????????????????"
                  maxLength={80}
                  name="profileDesc"
                />
              )}
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
);
export default Form.create<ArchiveFormProps>()(ArchiveForm);
