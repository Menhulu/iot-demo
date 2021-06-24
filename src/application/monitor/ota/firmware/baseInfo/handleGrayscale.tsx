import React, { useState, useCallback, useContext, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Form, Select, Radio, Upload, Row, Col, Button } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile, RcFile } from 'antd/lib/upload/interface';
import { RadioChangeEvent } from 'antd/lib/radio';
import Toast from 'components/SimpleToast/index';

import { getGroupList } from '../../../services';
import { DeviceGroupInfo } from '../../../types';
import {
  FirmwareProvider,
  FirmwareContext,
  SET_FORMDIRTY,
  SET_FIRMWARE_INFO,
  SET_GROUP_ERR,
} from './context';
import { PREFIXOWN } from 'utils/constants';

import './index.less';

const { Option } = Select;

type HandleGrayscaleProps = RouteComponentProps;
function HandleGrayscale(props: HandleGrayscaleProps) {
  const { state, dispatch } = useContext(FirmwareContext);
  const { firmwareInfo, groupErrMsg } = state;

  const [deviceGroupList, setDeviceGroupList] = useState<DeviceGroupInfo[]>([]);
  const [fileInfo, setFileInfo] = useState<{
    fileList: UploadFile<any>[];
    fileUploadStatus: string;
    fileUrlErr: string;
    failureTotal: number;
    successTotal: number;
    successUrl: string;
    failureUrl: string;
    grayscale: { type: number; value: string };
  }>({
    fileList: [],
    fileUploadStatus: '',
    fileUrlErr: '',
    failureTotal: 0,
    grayscale: {
      type: 1,
      value: '',
    },
    successTotal: 0,
    successUrl: '',
    failureUrl: '',
  });

  // 获取设备分组列表
  const fetchGroupList = useCallback(() => {
    getGroupList()
      .then((res) => {
        if (res) {
          setDeviceGroupList(res);
        }
      })
      ['catch']((err) => {
        Toast('查询设备分组失败');
      });
  }, []);

  useEffect(() => {
    // 选择灰度且没有请求过分组列表时拉取数据
    if (
      fileInfo.grayscale &&
      fileInfo.grayscale.type === 1 &&
      !deviceGroupList.length
    ) {
      fetchGroupList();
    }
  }, [deviceGroupList.length, fetchGroupList, fileInfo.grayscale]);

  /**
   * @description: 单选按钮组变化
   * @param {type} e: RadioChangeEvent
   * @return: void
   */
  const handleRadioChange = (e: RadioChangeEvent) => {
    console.log('handleRadioChange');
    dispatch({ type: SET_FORMDIRTY, formDirty: true });
    const { name, value } = e.target;
    if (name === 'publishStatus') {
      dispatch({
        type: SET_FIRMWARE_INFO,
        firmwareInfo: {
          ...firmwareInfo,
          publishStatus: value,
          grayscale: { type: 2, value: '' },
        },
      });
    }
    if (name === 'grayscaleType') {
      const grayscale = { type: value, value: '' };
      dispatch({
        type: SET_FIRMWARE_INFO,
        firmwareInfo: { ...firmwareInfo, grayscale },
      });
    }
  };
  /**
   * @description: 选择设备分组
   */
  const selectDeviceGroup = (value: string) => {
    console.log('selectDeviceGroup');
    dispatch({ type: SET_FORMDIRTY, formDirty: true });
    dispatch({ type: SET_GROUP_ERR, groupErrMsg: '' });
    const grayscale = firmwareInfo.grayscale || { type: 1, values: '' };
    grayscale.value = value;
    dispatch({
      type: SET_FIRMWARE_INFO,
      firmwareInfo: { ...firmwareInfo, grayscale },
    });
  };
  /**
   * @description: 上传文件
   */
  const beforeUpload = (file: RcFile) => {
    console.log(file);
    setFileInfo({ ...fileInfo, fileUploadStatus: '' });
    const isExcel = /.xls/.test(file.name);
    if (!isExcel) {
      setFileInfo({ ...fileInfo, fileUrlErr: '请上传.xls或.xlsx格式的文件' });
      return false;
    }
    const isLimited200M = file.size / 1024 / 1024 <= 200;
    if (!isLimited200M) {
      setFileInfo({ ...fileInfo, fileUrlErr: '请上传200M以内的文件' });
      return false;
    }
    return true;
  };
  const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
    dispatch({ type: SET_FORMDIRTY, formDirty: true });
    let $fileList = [];
    $fileList = [...info.fileList];
    $fileList = $fileList.slice(-1);
    console.log($fileList);
    setFileInfo({
      ...fileInfo,
      fileList: $fileList,
      fileUploadStatus: 'uploading',
    });
    if (info.file.status === 'done') {
      if (info.file.response.code === 200) {
        const { data } = info.file.response;
        const {
          successTotal,
          failureTotal,
          successUrl,
          failureUrl,
          grayscale,
        } = data;
        setFileInfo({
          ...fileInfo,
          fileUrlErr: '',
          fileUploadStatus: 'done',
          successTotal,
          failureTotal,
          successUrl,
          failureUrl,
          grayscale,
        });
        dispatch({
          type: SET_FIRMWARE_INFO,
          firmwareInfo: {
            ...firmwareInfo,
            grayscale: { type: 2, value: grayscale.value },
          },
        });
      } else {
        setFileInfo({
          ...fileInfo,
          fileUrlErr: '上传失败',
          fileUploadStatus: 'error',
          successTotal: 0,
          failureTotal: 0,
          successUrl: '',
          failureUrl: '',
          grayscale: { type: 1, value: '' },
        });
        dispatch({
          type: SET_FIRMWARE_INFO,
          firmwareInfo: { ...firmwareInfo, grayscale: { type: 1, value: '' } },
        });
      }
    }
    if (info.file.status === 'error') {
      setFileInfo({
        ...fileInfo,
        fileUrlErr: '上传失败',
        fileUploadStatus: 'error',
        successTotal: 0,
        failureTotal: 0,
        successUrl: '',
        failureUrl: '',
        grayscale: { type: 1, value: '' },
      });
      dispatch({
        type: SET_FIRMWARE_INFO,
        firmwareInfo: { ...firmwareInfo, grayscale: { type: 1, value: '' } },
      });
    }
    // const { grayscale } = firmwareInfo;
    // dispatch({
    //   type: SET_FIRMWARE_INFO,
    //   firmwareInfo: { ...firmwareInfo, grayscale },
    // });
  };
  console.log(firmwareInfo);
  return (
    <FirmwareProvider>
      <Row className="basic-form-row">
        <Col span={12}>
          <Form.Item label="是否灰度">
            <Radio.Group
              name="publishStatus"
              value={firmwareInfo.publishStatus}
              onChange={handleRadioChange}
            >
              <Radio value={2}>否</Radio>
              <Radio value={1}>是</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      {firmwareInfo.publishStatus === 1 && (
        <>
          <Row>
            <Col span={24}>
              <Form.Item
                label={
                  <>
                    <span className="icon-required primary-color" />
                    灰度方式
                  </>
                }
              >
                <Radio.Group
                  name="grayscaleType"
                  onChange={handleRadioChange}
                  value={
                    (!!firmwareInfo.grayscale && firmwareInfo.grayscale.type) ||
                    1
                  }
                >
                  <Radio value={2}>设备分组</Radio>
                  <Radio value={1}>批量上传设备ID</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row className="sub-item">
            {firmwareInfo.grayscale && firmwareInfo.grayscale.type === 2 ? (
              <Col span={12}>
                <Form.Item label="请选择分组" required className="gray-scale">
                  <Select
                    showSearch
                    dropdownClassName="select-with-id"
                    onChange={selectDeviceGroup}
                    value={firmwareInfo.grayscale.value}
                    placeholder="选择设备分组"
                    optionFilterProp="children"
                    // style={{ width: 400 }}
                    filterOption={(input: any, option: any) =>
                      option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {deviceGroupList.map((v: DeviceGroupInfo, k) => {
                      return (
                        <Option
                          key={v.groupName + v.id}
                          value={v.id.toString()}
                        >
                          <div className="option-box">
                            <span className="option-name">{v.groupName}</span>
                            <br />
                            <span className="option-id">ID: {v.id}</span>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                  {!!groupErrMsg && (
                    <div className="err-msg">
                      <i className="icon-error" />
                      {groupErrMsg}
                    </div>
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
                        href={`${PREFIXOWN}/firmware/downloadGrayTemplate`}
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
                      2、如果您已批量上传过设备ID，再次上传时，建议先下载已上传过的设备ID，并在下方进行追加，否则原有数据将会被覆盖
                    </div>
                    <Upload
                      className="upload-box"
                      name="file"
                      action={`firmware/uploadGrayscale?version=${firmwareInfo.version}&deviceMetaId=${firmwareInfo.deviceMetaId}`}
                      multiple={false}
                      showUploadList={false}
                      onChange={handleUploadChange}
                      beforeUpload={beforeUpload}
                    >
                      <Button type="primary">批量上传设备ID</Button>
                    </Upload>
                    <div className="upload-status">
                      <span className="filename">
                        {fileInfo.fileList[0] && fileInfo.fileList[0].name}
                      </span>
                      {!fileInfo.fileUrlErr &&
                        fileInfo.fileUploadStatus === 'uploading' && (
                          <span className="uploading-status">上传中...</span>
                        )}
                      {fileInfo.successUrl && (
                        <a
                          className="ml-10 cursor-pointer"
                          href={fileInfo.successUrl}
                          download
                        >
                          下载
                        </a>
                      )}
                      {fileInfo.fileList.length > 0 &&
                        fileInfo.fileUploadStatus === 'done' && (
                          <div>
                            {fileInfo.successTotal > 0 && (
                              <span>
                                成功上传
                                <span className="primary-color">
                                  {fileInfo.successTotal}
                                </span>
                                条
                              </span>
                            )}

                            {fileInfo.failureTotal > 0 && (
                              <span>
                                失败
                                <span className="err-msg">
                                  {fileInfo.failureTotal}
                                </span>
                                条，点击
                                <a
                                  href={fileInfo.failureUrl}
                                  download
                                  className="cursor-pointer"
                                >
                                  下载失败设备ID列表
                                </a>
                                并进行排查
                              </span>
                            )}
                          </div>
                        )}
                      {fileInfo.fileUrlErr && (
                        <span className="err-msg ml-10">
                          <span className="icon-error" />
                          {fileInfo.fileUrlErr}
                        </span>
                      )}
                    </div>
                    <div className="upload-rule">
                      仅支持xls、xlsx格式文件，文件大小不得超过200kb
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
    </FirmwareProvider>
  );
}

export default withRouter(HandleGrayscale);
