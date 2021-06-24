/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2021-01-21 10:23:30
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-31 17:07:24
 */
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';

import { Form, Input, Radio } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import TextArea from 'components/TextArea';
import { CpuShares, RestartPolicy } from '../../../constants';

import Env from './env';
import PortMapping from './portMapping';
import Volume from './volume';

import './style.less';

export interface ContainerParamsProps extends FormComponentProps {
  data?: any;
  onlyContainerParams?: boolean;
  setFlag?: (flag: boolean) => void;
  preTitle?: string;
  disabled?: boolean;
}

const ContainerParams: React.FC<ContainerParamsProps> = forwardRef(
  ({ data, onlyContainerParams, preTitle, disabled, form }, ref) => {
    useImperativeHandle(ref, () => ({
      form,
    }));
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
      colon: false,
    };
    const { getFieldDecorator, setFieldsValue, resetFields } = form;

    // 编辑态表单赋值
    useEffect(() => {
      console.log('----====', data);
      if (data) {
        const {
          cpuShares,
          memoryLimit,

          isPrivileged,
          restartPolicy,
          env,
          portMapping,
          volume,
          useHosts,
          entryPoint,
        } = data;
        const fieldsValue: Record<string, any> = {
          cpuShares: cpuShares || 'Normal',
          memoryLimit,
          isPrivileged: isPrivileged || false,
          restartPolicy: restartPolicy || 'Always',
          env,
          portMapping,
          volume,
          useHosts: useHosts || false,
          entryPoint,
        };
        if (!onlyContainerParams) {
          fieldsValue.appConfig = data.appConfig;
        }
        setFieldsValue({ ...fieldsValue });
      } else {
        resetFields();
      }
    }, [data, setFieldsValue, resetFields, onlyContainerParams]);

    return (
      <Form {...formItemLayout} className="form-wrap">
        <h3 className="pad20">{preTitle}容器参数</h3>
        <Form.Item label="CPU优先级">
          {getFieldDecorator('cpuShares', { initialValue: 'Normal' })(
            <Radio.Group disabled={disabled}>
              {CpuShares.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="内存限制">
          {getFieldDecorator('memoryLimit', {
            rules: [
              { required: true, message: '请填写内存限制' },
              { pattern: /[0-9]+/, message: '请填写数字' },
            ],
          })(<Input placeholder="请输入数字" disabled={disabled} />)}
          <span className="ml-10">MB (说明：如无限制，请填0)</span>
        </Form.Item>

        <Form.Item label="特权模式">
          {getFieldDecorator('isPrivileged', {
            rules: [{ required: true, message: '特权模式不能为空' }],
            initialValue: false,
          })(
            <Radio.Group disabled={disabled}>
              <Radio key="1" value={true}>
                是
              </Radio>
              <Radio key="2" value={false}>
                否
              </Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="重启策略">
          {getFieldDecorator('restartPolicy', {
            rules: [{ required: true, message: '重启策略不能为空' }],
            initialValue: 'Always',
          })(
            <Radio.Group disabled={disabled}>
              {Object.keys(RestartPolicy).map((key) => (
                <Radio key={key} value={key}>
                  {RestartPolicy[key as keyof typeof RestartPolicy]}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="使用宿主机host模式">
          {getFieldDecorator('useHosts', { initialValue: false })(
            <Radio.Group disabled={disabled}>
              <Radio key="1" value={true}>
                是
              </Radio>
              <Radio key="2" value={false}>
                否
              </Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="EntryPoint">
          {getFieldDecorator('entryPoint', { initialValue: '' })(
            <Input placeholder="请输入EntryPoint" maxLength={1024} />
          )}
        </Form.Item>
        <Form.Item label="环境变量">
          {getFieldDecorator('env')(<Env disabled={disabled} />)}
        </Form.Item>
        <Form.Item label="端口映射">
          {getFieldDecorator('portMapping')(
            <PortMapping disabled={disabled} />
          )}
        </Form.Item>
        <Form.Item label="卷映射">
          {getFieldDecorator('volume')(<Volume disabled={disabled} />)}
        </Form.Item>
        {onlyContainerParams ? null : (
          <>
            <h3 className="pad20">{preTitle}应用配置</h3>
            <Form.Item label="应用配置">
              {getFieldDecorator('appConfig')(
                <TextArea disabled={disabled} maxLength={2000} />
              )}
            </Form.Item>
          </>
        )}
      </Form>
    );
  }
);
export default Form.create<ContainerParamsProps>({
  onValuesChange: (props) => {
    props.setFlag && props.setFlag(true);
  },
})(ContainerParams);
