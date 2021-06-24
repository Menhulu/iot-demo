/*
 * @Author:
 * @Date: 2021-01-25 11:29:41
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-12 15:20:48
 */
import React, { ReactNode, useEffect, useState } from 'react';
import Modal from 'components/Modal';
import { Form, Tooltip } from 'antd';
import './style.less';
import { FormComponentProps } from 'antd/lib/form';
import TextArea from 'components/TextArea';

import { updateAppConfig, queryEdgeAppInfo } from '../../../service';
import { AppDeploymentItem } from 'application/edge/types';
export interface AppConfigModalProps extends FormComponentProps {
  visible: boolean;
  data?: AppDeploymentItem;
  closeModal: (flag?: boolean) => void;
  cycleRefresh: () => void;
  saveLocal?: boolean; //部署前的修改应用参数，不调用接口，只在本地缓存。点击部署时从本地获取数据
}

const AppConfigModal: React.FC<AppConfigModalProps> = ({
  visible,
  form,
  data,
  closeModal,
  cycleRefresh,
  saveLocal,
}) => {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
  };
  const { getFieldDecorator } = form;
  const handleCancel = () => {
    closeModal();
  };

  const [desc, setDesc] = useState<string>();

  const saveAppConfig = () => {
    if (data?.pageType === 'view') {
      closeModal();
    } else {
      form.validateFields((err, val) => {
        if (!err) {
          console.log(val);
          if (saveLocal) {
            //部署前的修改参数，不调用接口，存在本地缓存。点击部署时从本地获取数据
            localStorage.setItem(
              'deployAppConfig',
              JSON.stringify({ ...data, val })
            );
            closeModal(true);
          } else {
            updateAppConfig({
              ...data,
              ...val,
              appCode: data?.code,
              id: data?.versionId,
            }).then((res) => {
              if (res.success) {
                closeModal(true);
                cycleRefresh();
              }
            });
          }
        }
      });
    }
  };

  const ConfigLabel: ReactNode = (
    <>
      <span>应用配置</span>
      <Tooltip title={desc} placement="right" overlayStyle={{ fontSize: 12 }}>
        <span
          className="ml-5 primary-color icon-help"
          style={{ color: '#fbc606' }}
        />
      </Tooltip>
    </>
  );

  const getAppDescription = () => {
    queryEdgeAppInfo({
      appId: data?.appId || '',
    }).then((res) => {
      if (res.success) {
        setDesc(res.data?.description || '');
      }
    });
  };

  useEffect(() => {
    if (data) {
      // 获取节点描述信息，展示在title旁
      getAppDescription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Modal
      title={data?.title}
      visible={visible}
      onCancel={handleCancel}
      onOk={saveAppConfig}
    >
      <Form className="form-wrap" {...formItemLayout}>
        {data?.pageType === 'view' ? (
          <Form.Item label={ConfigLabel}>{data?.appConfig}</Form.Item>
        ) : (
          <Form.Item label={ConfigLabel}>
            {getFieldDecorator('appConfig', { initialValue: data?.appConfig })(
              <TextArea maxLength={2000} />
            )}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
export default Form.create<AppConfigModalProps>()(AppConfigModal);
