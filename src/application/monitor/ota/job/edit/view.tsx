import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Form, Row, Col } from 'antd';

import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import Toast from 'components/SimpleToast/index';

import { getFirmwareInfo } from '../../../services';
import { FirmwareData } from '../../../types';

import './index.less';

interface ViewFirmwareFormProps {}
function ViewFirmware(props: ViewFirmwareFormProps) {
  enum InstallModel {
    立即升级 = 0,
    定时安装 = 3,
    闲时安装 = 4,
  }
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
    <ObtainHeight bgColor="#fff">
      <div className="job-wrap">
        <Form className="basic-info-form" colon={false} layout="inline">
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="物类型">
                <span>{firmwareInfo?.thingTypeName}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="固件ID">
                <span>{firmwareInfo?.version}</span>
              </Form.Item>
            </Col>
          </Row>
          <Row className="basic-form-row">
            <Col span={12}>
              <Form.Item label="升级模式">
                <span>{InstallModel[firmwareInfo?.installModel]}</span>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="升级范围">
                <span>{firmwareInfo?.scope === 1 ? '全量' : '设备'}</span>
              </Form.Item>
            </Col>
          </Row>
          {firmwareInfo?.scope === 2 && (
            <>
              <Row className="basic-form-row">
                <Col span={24}>
                  <Form.Item
                    label={
                      <>
                        <span className="icon-required primary-color" />
                        设备范围
                      </>
                    }
                  >
                    {firmwareInfo.grayscaleType === 1 ? '设备ID' : '设备分组'}
                  </Form.Item>
                </Col>
              </Row>
              <Row className="sub-item basic-form-row">
                {firmwareInfo.grayscaleType === 2 ? (
                  <Col span={12}>
                    <Form.Item label="设备分组" className="gray-scale">
                      {}
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={24}>
                    <div className="upload-devices">
                      <div className="empty-box"></div>
                      <div className="gray-scale"></div>
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Form>
      </div>
    </ObtainHeight>
  );
}

export default ViewFirmware;
