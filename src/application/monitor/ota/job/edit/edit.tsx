import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  Form,
  Radio,
  Input,
  Button,
  Select,
  Upload,
  Row,
  Col,
  DatePicker,
} from 'antd';
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import Textarea from 'components/TextArea';

import { FormComponentProps } from 'antd/es/form';

import { UploadFile, RcFile } from 'antd/lib/upload/interface';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';
import { PREFIXOWN } from 'utils/constants';
import {
  getThingTypeListRequest,
  queryFirmwareListByThingTypeCode,
  getGroupList,
  editJobInfo,
  getJobDetail,
} from '../../../services';
import { ThingType, DeviceGroupInfo, FirmwareData } from '../../../types';

import './index.less';
import 'dayjs/locale/zh-cn';
import moment from 'moment';

import { displayNameReg, displayNameRule } from 'utils/constants';

dayjs.locale('zh-cn');
const { Option } = Select;
const { Dragger } = Upload;

interface JobFormProps extends FormComponentProps {
  setFormDirty: (flag: boolean) => void;
}

function JobInfoForm(props: JobFormProps) {
  const history = useHistory();
  const { thingTypeCode, firmwareId, jobId } = useParams<{
    thingTypeCode: string;
    firmwareId: string;
    jobId: string;
  }>();
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const [thingTypeList, setThingTypeList] = useState<ThingType[]>([]);
  const [firmwareAllList, setFirmwareAllList] = useState<FirmwareData[]>([]);
  const [deviceGroupList, setDeviceGroupList] = useState<DeviceGroupInfo[]>([]);
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [fileUrlErr, setFileUrlErr] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  // 从固件列表直接创建任务，给表单赋值
  useEffect(() => {
    setFieldsValue({ thingTypeCode });
  }, [setFieldsValue, thingTypeCode]);
  // 从固件列表直接创建任务，给表单赋值，从固件id映射到固件版本
  useEffect(() => {
    if (firmwareAllList.length) {
      setFieldsValue({ firmwareId });
    }
  }, [firmwareAllList.length, firmwareId, setFieldsValue]);
  useEffect(() => {
    if (!jobId) return;
    getJobDetail({ jobId: jobId }).then((res) => {
      if (res.code === 200) {
        const { name, customized, scope, strategy } = res.data;
        const { execTime, installModel } = strategy;
        setFieldsValue({
          installModel,
          name,
          customized,
          scope,
          jobId,
        });
        setFieldsValue({
          execTime: moment(execTime),
        });
      }
    });
  }, [jobId, setFieldsValue]);
  // 查询版本列表
  const getVersionList = useCallback((id?: string) => {
    queryFirmwareListByThingTypeCode({ thingTypeCode: id })
      .then((res) => {
        if (res.code === 200) {
          setFirmwareAllList(res.data || []);
        } else {
          setFirmwareAllList([]);
        }
      })
      .catch((e) => {
        setFirmwareAllList([]);
      });
  }, []);
  useEffect(() => {
    // 获取物类型列表
    const getThingTypeList = async () => {
      const res = await getThingTypeListRequest();
      if (res && res.code === 200) {
        setThingTypeList(res.data);
      } else {
        setThingTypeList([]);
      }
    };
    getThingTypeList();
    // 获取设备分组列表
    getGroupList()
      .then((res) => {
        if (res) {
          setDeviceGroupList(res);
        }
      })
      ['catch']((err) => {
        Toast('查询设备分组失败');
        setDeviceGroupList([]);
      });
  }, []);

  useEffect(() => {
    thingTypeCode && getVersionList(thingTypeCode);
  }, [getVersionList, thingTypeCode]);

  // 保存固件
  const submitFirmwareInfo = async (params: any) => {
    const url = jobId ? 'v1/ota/job/edit' : 'v1/ota/job/add';
    try {
      const res = await editJobInfo(url, params);
      if (res && res.code == 200) {
        props.setFormDirty(false);
        history.push('/ota/job/list');
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
      console.log(values);
      if (!err) {
        const {
          installModel,
          firmwareId,
          name,
          customized,
          scope,
          execTime,
          thingTypeCode,
          deviceGroupId,
          jobId,
          grayscaleType,
        } = values;
        if (grayscaleType === 1 && !deviceIds.length) {
          Toast('请上传设备ID');
          return;
        }
        const params = {
          jobId,
          thingTypeCode: thingTypeCode,
          deviceGroupId,
          oids: deviceIds,
          scope,
          installModel: installModel,
          firmwareId: firmwareId,
          strategy: {
            execTime: new Date(execTime).getTime(),
            installModel: installModel,
          },
          customized,
          name,
        };

        submitFirmwareInfo(params);
      }
    });
  };
  // 读取excel文件
  const beforeUpload = (file: RcFile) => {
    console.log(file);

    setFileUrlErr('');
    const isZip = /.(xls|xlsx|csv)$/.test(file.name);
    if (!isZip) {
      setFileUrlErr('请上传excel文件');
    }
    setFileList([file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      const workbook = XLSX.read(result, { type: 'binary' });
      let data: any[] = [];
      let fromTo: any;
      for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
          fromTo = workbook.Sheets[sheet]['!ref'];
          console.log(fromTo);
          data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
        }
      }
      if (data.length > 500) {
        setFileUrlErr('每次上传不超过500条');
        return;
      }
      const ids = data.map((item) => item.deviceId);
      setDeviceIds(ids);
    };
    // 以二进制方式打开文件
    reader.readAsBinaryString(file);

    return false;
  };
  // 删除上传的excel
  const removeFile = (file: any) => {
    setFileList([]);
    setDeviceIds([]);
  };

  const handleThingTypeCodeChange = (value: string) => {
    setFieldsValue({ firmwareId: '' });
    getVersionList(value);
  };

  return (
    <ObtainHeight bgColor="#fff">
      <div className="job-wrap">
        <Form
          className="basic-info-form"
          colon={false}
          layout="inline"
          onSubmit={handleSubmit}
        >
          {getFieldDecorator('jobId')(<Input type="hidden" />)}
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="物类型">
                {getFieldDecorator('thingTypeCode', {
                  rules: [{ required: true, message: '请选择物类型' }],
                })(
                  <Select
                    showSearch
                    disabled={!!jobId}
                    dropdownClassName="select-with-id"
                    placeholder="选择物类型"
                    onChange={handleThingTypeCodeChange}
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {thingTypeList.map((v: ThingType, k) => {
                      return (
                        <Option key={v.name + v.id} value={v.id}>
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
              <Form.Item label="固件版本">
                {getFieldDecorator('firmwareId')(
                  <Select
                    disabled={!!jobId}
                    showSearch
                    placeholder="请选择固件版本"
                  >
                    {firmwareAllList.map((v: FirmwareData, k) => {
                      return (
                        <Option
                          key={v.thingTypeCode + v.firmwareId}
                          value={v.firmwareId}
                        >
                          {v.versionNo}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="任务名称">
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: '请填写任务名称' },
                    { pattern: displayNameReg, message: displayNameRule },
                  ],
                })(<Input maxLength={20} placeholder="请输入任务名称" />)}
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="升级模式">
                {getFieldDecorator('installModel', {
                  initialValue: 0,
                })(
                  <Radio.Group>
                    <Radio value={0}>立即升级</Radio>
                    {/* <Radio value={1}>用户确认后下载安装</Radio>
                    <Radio value={2}>用户确认后安装</Radio> */}
                    <Radio value={3}>定时升级</Radio>
                    <Radio value={4}>闲时升级</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            {getFieldValue('installModel') === 3 && (
              <Col span={12}>
                <Form.Item label="选择升级时间">
                  {getFieldDecorator('execTime', {
                    rules: [{ required: true, message: '请选择升级时间' }],
                  })(<DatePicker showTime />)}
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="升级范围">
                {getFieldDecorator('scope', {
                  initialValue: '1',
                })(
                  <Radio.Group>
                    <Radio value="1">全量</Radio>
                    <Radio value="2">指定设备</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          </Row>
          {getFieldValue('scope') === '2' && (
            <>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        <span className="icon-required primary-color" />
                        指定设备范围
                      </>
                    }
                  >
                    {getFieldDecorator('grayscaleType', { initialValue: 1 })(
                      <Radio.Group>
                        <Radio value={2}>设备分组</Radio>
                        <Radio value={1}>批量上传设备ID</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row className="basic-form-row">
                {getFieldValue('grayscaleType') === 2 ? (
                  <Col span={12}>
                    <Form.Item label="请选择分组">
                      {getFieldDecorator('deviceGroupId', {
                        rules: [{ required: true, message: '请选择设备分组' }],
                      })(
                        <Select
                          showSearch
                          dropdownClassName="select-with-id"
                          placeholder="选择设备分组"
                          optionFilterProp="children"
                          // style={{ width: 400 }}
                          filterOption={(input: any, option: any) =>
                            option.key
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {deviceGroupList.map((v: DeviceGroupInfo, k) => {
                            return (
                              <Option
                                key={v.groupName + v.id}
                                value={v.id.toString()}
                              >
                                <div className="option-box">
                                  <span className="option-name">
                                    {v.groupName}
                                  </span>
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
                ) : (
                  <Col span={24}>
                    <div className="upload-devices">
                      <div className="empty-box"></div>
                      <div className="gray-scale">
                        <div>
                          温馨提示：
                          <a
                            href={`${PREFIXOWN}/v1/ota/downloadTemplate`}
                            download
                            className="f-r"
                          >
                            设备ID模板下载
                          </a>
                        </div>
                        <div>
                          1、首次使用上传设备ID功能，请先下载模板，下载后根据表格填写，再进行上传
                        </div>
                        <div className="warning">
                          2、如果您已批量上传过设备ID，再次上传时，会在原设备列表上进行追加
                        </div>
                        <Dragger
                          className="upload-box"
                          name="file"
                          multiple={false}
                          fileList={fileList}
                          beforeUpload={beforeUpload}
                          onRemove={removeFile}
                        >
                          <Button type="primary">
                            <span className="icon-upload" /> 点击或拖拽上传文件
                          </Button>
                        </Dragger>
                        {fileUrlErr && (
                          <span className="err-msg ml-10">{fileUrlErr}</span>
                        )}
                        <div className="upload-rule">
                          仅支持xls、xlsx、csv格式文件
                          <br />
                          每次批量上传设备ID，建议不超过500条，每行一个设备ID，中间不能有空格
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="用户自定义消息">
                {getFieldDecorator('customized')(
                  <Textarea
                    placeholder="用户自定义消息会随任务一同下发"
                    maxLength={200}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <div className="btn-box">
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </div>
    </ObtainHeight>
  );
}
const JobInfoCom = Form.create<JobFormProps>({
  onValuesChange: (props) => {
    props.setFormDirty(true);
  },
})(JobInfoForm);
export default JobInfoCom;
