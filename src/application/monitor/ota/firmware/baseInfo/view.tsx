import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Form, Row, Col } from 'antd';

import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';

import { getFirmwareInfo } from '../../../services';
import { FirmwareData } from '../../../types';

import './index.less';
import Header from 'components/Header';

interface ViewFirmwareFormProps {}
function ViewFirmware(props: ViewFirmwareFormProps) {
  const [firmwareInfo, setFirmwareInfo] = useState<FirmwareData>();
  const { firmwareId } = useParams<{ firmwareId: string }>();

  const fetchFirmwareInfo = useCallback(() => {
    getFirmwareInfo({ firmwareId })
      .then((res) => {
        console.log(res, 'getFirmwareInfo---');
        res && setFirmwareInfo(res.data);
      })
      ['catch']((err) => {
        Toast('固件信息查询失败');
      });
  }, [firmwareId]);

  useEffect(() => {
    fetchFirmwareInfo();
  }, [fetchFirmwareInfo]);

  return (
    <>
      <Header back to="/firmware/list" title="查看固件包" />
      <ObtainHeight bgColor="#fff">
        <div className="firmware-wrap">
          <Form className="basic-info-form" colon={false} layout="inline">
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="物类型">
                  <span>{firmwareInfo?.thingTypeCode}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="版本号">
                  <span>{firmwareInfo?.versionNo}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="可升级固件版本号">
                  <span>{firmwareInfo?.srcVersion}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="固件签名">
                  {firmwareInfo?.signature}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="签名算法">
                  {firmwareInfo?.algorithm}
                </Form.Item>
              </Col>
            </Row>

            <Row className="basic-form-row">
              <Col span={12}>
                <Form.Item label="固件包名称">
                  {firmwareInfo?.packageName}
                  <a
                    className="download"
                    href={firmwareInfo?.packageUrl}
                    download
                  >
                    点击下载
                  </a>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="备注">{firmwareInfo?.changeLog}</Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </ObtainHeight>
    </>
  );
}

export default ViewFirmware;
