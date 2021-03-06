import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Tabs, Empty } from 'antd';
import SimpleToast from 'components/SimpleToast/index';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import { cloneDeep } from 'lodash';

import iconNull from 'static/pic/icon-null.png';

import { FormComponentProps } from 'antd/lib/form';
import FuncDefinition from './funcDefinition/index';

import JsonCode from './funcDefinition/json';
import ModelInfoModalForm from './basicModelInfo';
import PubThingModelModal from './pubThingModel';

import BasicThingModelInfo from './basicThingModelInfo';
import {
  ThingModelInfo,
  ModelInfo,
  ThingModelContent,
} from '../../types/index';
import {
  createVersion,
  editThingModel,
  pubVersion,
  checkThingModelContent,
} from '../../services/thingModelApi';

import {
  ctx,
  SET_THING_MODEL_INFO,
  SET_REFRESH_VERSION_LIST,
  SET_CURRENT_MODEL_INDEX,
} from './thingModelContext';

import './index.less';

const { TabPane } = Tabs;

interface RouterParam {
  status: string;
  id: string;
  tab: string;
}

interface ThingModelDefProps {
  setFormDirty: (flag: boolean) => void;
  formDirty: boolean;
}
function ThingModelDef(props: ThingModelDefProps) {
  const { setFormDirty, formDirty } = props;
  const { nodeType } = useParams<{ id: string; nodeType: string }>();
  const { id } = useParams<RouterParam>();

  const { state, dispatch } = useContext(ctx);
  const { currentVersion, thingModelInfo, curModelIndex } = state;

  const [isView, setIsView] = useState(false);
  const [isThingModelValidate, setIsThingModelValidate] = useState<boolean>(
    false
  );
  const [showPubModal, setShowPubModal] = useState(false);
  const [newModelShow, setNewModelShow] = useState<boolean>(false);

  const formRef = useRef<FormComponentProps>(null);

  const initModel: ModelInfo = {
    id: '',
    key: '',
    'display-name': '',
    type: 'entity',
    description: '',
    properties: [], // Property[]; // ??????????????????
    events: [],
    functions: [],
  };

  useEffect(() => {
    const viewOnly =
      thingModelInfo.publishedStatus === 1 ||
      !thingModelInfo.content.models.length;
    setIsThingModelValidate(!!thingModelInfo.thingModelVersion);
    setIsView(viewOnly);
  }, [nodeType, thingModelInfo]);
  /** ?????????????????? start */
  /**
   * @description: ?????????????????????????????????????????????
   * 1?????????????????????????????????json
   * 2????????????????????????????????????????????????????????????????????????????????????????????????????????????
   * 3: ???????????????????????????????????????????????????????????????????????????
   * @param {type}
   * @return:
   */
  const handleCheckJson = (infoStr: string): boolean => {
    if (!infoStr) return true;
    const content = infoStr.trim();
    let isPermission = true;
    try {
      const jsonObj: ModelInfo = JSON.parse(content);
      const { key, properties, events, functions } = jsonObj;
      // ???????????????,????????????key??????
      if (!key) {
        isPermission = true;
        return true;
      }
      // ?????????????????????
      if (Object.keys(jsonObj).length === 0) {
        SimpleToast('???????????????????????????');
        isPermission = false;
        return false;
      }
      if (
        properties &&
        properties.length === 0 &&
        events &&
        events.length === 0 &&
        functions &&
        functions.length === 0
      ) {
        SimpleToast('????????????????????????????????????????????????????????????');
        isPermission = false;
        return false;
      }
    } catch (err) {
      SimpleToast('JSON ?????????');
      isPermission = false;
    }
    return isPermission;
  };
  // ????????????????????????modal
  const openEditModelModal = (index: number) => {
    const isValidate = handleCheckJson(
      JSON.stringify(thingModelInfo.content.models[curModelIndex])
    );
    // ??????
    if (index === -1) {
      if (!isValidate) {
        return;
      }
    }
    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: index,
    });

    setNewModelShow(true);
  };
  // ???????????????????????????modal
  const closeModelInfoModal = () => {
    setNewModelShow(false);
    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: thingModelInfo.content.models.length - 1,
    });
  };
  // ????????????
  const saveModelName = (
    val:
      | {
          displayName: string;
          objectName: string;
          desc: string;
          [propName: string]: any;
        }
      | ModelInfo[]
  ) => {
    const newModels = cloneDeep(thingModelInfo.content.models);
    if (Array.isArray(val)) {
      newModels.push(...val);
    } else {
      console.log(val);
      const { displayName, objectName, desc, ...rest } = val;
      const newModel: ModelInfo = {
        ...thingModelInfo.content.models[curModelIndex],
        functions: [],
        properties: [],
        events: [],
        ...rest,
        description: desc,
        'display-name': displayName,
      };
      console.log(newModel);

      // ???key??????  ???????????????objectName ????????????????????????????????????1????????????????????????????????????
      /*
      let No = 0;
      let nameNo = 0;
      const numReg = /\d*$/;
      newModels.forEach((model: ModelInfo, index: number) => {
        model.key = model.key ? model.key : '';
        if (model.key.replace(numReg, '') === objectName) {
          No++;
          model.key = model.key.replace(numReg, `${No}`);
          console.log(model.key);
        }
        if (model['display-name'].replace(numReg, '') === displayName) {
          nameNo++;
          model['display-name'] = model['display-name'].replace(
            numReg,
            `${nameNo}`
          );
          console.log(model['display-name']);
        }
        // ???????????????????????????
        if (curModelIndex === index) {
          model.description = newModel.description;
        }
      });
      */
      // ??????
      if (curModelIndex === -1) {
        newModel.id = newModel.id
          ? newModel.id
          : `urn:user-spec-v1:model:${objectName}`;
        newModel.key = objectName;
        newModel.properties.forEach((item) => {
          item.key = `${objectName}.${item.id.split(':')[3]}`;
        });
        newModel.events.forEach((item) => {
          item.key = `${objectName}.${item.id.split(':')[3]}`;
          item.parameters.forEach((param) => {
            param.key = `${param.id.split(':')[3]}`;
          });
        });
        newModel.functions.forEach((item) => {
          item.key = `${objectName}.${item.id.split(':')[3]}`;
          item['in'].forEach((param) => {
            param.key = `${param.id.split(':')[3]}`;
          });
          item.out.forEach((param) => {
            param.key = `${param.id.split(':')[3]}`;
          });
        });

        // ???????????????????????? ????????????????????????
        const { length } = thingModelInfo.content.models;

        dispatch({
          type: SET_CURRENT_MODEL_INDEX,
          curModelIndex: length,
        });
        newModels.push(newModel);
      } else {
        newModels.splice(curModelIndex, 1, newModel);
      }
    }

    const modelInfo: ThingModelInfo = {
      ...thingModelInfo,
      content: { models: newModels },
    };

    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: modelInfo,
    });

    setNewModelShow(false);
  };
  // ????????????
  const delModel = (index: number) => {
    const { models } = thingModelInfo.content;
    const newModels = cloneDeep(models);
    newModels.splice(index, 1);
    const modelInfo: ThingModelInfo = {
      ...thingModelInfo,
      content: { models: newModels },
    };

    const newIndex = newModels.length ? newModels.length - 1 : 0;
    console.log(newIndex);

    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: newIndex,
    });
    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: modelInfo,
    });
  };
  // ????????????
  const selectModel = (index: number) => {
    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: index,
    });

    // setCurModelIndex(index);
  };

  // ?????????????????????????????????
  const changeModelInfo = (info: ModelInfo) => {
    console.log('infos---', info);
    const { models } = thingModelInfo.content;
    const newModels = cloneDeep(models);
    newModels.splice(curModelIndex, 1, info);
    const modelInfo: ThingModelInfo = {
      ...thingModelInfo,
      content: { models: newModels },
    };
    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: modelInfo,
    });

    setFormDirty(true);
  };
  // ??????json??????
  const changeModelContent = (content: ThingModelContent | ModelInfo) => {
    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: {
        ...thingModelInfo,
        content: content as ThingModelContent,
      },
    });

    setFormDirty(true);
  };

  const handleSetSaveBtnStatus = (flag: boolean) => {
    // setIsView(!flag);
  };

  // ????????????????????????????????????
  const saveThingModel = (val: {
    description: string;
    thingModelVersion: string;
  }) => {
    const version = val.thingModelVersion || currentVersion.thingModelVersion;

    dispatch({
      type: SET_THING_MODEL_INFO,
      thingModelInfo: {
        ...thingModelInfo,
        thingTypeId: id,
        ...val,
        thingModelVersion: version,
      },
    });

    const params = {
      ...thingModelInfo,
      thingTypeCode: id,
      id: currentVersion.id,
      content: JSON.stringify(thingModelInfo.content),
      ...val,
      thingModelVersion: version,
      spec: 'user-spec-v1',
    };
    if (!currentVersion.thingModelVersion) {
      createVersion(params).then((data: any) => {
        if (data) {
          setFormDirty(false);
          SimpleToast('???????????????????????????');
          setIsThingModelValidate(true);
          dispatch({
            type: SET_REFRESH_VERSION_LIST,
            refreshVersionList: true,
          });
        }
      });
    } else {
      editThingModel(params)
        .then((data: any) => {
          if (Number.parseInt(data.code, 10) === 200) {
            setFormDirty(false);
            SimpleToast('?????????????????????');
            setIsThingModelValidate(true);
            dispatch({
              type: SET_REFRESH_VERSION_LIST,
              refreshVersionList: true,
            });
          }
        })
        ['catch']((err: any) => {
          console.log(err);
        });
    }
  };

  /**
   * @description: ??????????????????????????????
   * 1?????????????????????????????????????????????????????????????????????????????????
   * @param {type}
   * @return:
   */
  const handleSaveThingModel = () => {
    if (formRef.current) {
      formRef.current.form.validateFields((err, val) => {
        if (!err) {
          // ????????????????????????????????????????????????????????????
          const lastIndex = thingModelInfo.content.models.length - 1;
          const isValidate = handleCheckJson(
            JSON.stringify(thingModelInfo.content.models[lastIndex])
          );
          if (!isValidate) return;
          // ????????????
          checkThingModelContent(JSON.stringify(thingModelInfo.content)).then(
            (res) => {
              if (res && res.code.toString() === '200') {
                saveThingModel(val);
              } else {
                SimpleToast(res.msg);
                setIsThingModelValidate(false);
              }
            }
          );
        }
      });
    }
  };
  /**
   * @description: ???????????????
   * @param {type}
   * @return:
   */
  async function pubThingModel(val: { changeLog: string }) {
    const pubParam = {
      ...val,
      thingModelVersion: currentVersion.thingModelVersion,
    };
    try {
      const res = await pubVersion({
        thingModelId: currentVersion.id,
        thingTypeCode: id,
        ...pubParam,
      });
      if (res) {
        console.log(res);
        setFormDirty(false);
        SimpleToast('????????????');
        setShowPubModal(false);
        dispatch({
          type: SET_REFRESH_VERSION_LIST,
          refreshVersionList: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ObtainHeight>
      <div className="thing-model-wrap">
        <div className="container-body">
          <BasicThingModelInfo
            wrappedComponentRef={formRef}
            setFormDirty={setFormDirty}
          />
          <div className="model-wrap">
            <div className="model-list">
              <div className="model-list-title">
                ????????????
                {nodeType !== '4' && (
                  <Button
                    type="link"
                    disabled={
                      currentVersion.publishedStatus === 1 ||
                      thingModelInfo.content.models.length >= 10
                    }
                    onClick={() => openEditModelModal(-1)}
                  >
                    + ??????
                  </Button>
                )}
              </div>
              <ul>
                {thingModelInfo.content.models.length ? (
                  thingModelInfo.content.models.map(
                    (item: ModelInfo, index: number) => (
                      <li
                        key={item.id}
                        value={item.id}
                        className={index === curModelIndex ? 'active' : ''}
                      >
                        <span
                          title={item['display-name']}
                          className="model-name"
                          onClick={() => selectModel(index)}
                        >
                          {item['display-name']}
                        </span>
                        {!isView && nodeType !== '4' && (
                          <div className="operation-box">
                            {item.type !== 'service' && (
                              <Button
                                type="link"
                                onClick={() => openEditModelModal(index)}
                              >
                                <span className="icon-edit" />
                              </Button>
                            )}
                            {item.key && item.key !== 'connection_agent' && (
                              <Button
                                type="link"
                                onClick={() => delModel(index)}
                              >
                                <span className="icon-delete" />
                              </Button>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  )
                ) : (
                  <Empty
                    description="??????????????????"
                    image={iconNull}
                    imageStyle={{
                      height: 80,
                    }}
                  />
                )}
              </ul>
            </div>
            <Tabs>
              <TabPane tab="????????????" key="1">
                <FuncDefinition
                  value={thingModelInfo.content.models[curModelIndex]}
                  onChange={changeModelInfo}
                  isView={
                    nodeType === '4' ||
                    isView ||
                    (thingModelInfo.content.models[curModelIndex] &&
                      thingModelInfo.content.models[curModelIndex].type ===
                        'service')
                  }
                  needRequire={false}
                />
              </TabPane>
              <TabPane tab="JSON??????" key="2">
                <JsonCode
                  info={thingModelInfo.content}
                  change={changeModelContent}
                  changeSaveBtnStatus={handleSetSaveBtnStatus}
                  // isView={thingModelInfo.publishedStatus === 1}
                  isView
                />
              </TabPane>
            </Tabs>
          </div>
          <div className="btn-box">
            <Button
              type="primary"
              disabled={!isThingModelValidate || formDirty || isView}
              onClick={() => setShowPubModal(true)}
            >
              ??????
            </Button>
            <Button
              disabled={isView}
              type="primary"
              className="ml-10"
              onClick={handleSaveThingModel}
            >
              ??????
            </Button>
          </div>
        </div>

        {/* ?????????????????? start */}
        <ModelInfoModalForm
          visible={newModelShow}
          data={thingModelInfo.content.models[curModelIndex]}
          modelList={thingModelInfo.content.models}
          onCancel={closeModelInfoModal}
          onOk={saveModelName}
        />
        {/* ??????????????????end */}
        {/* ??????????????? start */}
        <PubThingModelModal
          visible={showPubModal}
          onCancel={() => setShowPubModal(false)}
          onOk={pubThingModel}
        />
        {/* ??????????????? end */}
      </div>
    </ObtainHeight>
  );
}
export default ThingModelDef;
