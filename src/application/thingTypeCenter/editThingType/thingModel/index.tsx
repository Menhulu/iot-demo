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
    properties: [], // Property[]; // 属性是必填的
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
  /** 模型操作相关 start */
  /**
   * @description: 校验模型功能是否合法，前端校验
   * 1：前端校验是否是合法的json
   * 2：当前模型：传入空对象，属性，事件，服方法都为空时不通过，有一个为空可以
   * 3: 物模型中最后一个模型属性、事件、方法都为空时不通过
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
      // 没有模型时,当前模型key为空
      if (!key) {
        isPermission = true;
        return true;
      }
      // 如果是个空对象
      if (Object.keys(jsonObj).length === 0) {
        SimpleToast('当前模型内容不正确');
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
        SimpleToast('模型需要至少定义属性、事件、方法中的一项');
        isPermission = false;
        return false;
      }
    } catch (err) {
      SimpleToast('JSON 不合法');
      isPermission = false;
    }
    return isPermission;
  };
  // 打开编辑模型名称modal
  const openEditModelModal = (index: number) => {
    const isValidate = handleCheckJson(
      JSON.stringify(thingModelInfo.content.models[curModelIndex])
    );
    // 新建
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
  // 关系编辑物模型信息modal
  const closeModelInfoModal = () => {
    setNewModelShow(false);
    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: thingModelInfo.content.models.length - 1,
    });
  };
  // 保存模型
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

      // 给key编号  如果相同的objectName 重复出现就编号，第一个从1开始编号，不重复的不编号
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
        // 修改已有的模型信息
        if (curModelIndex === index) {
          model.description = newModel.description;
        }
      });
      */
      // 创建
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

        // 新增模型清空属性 事件和方法的列表
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
  // 删除模型
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
  // 选择模型
  const selectModel = (index: number) => {
    dispatch({
      type: SET_CURRENT_MODEL_INDEX,
      curModelIndex: index,
    });

    // setCurModelIndex(index);
  };

  // 更改功能列表的一条数据
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
  // 更改json数据
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

  // 通过接口保存物模型的数据
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
          SimpleToast('创建物模型版本成功');
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
            SimpleToast('物模型保存成功');
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
   * @description: 保存物模型相关的数据
   * 1、首先对物模型的数据进行校验，如果正确的话，再进行保存
   * @param {type}
   * @return:
   */
  const handleSaveThingModel = () => {
    if (formRef.current) {
      formRef.current.form.validateFields((err, val) => {
        if (!err) {
          // 前端校验，只需要校验最后一个模型是否合法
          const lastIndex = thingModelInfo.content.models.length - 1;
          const isValidate = handleCheckJson(
            JSON.stringify(thingModelInfo.content.models[lastIndex])
          );
          if (!isValidate) return;
          // 后端校验
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
   * @description: 发布物模型
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
        SimpleToast('发布成功');
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
                模型列表
                {nodeType !== '4' && (
                  <Button
                    type="link"
                    disabled={
                      currentVersion.publishedStatus === 1 ||
                      thingModelInfo.content.models.length >= 10
                    }
                    onClick={() => openEditModelModal(-1)}
                  >
                    + 新增
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
                    description="请先创建模型"
                    image={iconNull}
                    imageStyle={{
                      height: 80,
                    }}
                  />
                )}
              </ul>
            </div>
            <Tabs>
              <TabPane tab="功能列表" key="1">
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
              <TabPane tab="JSON数据" key="2">
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
              发布
            </Button>
            <Button
              disabled={isView}
              type="primary"
              className="ml-10"
              onClick={handleSaveThingModel}
            >
              保存
            </Button>
          </div>
        </div>

        {/* 新建编辑模型 start */}
        <ModelInfoModalForm
          visible={newModelShow}
          data={thingModelInfo.content.models[curModelIndex]}
          modelList={thingModelInfo.content.models}
          onCancel={closeModelInfoModal}
          onOk={saveModelName}
        />
        {/* 新建编辑模型end */}
        {/* 发布物模型 start */}
        <PubThingModelModal
          visible={showPubModal}
          onCancel={() => setShowPubModal(false)}
          onOk={pubThingModel}
        />
        {/* 发布物模型 end */}
      </div>
    </ObtainHeight>
  );
}
export default ThingModelDef;
