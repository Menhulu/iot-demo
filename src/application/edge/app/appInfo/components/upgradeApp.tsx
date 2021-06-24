import React, { useState, useEffect, useRef } from 'react';

import { Form, Button, Drawer, Select } from 'antd';

import ContainerParams from './containerParams';

import './style.less';

import Toast from 'components/SimpleToast';
import { getEdgeAppVersionList, upgradeApp } from 'application/edge/service';
import {
  EdgeAppVersionInfo,
  QueryAppVersionParam,
} from 'application/edge/types';
import { FormComponentProps } from 'antd/lib/form';

import { useParams } from 'react-router-dom';

export interface UpgradeAppProps extends FormComponentProps {
  title: string;
  visible: boolean;
  closeDrawer: (flag?: true) => void;
  edgeParamsData?: Partial<EdgeAppVersionInfo>;
  cycleRefresh: () => void;
}

const UpgradeApp: React.FC<UpgradeAppProps> = ({
  title,
  visible,
  edgeParamsData,
  closeDrawer,
  cycleRefresh,
  form,
}) => {
  const { appId } = useParams<{ appId: string }>();
  const { Option } = Select;
  const { getFieldDecorator } = form;
  const containerParamsRef = useRef<any>();
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 19 },
    colon: false,
  };
  const [versionList, setVersionList] = useState<EdgeAppVersionInfo[]>([]);
  const [versionInfo, setVersionInfo] = useState<EdgeAppVersionInfo>();
  useEffect(() => {
    const versionId = edgeParamsData?.versionId;

    const initQueryParam: QueryAppVersionParam = {
      condition: { appId: edgeParamsData?.appId || appId },
      pageNo: 1,
      pageSize: 50,
    };
    versionId &&
      getEdgeAppVersionList(initQueryParam).then((res) => {
        if (res.success) {
          const list = res.data.list;
          setVersionList(list);
        }
      });
  }, [appId, edgeParamsData]);
  // 选择版本
  const selectVersion = (val: string) => {
    const curVersionInfo = versionList.find((item) => item.id == val);
    console.log(val, versionList, curVersionInfo);
    setVersionInfo(curVersionInfo);
  };
  // 保存固件
  const submitUpdateApp = async (params: FormData) => {
    try {
      const res = await upgradeApp(params);
      if (res && res.code == 200) {
        Toast('保存成功');
        closeDrawer(true);
        cycleRefresh();
      }
    } catch (error) {
      console.log(error);
    }
  };
  // 保存版本信息
  const saveAppVersion = () => {
    form.validateFields((err, val) => {
      containerParamsRef.current.validateFields((errors: any, values: any) => {
        if (!errors && !err) {
          console.log(values);
          submitUpdateApp({
            ...values,
            id: val.versionId,
            appId: edgeParamsData?.appId,
            edgeOid: edgeParamsData?.edgeOid,
          });
        }
      });
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
        <Form {...formItemLayout}>
          <Form.Item label="应用版本">
            {getFieldDecorator('versionId', {
              rules: [{ required: true, message: '请选择应用版本' }],
            })(
              <Select placeholder="请选择应用版本" onChange={selectVersion}>
                {versionList.map((item) => (
                  <Option
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                  >
                    {item.version}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
        {/* 容器参数 & 应用配置 */}
        <ContainerParams ref={containerParamsRef} data={versionInfo} />
        <div className="drawer-footer">
          <Button onClick={() => closeDrawer()}>取消</Button>
          <Button onClick={saveAppVersion} type="primary">
            确定
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
export default Form.create<UpgradeAppProps>()(UpgradeApp);
