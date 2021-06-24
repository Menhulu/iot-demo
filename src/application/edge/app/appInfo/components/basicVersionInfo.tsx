/*
 * @Author:
 * @Date: 2021-01-21 21:08:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-04-15 20:57:36
 */
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import { Form, Input, Upload, Radio, Button, Progress, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import axios from 'axios'
import { DigestAlgorithm, Hardware, OS } from '../../../constants';
import { edgeVersionReg, edgeVersionRule } from 'utils/constants';
import './style.less';
import { useParams } from 'react-router-dom';
import { EdgeAppVersionInfo, PresignUrlParam } from 'application/edge/types';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { generatePresignedUrl } from 'application/edge/service';

export interface BasicVersionInfoProps extends FormComponentProps {
  appVersionData?: Partial<EdgeAppVersionInfo>;
  type: 'create' | 'edit';
  onFileChange: (param: any) => void
  begainUpload: { beginFlag: boolean, progress: number }
  cancelUpload: (param?: any) => void
}
const BasicVersionInfo: React.FC<BasicVersionInfoProps> = forwardRef(
  ({ appVersionData, type, onFileChange, begainUpload, cancelUpload, form }, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const { appId } = useParams<{ appId: string }>();
    const { getFieldDecorator, setFieldsValue, resetFields } = form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
      colon: false,
    };
    const [fileUrlErr, setFileUrlErr] = useState<string>();
    const [presignUrl, setPresignUrl] = useState<string>() // 对象存储预签名URL
    const { beginFlag, progress } = begainUpload

    // 编辑态查询版本信息
    useEffect(() => {
      console.log(appVersionData);
      if (appVersionData) {
        const { version, digestAlgorithm, digest, hardware } = appVersionData;
        setFieldsValue({
          version,
          digest,
          digestAlgorithm: digestAlgorithm || 'MD5',
          hardware: hardware || 'arm64',
        });
      } else {
        resetFields();
      }
    }, [appVersionData, resetFields, setFieldsValue]);

    const beforeUpload = (file: RcFile) => {
      console.log(file);

      setFileUrlErr('');
      const isZip = /.(tar.gz|tgz)$/.test(file.name);
      if (!isZip) {
        setFileUrlErr('请上传 tar.gz、tgz 格式的压缩包');
      }
      const isLimited1G = file.size / 1024 / 1024 / 1024 <= 1;
      if (!isLimited1G) {
        setFileUrlErr('请上传1G以内的文件包');
      }

      return false;
    };
    const uploadOnChange = async (info: UploadChangeParam<any>) => {
      const { file, fileList } = info;
      // 生成预签名url
      const param = {
        appId: parseInt(appId),
        fileName: file.name
      }
      try {
        const res = await generatePresignedUrl(param);
        if (res && res.code == 200) {
          onFileChange(res.data)
        }
      } catch (error) {
        console.log(error);
      }

    };
    const normFile = (e: any) => {
      console.log('Upload event:', e);
      if (Array.isArray(e)) {
        return e;
      }
      return e && e.fileList.slice(-1);
    };

    return (
      <Form {...formItemLayout} className="form-wrap">
        <h3 className="pb-20 pl-20">应用信息</h3>
        {type === 'create' ? (
          <Form.Item label="镜像包上传">
            {getFieldDecorator('fileList', {
              valuePropName: 'fileList',
              getValueFromEvent: normFile,
              rules: [{ required: true, message: '请上传镜像包' }],
            })(
              <Upload
                name="fileList"
                beforeUpload={beforeUpload}
                onChange={uploadOnChange}
                onRemove={() => {
                  cancelUpload();
                }
                }
              >
                <Button type="default">
                  <span className="icon-upload mr-10" /> 上传
                </Button>
              </Upload>
            )}
            {beginFlag && (<div className='upload-pro'><Progress className='upload-progress' percent={progress} />
              {progress < 100 && <Button className='upload-cancel-btn' type='link' onClick={cancelUpload}>取消</Button>}</div>)}
            <span className="desc">请上传 tar.gz、tgz 格式的压缩包</span>
            {fileUrlErr && <div className="err-msg">{fileUrlErr}</div>}
          </Form.Item>
        ) : (
            <Form.Item label="镜像包上传">
              <a download href={appVersionData?.packageUrl}>
                {appVersionData?.packageName}
              </a>
            </Form.Item>
          )}

        <Form.Item label="应用版本">
          {getFieldDecorator('version', {
            rules: [{ required: true, message: '请填写应用版本' }, {
              pattern: edgeVersionReg,
              message: edgeVersionRule,
            },],
          })(
            <Input placeholder="请输入应用版本号" disabled={type === 'edit'} />
          )}
          <Tooltip title="请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0">
            <div className="primary-color rule-tips">查看规则</div>
          </Tooltip>
        </Form.Item>
        <Form.Item label="签名算法">
          {getFieldDecorator('digestAlgorithm', {
            initialValue: 'MD5',
            rules: [{ required: true, message: '请填写签名算法' }],
          })(
            <Radio.Group disabled={type === 'edit'} >
              {DigestAlgorithm.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="签名值">
          {getFieldDecorator('digest', {
            rules: [{ required: true, message: '请填写签名值' }],
          })(<Input placeholder="请输入签名值" disabled={type === 'edit'} />)}
        </Form.Item>
        <Form.Item label="硬件平台">
          {getFieldDecorator('hardware')(
            <Radio.Group>
              {Hardware.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="操作系统">
          {getFieldDecorator('os', { initialValue: 'Linux' })(
            <Radio.Group>
              {OS.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
      </Form>
    );
  }
);
export default Form.create<BasicVersionInfoProps>()(BasicVersionInfo);
