import { Button, Form, Input, Row, Col, Popover, Tooltip, Upload } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import Textarea from 'components/TextArea';
import SlideBox from 'components/SlideLayout/index';
import Toast from 'components/SimpleToast';

import { VersionItem, ModelInfo } from 'application/thingTypeCenter/types';
import { useParams } from 'react-router-dom';
import HistoryVersion from '../historyVersion/historyVersion';
import { ThingModelContent, ThingModelInfo } from '../../../types/thingModel';
import {
  getVersionListByThingType,
  queryThingModelInfo,
  deleteThingModelVersion,
} from '../../../services/thingModelApi';
import {
  ctx,
  SET_CURRENT_VERSION,
  SET_THING_MODEL_INFO,
  SET_VERSION_LIST,
  SET_REFRESH_VERSION_LIST,
} from '../thingModelContext';

import { thingModelData } from '../../../mock';

import './index.less';
import { RcFile } from 'antd/lib/upload';

interface RouterParam {
  status: string;
  id: string;
  tab: string;
}
interface BasicThingModelInfoFormProps extends FormComponentProps {
  setFormDirty: (flag: boolean) => void;
  syncBasicThingModelInfo?: (val: {
    name: string;
    description: string;
    thingModelVersion: string;
  }) => void;
}

const BasicThingModelInfo = forwardRef<
  FormComponentProps,
  BasicThingModelInfoFormProps
