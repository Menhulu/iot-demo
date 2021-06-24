import { Form, Row, Col } from 'antd';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { EditContext } from 'application/deviceManageCenter/editDevice/context';
import './basicInfo.less';
import { queryThingType } from 'application/thingTypeCenter/services/index';
import { PREFIXOWN } from 'utils/constants';
function DeviceInfoCom(props: any) {
  const { state } = useContext(EditContext);
  const { deviceInfo } = state;
  const { nodeInfo } = props;
  // 物类型信息
  const [thingTypeInfo, setThingTypeInfo] = useState<any>({
    os: '',
    hardware: '',
  });
  // 查询物类型信息
  const queryModeInfo = (id: string) => {
    queryThingType({ code: id })
      .then((res) => {
        if (res.code === 200) {
          setThingTypeInfo(res.data);
        }
      })
      ['catch']((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (deviceInfo.thingTypeCode) {
      queryModeInfo(deviceInfo.thingTypeCode);
    }
  }, [deviceInfo]);

  // 下载toml文件
  const downloadConfig = () => {
    downloadFile(
      `[EdgeInfo]
  EdgeID = '${deviceInfo.deviceId}'
  EdgeName = '${deviceInfo.deviceName}'
[HubEndpoint]
  Address = '10.170.224.12'
  Port = 8883`,
      'configuration.toml'
    );
  };
  const downloadFile = (content: any, filename: any) => {
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    eleLink.href = window.URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  };

  return (
    <div className="device-info">
      {/* <ObtainHeight bgColor="#fff"> */}
      <Form className="basic-info-form" layout="inline" colon={false}>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="注册时间">
              {deviceInfo.createTime
                ? dayjs(deviceInfo.createTime).format('YYYY-MM-DD HH:mm:ss')
                : '--'}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="激活时间">
              {deviceInfo.activateTime
                ? dayjs(deviceInfo.activateTime).format('YYYY-MM-DD HH:mm:ss')
                : '--'}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="开机时间">
              {nodeInfo.hostBootTime
                ? dayjs(nodeInfo.hostBootTime).format('YYYY-MM-DD HH:mm:ss')
                : '--'}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="边缘引擎版本">
              {nodeInfo.edgeVersion || '--'}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="操作系统">{thingTypeInfo.os || '--'}</Form.Item>
            {/* <Form.Item label="操作系统">{nodeInfo.hostOs}</Form.Item> */}
          </Col>
          <Col span={12}>
            <Form.Item label="操作系统平台">{nodeInfo.hostPlatform}</Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="硬件平台">
              {thingTypeInfo.hardware || '--'}
            </Form.Item>
            {/* <Form.Item label="硬件平台">{nodeInfo.cpuArch}</Form.Item> */}
          </Col>
          <Col span={12}>
            <Form.Item label="操作系统平台版本">
              {nodeInfo.hostPlatformVersion}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="内存大小">{nodeInfo.memTotal}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="主机名称">{nodeInfo.hostName}</Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="网卡名称">{nodeInfo.netInterface}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="网卡物理地址">{nodeInfo.netMacAddr}</Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="IPV4地址">{nodeInfo.netIpv4Addr}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="IPV6地址">{nodeInfo.netIpv6Addr}</Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={12}>
            <Form.Item label="CPU型号">{nodeInfo.cpuModelName}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="下载">
              <a
                href={`${PREFIXOWN}/device/downloadCertificate?deviceId=${deviceInfo.deviceId}`}
                download
                style={{ marginRight: 12 }}
              >
                证书
              </a>
              <a
                href={`${deviceInfo.edgeEngineUrl}`}
                download
                style={{ marginRight: 12 }}
              >
                边缘运行引擎安装包
              </a>
              {/* <span
                className="cursor-pointer primary-color"
                style={{ verticalAlign: 'middle' }}
                onClick={() => {
                  downloadConfig();
                }}
              >
                配置文件
              </span> */}
            </Form.Item>
          </Col>
        </Row>
        <Row
          className="basic-form-row"
          hidden={
            !nodeInfo.catalogOneMountPoint && !nodeInfo.catalogTwoMountPoint
          }
        >
          <Col span={12} hidden={!nodeInfo.catalogOneMountPoint}>
            <Form.Item label={nodeInfo.catalogOneMountPoint + '目录大小'}>
              {nodeInfo.catalogOneTotal}
            </Form.Item>
          </Col>
          <Col span={12} hidden={!nodeInfo.catalogTwoMountPoint}>
            <Form.Item label={nodeInfo.catalogTwoMountPoint + '目录大小'}>
              {nodeInfo.catalogTwoTotal}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {/* </ObtainHeight> */}
    </div>
  );
}
export default Form.create<any>({})(DeviceInfoCom);
