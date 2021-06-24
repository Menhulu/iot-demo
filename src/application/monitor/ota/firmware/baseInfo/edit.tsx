import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { RadioChangeEvent } from 'antd/lib/radio';

import { RcFile } from 'antd/lib/upload/interface';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';
import Textarea from 'components/TextArea';

import {
  getThingTypeListRequest,
  editFirmwareInfo,
  getFirmwareInfo,
  getSupportSignatureAlgorithm,
} from '../../../services';
import { FirmwareData, ThingType } from '../../../types';

import './index.less';
import Header from 'components/Header';

import { versionReg, versionRule } from 'utils/constants';
const { Dragger } = Upload;

const { Option } = Select;

interface FirmwareFormProps extends FormComponentProps {
  setFormDirty: (flag: boolean) => void;
}

function FirmwareForm(props: FirmwareFormProps) {
  const history = useHistory();
  const { firmwareId } = useParams<{ firmwareId: string }>();
  const { getFieldDecorator, setFieldsValue, getFieldValue } = props.form;
  const [supportSignatureAlgorithm, setSupportSignatureAlgorithm] = useState<
    { code: string; name: string }[]
  >([]);
  const [hasAlgorithm, setHasAlgorithm] = useState<boolean>(false);
  const [thingTypeList, setThingTypeList] = useState<ThingType[]>([]);
  const [thingTypeName, setThingTypeName] = useState<string>('');
  const [fileUrlErr, setFileUrlErr] = useState<string>();
  const [fileList, setFileList] = useState<any>([]);
  const [packageInfo, setPackageInfo] = useState<{
    packageUrl: string;
    packageName: string;
    packageSize: number;
  }>({ packageUrl: '', packageName: '', packageSize: 0 });

  const [srcVersionDirty, setSrcVersionDirty] = useState(false);
  useEffect(() => {
    // 获取物类型列表
    const getThingTypeList = async () => {
      const res = await getThingTypeListRequest();
      if (res && res.code === 200) {
        setThingTypeList(res.data);
      }
    };

    getThingTypeList();

    getSupportSignatureAlgorithm().then((res) => {
      if (res.code === 200) {
        setSupportSignatureAlgorithm(res.data || []);
      }
    });
  }, []);
  useEffect(() => {
    console.log(firmwareId);
    if (!firmwareId) return;
    getFirmwareInfo({ firmwareId }).then((res) => {
      if (res.code === 200) {
        if (res.data) {
          const {
            thingTypeCode,
            srcVersion,
            destVersion,
            versionNo,
            signature,
            algorithm,
            packageName,
            packageUrl,
            packageSize,
            changeLog,
            firmwareId,
          } = res.data;
          const initThingType = thingTypeList.find(
            (item) => item.id === thingTypeCode
          );
          initThingType && setThingTypeName(initThingType.name);
          setFieldsValue({
            thingTypeCode,
            srcVersion,
            destVersion,
            versionNo,
            signature,
            algorithm,
            changeLog,
            firmwareId,
          });
          setPackageInfo({
            packageName,
            packageUrl,
            packageSize: packageSize as number,
          });
        }
      }
    });
  }, [firmwareId, setFieldsValue, thingTypeList]);

  // 保存固件
  const submitFirmwareInfo = async (params: Partial<FirmwareData>) => {
    const url = firmwareId ? 'v1/ota/edit' : 'v1/ota/add';
    try {
      const res = await editFirmwareInfo(url, params);
      if (res && res.code == 200) {
        history.push('/firmware/list');
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

      if (!firmwareId && !fileList.length) {
        Toast('请上传固件包');
        return;
      }

      if (!err) {
        const formData = new FormData();
        const params = {
          ...values,
          thingTypeName: thingTypeName,
          packageType: '1',
        };
        if (!firmwareId) {
          formData.append('file', fileList[0]);
        }

        formData.append('firmware', JSON.stringify(params));
        submitFirmwareInfo(formData);
      }
    });
  };
  const beforeUpload = (file: RcFile) => {
    console.log(file);

    setFileUrlErr('');
    const isZip = /.(bin|tar|gz|tgz|zip)$/.test(file.name);
    if (!isZip) {
      setFileUrlErr('请上传 bin、tar、gz、tgz、zip 格式的压缩包');
    }
    const isLimited200M = file.size / 1024 / 1024 <= 200;
    if (!isLimited200M) {
      setFileUrlErr('请上传200M以内的文件包');
    }
    setFileList([file]);
    return false;
  };
  // 删除上传的excel
  const removeFile = (file: any) => {
    setFileList([]);
  };
  // 签名算法变化
  const handleAlgorithm = (e: RadioChangeEvent) => {
    setHasAlgorithm(e.target.value !== 'NONE');
  };
  // 物类型变化
  const handleThingTypeChange = (value: string, option: any) => {
    console.log(option);
    setThingTypeName(option.props.title);
  };

  const handleSrcVersionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSrcVersionDirty(!!value);
  };

  return (
    <>
      <Header
        back
        to="/firmware/list"
        title={firmwareId ? '编辑固件包' : '新增固件包'}
      />
      <ObtainHeight bgColor="#fff">
        <div className="firmware-wrap">
          <Form
            className="basic-info-form"
            colon={false}
            layout="inline"
            onSubmit={handleSubmit}
          >
            {getFieldDecorator('firmwareId')(<Input type="hidden" />)}
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="物类型">
                  {getFieldDecorator('thingTypeCode', {
                    rules: [{ required: true, message: '请选择物类型' }],
                  })(
                    <Select
                      showSearch
                      disabled={!!firmwareId}
                      dropdownClassName="select-with-id"
                      placeholder="选择物类型"
                      optionFilterProp="children"
                      onChange={handleThingTypeChange}
                      filterOption={(input: any, option: any) =>
                        option.key.toLowerCase().indexOf(input.toLowerCase()) >=
                        0
                      }
                    >
                      {thingTypeList.map((v: ThingType, k) => {
                        return (
                          <Option
                            key={v.name + v.id}
                            value={v.id}
                            title={v.name}
                          >
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
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="版本号">
                  {getFieldDecorator('versionNo', {
                    rules: [
                      { required: true, message: '请填写版本号' },
                      {
                        pattern: versionReg,
                        message: versionRule,
                      },
                    ],
                  })(<Input maxLength={20} placeholder="请填写版本号" />)}
                </Form.Item>
                <Tooltip
                  className=" rule primary-color text-center"
                  title="请添加可升级固件版本号，必须小于将要新增的固件的版本号。可以为空，即支持所有旧固件版本"
                >
                  说明
                </Tooltip>
              </Col>
              <Col span={12}>
                <Form.Item label="可升级固件版本">
                  {getFieldDecorator('srcVersion', {
                    rules: [
                      {
                        pattern: versionReg,
                        message: versionRule,
                      },
                    ],
                  })(
                    <Input
                      maxLength={20}
                      onBlur={handleSrcVersionBlur}
                      placeholder="请输入可升级固件版本"
                    />
                  )}
                </Form.Item>
                <Tooltip
                  className=" rule primary-color text-center"
                  title="请添加可升级固件版本号，必须小于将要新增的固件的版本号。可以为空，即支持所有旧固件版本"
                >
                  说明
                </Tooltip>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="签名算法">
                  {getFieldDecorator('algorithm', {
                    rules: [{ required: true, message: '请选择签名算法' }],
                  })(
                    <Radio.Group onChange={handleAlgorithm}>
                      {supportSignatureAlgorithm.map((item) => (
                        <Radio value={item.code} key={item.code}>
                          {item.name}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="固件签名">
                  {getFieldDecorator('signature', {
                    rules: [
                      {
                        required: hasAlgorithm,
                        message: '请选择填写固件签名',
                      },
                    ],
                  })(<Input placeholder="请填写固件签名" />)}
                </Form.Item>
              </Col>
            </Row>

            <Row className="basic-form-row">
              <Col span={12}>
                {!firmwareId ? (
                  <Form.Item
                    label={
                      <span>
                        <span className="icon-required primary-color" />
                        固件包上传
                      </span>
                    }
                  >
                    <Dragger
                      multiple={false}
                      beforeUpload={beforeUpload}
                      fileList={fileList}
                      onRemove={removeFile}
                    >
                      <Button>
                        <span className="icon-upload" /> 点击或拖拽上传文件
                      </Button>
                    </Dragger>

                    {fileUrlErr && (
                      <span className="err-msg ml-10">{fileUrlErr}</span>
                    )}
                    {packageInfo.packageUrl && (
                      <a
                        className="fileurl"
                        href={packageInfo.packageUrl}
                        download
                      >
                        {packageInfo.packageUrl}
                      </a>
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item label="固件包名称">
                    {packageInfo?.packageName}
                    <a
                      className="download"
                      href={packageInfo?.packageUrl}
                      download
                    >
                      点击下载
                    </a>
                  </Form.Item>
                )}
              </Col>
              <Col span={12}>
                <Form.Item label="备注">
                  {getFieldDecorator('changeLog')(
                    <Textarea
                      placeholder="请输入固件摘要或相关版本说明，包括但不限于固件的主要功能，修改的主要内容等信息"
                      maxLength={200}
                      name="desc"
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
    </>
  );
}

const FirmwareInfo = Form.create<FirmwareFormProps>({
  onValuesChange: (props) => {
    props.setFormDirty && props.setFormDirty(true);
  },
})(FirmwareForm);

export default FirmwareInfo;
