/*
 * @Author: zhaohongun1@jd.com
 * @description: 标准物模型的功能列表
 */
import React, { useState, useEffect, forwardRef } from 'react';
import { Tabs } from 'antd';
import Property from './property';
import Functions from './functions';
import Event from './event';
import JsonCode from './json';

import {
  ModelInfo,
  PropertyInfo,
  EventInfo,
  FunctionInfo,
} from '../../../types/funcDefinition';
import { ThingModelContent } from '../../../types/thingModel';

import './index.less';

const { TabPane } = Tabs;
interface FuncDefinitionProps {
  value?: ModelInfo;
  onChange?: (modelInfo: ModelInfo) => void;
  isView: boolean; // 是否可以标准物模型的数据
  needRequire?: boolean;
}

const FuncDefinition = forwardRef<any, FuncDefinitionProps>(
  (props: FuncDefinitionProps, ref): React.ReactElement => {
    const initModelInfo: ModelInfo = {
      id: '',
      'display-name': '',
      description: '',
      type: 'entity',
      properties: [],
      events: [],
      functions: [],
    };
    const [modelInfo, setModelInfo] = useState<ModelInfo>(initModelInfo);

    useEffect(() => {
      setModelInfo(
        props.value || {
          id: '',
          'display-name': '',
          description: '',
          type: 'entity',
          properties: [],
          events: [],
          functions: [],
        }
      );
    }, [props.value]);

    /**
     * @description: 改变属性的数据
     * @param {type}
     * @return:
     */
    const changeProperty = (propertyInfo: PropertyInfo[]) => {
      const info: ModelInfo = { ...modelInfo, properties: [...propertyInfo] };
      setModelInfo(info);
      props.onChange && props.onChange(info);
      console.log(propertyInfo, 'changeProperty');
    };

    /**
     * @description: 方法中的数据改变
     * @param {type}
     * @return:
     */
    const changeFunctions = (sInfo: FunctionInfo[]) => {
      const info = { ...modelInfo, functions: [...sInfo] };
      setModelInfo(info);
      props.onChange && props.onChange(info);
      console.log(sInfo, 'changeService');
    };

    /**
     * @description: 事件中的数据改变
     * @param {type}
     * @return:
     */
    const changeEvent = (eventInfo: EventInfo[]) => {
      const info = { ...modelInfo, events: [...eventInfo] };
      setModelInfo(info);
      props.onChange && props.onChange(info);
      console.log(eventInfo, 'changeEvent');
    };

    // 更改json数据
    const changeModelContent = (content: ThingModelContent | ModelInfo) => {
      props.onChange && props.onChange(content as ModelInfo);
    };
    console.log(modelInfo);
    return (
      <div className="model-fun" ref={ref}>
        <Tabs defaultActiveKey="1" className="model-fun-tabs" type="card">
          <TabPane tab="属性" key="1">
            <Property
              info={modelInfo}
              change={changeProperty}
              isView={props.isView}
              needRequire={props.needRequire}
            />
          </TabPane>
          <TabPane tab="事件" key="3">
            <Event
              info={modelInfo}
              change={changeEvent}
              isView={props.isView}
              needRequire={props.needRequire}
            />
          </TabPane>
          <TabPane tab="方法" key="2">
            <Functions
              info={modelInfo}
              change={changeFunctions}
              isView={props.isView}
              needRequire={props.needRequire}
            />
          </TabPane>
          {props.needRequire && (
            <TabPane tab="JSON" key="4">
              <JsonCode
                info={modelInfo}
                change={changeModelContent}
                isView={false}
              />
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
);

export default FuncDefinition;