>(({ form, setFormDirty }: BasicThingModelInfoFormProps, ref) => {
  useImperativeHandle(ref, () => ({
    form,
  }));
  const { getFieldDecorator, setFieldsValue } = form;
  const { nodeType } = useParams<{ id: string; nodeType: string }>();
  const { state, dispatch } = useContext(ctx);
  const {
    currentVersion,
    thingModelInfo,
    versionList,
    refreshVersionList,
  } = state;
  const { id } = useParams<RouterParam>();

  const [showSlideBox, setShowSlideBox] = useState(false);

  const [versionPopoverVisible, setVersionPopoverVisible] = useState(false);

  const [hasUnpublishedVersion, setHasUnpublishedVersion] = useState<boolean>(
    false
  );

  const [fileList, setFileList] = useState<RcFile[]>();
  // 根据物模型Id获取版本列表
  const getVersionLists = useCallback(async () => {
    if (!refreshVersionList) return;
    try {
      const res = await getVersionListByThingType({
        thingTypeId: id,
        order: 'ASC', // DESC 降 ASC 升
        changeLogReturned: true,
      });
      if (res) {
        const data = res || [];
        dispatch({
          type: SET_VERSION_LIST,
          versionList: data,
        });
        dispatch({
          type: SET_REFRESH_VERSION_LIST,
          refreshVersionList: false,
        });
        const unpublishedVersion: VersionItem[] = data.filter(
          (item: VersionItem) => item.publishedStatus === 0
        );
        if (unpublishedVersion.length) {
          setHasUnpublishedVersion(true);
          dispatch({
            type: SET_CURRENT_VERSION,
            currentVersion: {
              id: unpublishedVersion[0].id,
              thingModelVersion: unpublishedVersion[0].thingModelVersion,
              publishedStatus: 0,
            },
          });
        } else {
          setHasUnpublishedVersion(false);
          dispatch({
            type: SET_CURRENT_VERSION,
            currentVersion: {
              id: data[data.length - 1].id,
              thingModelVersion: data[data.length - 1].thingModelVersion,
              publishedStatus: 1,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.msg);
    }
  }, [dispatch, id, refreshVersionList]);
  useEffect(() => {
    getVersionLists();
  }, [getVersionLists]);

  // 根据版本Id和version获取物模型信息
  const getThingModelInfoByVersion = useCallback(async () => {
    if (!currentVersion.id) return;
    try {
      const data = await queryThingModelInfo({
        thingModelId: currentVersion.id,
        modelVersion: currentVersion.thingModelVersion,
      });
      const dataNew = { ...thingModelData, ...data };
      if (data.content) {
        // 字符串转成json格式
        const $content: ThingModelContent =
          typeof data.content === 'string'
            ? JSON.parse(data.content)
            : data.content;
        dataNew.content = $content;
      } else {
        dataNew.content = { models: [] };
      }
      dispatch({
        type: SET_THING_MODEL_INFO,
        thingModelInfo: dataNew,
      });
      setFieldsValue({
        description: dataNew.description,
        thingModelVersion: dataNew.thingModelVersion,
      });
      setFormDirty(false);
    } catch (error) {
      console.log(error);
    }
  }, [currentVersion, dispatch, setFieldsValue, setFormDirty]);
  // 选中的当前版本变化时。查询物模型信息
  useEffect(() => {
    getThingModelInfoByVersion();
  }, [getThingModelInfoByVersion]);

  // 选择物模型版本
  const selectVersion = (value: VersionItem) => {
    dispatch({
      type: SET_CURRENT_VERSION,
      currentVersion: {
        id: value.id,
        thingModelVersion: value.thingModelVersion,
        publishedStatus: value.publishedStatus,
      },
    });
    setVersionPopoverVisible(false);
  };
  // 新增物模型版本
  const clickAddVersion = () => {
    const newVersion = {
      id: '',
      thingModelVersion: '',
      publishedStatus: 0,
    };
    dispatch({
      type: SET_CURRENT_VERSION,
      currentVersion: newVersion,
    });
    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: { ...thingModelInfo, ...newVersion },
    });
  };

  // 取消新增物模型版本
  const cancelAddVersion = () => {
    const newVersion = {
      id: versionList[versionList.length - 1].id,
      thingModelVersion: versionList[versionList.length - 1].thingModelVersion,
      publishedStatus: versionList[versionList.length - 1].publishedStatus,
    };
    dispatch({
      type: SET_CURRENT_VERSION,
      currentVersion: newVersion,
    });
    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: { ...thingModelInfo, ...newVersion },
    });
  };

  /** 模型操作相关 end */
  const openSlieBox = () => {
    setShowSlideBox(true);
  };
  const closeSlideBox = () => {
    setShowSlideBox(false);
  };

  /**删除版本 */
  const deleteVersion = (version: VersionItem) => {
    deleteThingModelVersion({
      modelId: id,
      modelVersion: version.thingModelVersion,
    }).then((res) => {
      if (res.code === '200') {
        console.log('sahngchu ');
        Toast('删除成功');
        dispatch({
          type: 'SET_REFRESH_VERSION_LIST',
          refreshVersionList: true,
        });
      }
    });
  };
  /** 删除文件 */
  const removeFileList = () => {
    setFileList([]);
  };

  /** 上传模型文件 */
  const readModelJson = (file: RcFile) => {
    console.log(file);
    const isJson = file.type === 'application/json';
    if (!isJson) {
      Toast('请上传json文件');
      return false;
    }
    setFileList([file]);
    const reader = new FileReader();
    reader.readAsText(file, 'utf-8');
    reader.onload = (e) => {
      let thingModelContent:
        | ThingModelInfo
        | {
            description: string;
            'thing-model-version': string;
            models: ModelInfo[];
          };
      if (e.target && e.target.result) {
        const modelContent = JSON.parse(e.target.result as string);
        console.log(modelContent);
        /* 上传导出的模型，格式同协议文档 https://git.jd.com/tpaas-iot/spec-doc/tree/master/thing_spec
        需要转换成api定义的格式
         */
        if (
          !modelContent.hasOwnProperty('content') &&
          Object.prototype.toString.call(modelContent).toLowerCase() ===
            '[object object]'
        ) {
          thingModelContent = {
            id: modelContent.id,
            thingModelVersion: modelContent['thing-model-version'],
            description: modelContent.description,
            content: { models: modelContent.models },
          };
        } else {
          thingModelContent = modelContent;
        }

        dispatch({
          type: SET_THING_MODEL_INFO,
          thingModelInfo: {
            ...(thingModelContent as ThingModelInfo),
          },
        });
        setFieldsValue({
          description: modelContent.description,
          thingModelVersion: modelContent['thing-model-version'],
        });
      }
    };

    return false;
  };

  /** 导出物模型文件 */

  const exportThingModel = () => {
    const { enhanceContent } = thingModelInfo;
    console.log('enhanceContentStr:', typeof enhanceContent);
    const exportInfo = enhanceContent
      ? JSON.parse(enhanceContent)
      : thingModelInfo;
    console.log('enhanceContent:', exportInfo);
    const data = JSON.stringify(exportInfo);
    const blob = new Blob([data], { type: 'text/json' });
    const linkEle = document.createElement('a');
    linkEle.download =
      thingModelInfo.thingTypeId! +
      '-' +
      thingModelInfo.thingModelVersion! +
      '.json';
    linkEle.style.display = 'none';
    linkEle.href = URL.createObjectURL(blob);
    document.body.appendChild(linkEle);
    linkEle.click();
    document.body.removeChild(linkEle);
  };

  return (
    <>
      <Form
        className="basic-info-form thing-model-brief"
        colon={false}
        layout="inline"
      >
        <Row className="basic-form-row">
          <Col span={24}>
            <Form.Item label="物模型描述">
              {getFieldDecorator('description')(
                <Textarea
                  disabled={currentVersion.publishedStatus === 1}
                  maxLength={200}
                  height={60}
                  placeholder="请输入物模型描述"
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row align-top">
          <Col span={12}>
            <Form.Item label="物模型版本号">
              {getFieldDecorator('thingModelVersion', {
                rules: [
                  { required: true, message: '请输入物模型版本号' },
                  {
                    pattern: /^[v|V]?\d{1,4}(\.\d{1,4}){2}$/,
                    message:
                      '请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0',
                  },
                ],
              })(
                <Input
                  disabled={currentVersion.publishedStatus === 1}
                  placeholder="请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0"
                />
              )}
            </Form.Item>
            <Tooltip title="请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0">
              <div className="primary-color rule">查看规则</div>
            </Tooltip>
            {currentVersion.thingModelVersion ? (
              <>
                <Popover
                  overlayClassName="version-list-hover"
                  trigger="click"
                  placement="bottom"
                  visible={versionPopoverVisible}
                  onVisibleChange={(visible) => {
                    setVersionPopoverVisible(visible);
                  }}
                  content={
                    <ul className="version-list-box">
                      {versionList.map((item: VersionItem) => (
                        <li key={item.thingModelVersion}>
                          <div onClick={() => selectVersion(item)}>
                            {item.thingModelVersion}(
                            {item.publishedStatus === 1 ? '已发布' : '未发布'})
                          </div>
                          {nodeType !== '4' && (
                            <span
                              className="icon icon-delete"
                              onClick={() => deleteVersion(item)}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <div className="primary-color cursor-pointer switch-version">
                    切换版本
                  </div>
                </Popover>
                {!!versionList.length &&
                  !hasUnpublishedVersion &&
                  nodeType !== '4' && (
                    <Button
                      disabled={versionList.length >= 10}
                      type="link"
                      onClick={clickAddVersion}
                    >
                      + 新增物模型版本
                    </Button>
                  )}
              </>
            ) : (
              <>
                {!!versionList.length && !currentVersion.thingModelVersion && (
                  <Button type="primary" onClick={cancelAddVersion}>
                    取消
                  </Button>
                )}
              </>
            )}
          </Col>
          <Col span={9}>
            <div className="uploadmodel-area">
              <Button
                type="primary"
                className="mr-10"
                onClick={exportThingModel}
              >
                导出物模型
              </Button>
              {nodeType !== '4' && (
                <Upload
                  beforeUpload={readModelJson}
                  onRemove={removeFileList}
                  fileList={fileList}
                  disabled={currentVersion.publishedStatus === 1}
                  className="upload"
                >
                  <Popover
                    placement="top"
                    content={
                      <div>请上传物模型json文件，上传内容将会覆盖已有模型</div>
                    }
                  >
                    <Button
                      type="primary"
                      disabled={currentVersion.publishedStatus === 1}
                    >
                      <span className="icon-upload mr-10"></span>导入物模型
                    </Button>
                  </Popover>
                </Upload>
              )}
            </div>
          </Col>
          <Col span={3}>
            <div className="version-area">
              <div className="view-history" onClick={openSlieBox}>
                <span className="icon-version" /> 历史版本
              </div>
            </div>
          </Col>
        </Row>
      </Form>
      <SlideBox
        style={{ height: 500 }}
        visible={showSlideBox}
        closeSlideBox={closeSlideBox}
      >
        <HistoryVersion versionList={versionList} />
      </SlideBox>
    </>
  );
});

export default Form.create<BasicThingModelInfoFormProps>({
  name: 'advanced_search',
  onValuesChange: (
    props: BasicThingModelInfoFormProps,
    changedValues: any,
    allValues: any
  ) => {
    props.syncBasicThingModelInfo && props.syncBasicThingModelInfo(allValues);
    props.setFormDirty(true);
  },
})(BasicThingModelInfo);
