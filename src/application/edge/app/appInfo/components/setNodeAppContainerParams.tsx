/*
 * @Author: your name
 * @Date: 2021-02-07 19:55:48
 * @LastEditTime: 2021-02-23 18:05:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \iot_webconsole_frontend\src\application\edge\app\appInfo\components\setNodeAppContainerParams.tsx
 */
import React, { useRef } from 'react';

import { Form, Button, Drawer } from 'antd';
import { FormComponentProps } from 'antd/es/form';

import ContainerParams from './containerParams';

import './style.less';

import Toast from 'components/SimpleToast';
import { updateApp } from 'application/edge/service';
import { ContainerParamsInfo } from 'application/edge/types';

export interface SetNodeAppContainerParamsProps extends FormComponentProps {
  visible: boolean;
  containerParamsData?: ContainerParamsInfo;
  closeDrawer: (flag?: boolean) => void;
  cycleRefresh: () => void;
  preTitle?: string; // 应用版本编辑时前面加【缺省】
  title?: string;
}

const SetNodeAppContainerParams: React.FC<SetNodeAppContainerParamsProps> = ({
  title,
  visible,
  containerParamsData,
  closeDrawer,
  cycleRefresh,
  preTitle,
  form,
}) => {
  const containerParamsRef = useRef<any>();

  // 保存固件
  const submitNodeAppConfig = async (params: ContainerParamsInfo) => {
    try {
      const res = await updateApp(params);
      if (res && res.code == 200) {
        Toast('保存成功');
        cycleRefresh();
        closeDrawer(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 保存版本信息
  const saveNodeAppConfig = () => {
    containerParamsRef.current.validateFields((errors: any, values: any) => {
      if (!errors) {
        console.log(values);

        submitNodeAppConfig({
          ...containerParamsData,
          ...values,
          id: containerParamsData?.versionId,
        });
      }
    });
  };

  return (
    <Drawer
      title={title}
      closable={true}
      visible={visible}
      width={818}
      onClose={() => closeDrawer()}
    >
      <div className="edgeAppVersionInfo">
        {/* 容器参数 & 应用配置 */}
        <ContainerParams
          ref={containerParamsRef}
          data={containerParamsData}
          onlyContainerParams={true}
          disabled={containerParamsData?.pageType === 'view'}
        />
        <div className="drawer-footer">
          <Button onClick={() => closeDrawer()}>取消</Button>
          {containerParamsData?.pageType === 'edit' && (
            <Button onClick={saveNodeAppConfig} type="primary">
              确定
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
};
export default Form.create<SetNodeAppContainerParamsProps>()(
  SetNodeAppContainerParams
);
