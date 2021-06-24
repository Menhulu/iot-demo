import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Input } from 'antd';

import Toast from 'components/SimpleToast';
// import MonacoEditor, {
//   EditorWillMount,
//   ChangeHandler,
//   EditorDidMount,
// } from 'react-monaco-editor';

import { checkModelContent } from 'application/modelCenter/services';
import CopyToClipboard from 'react-copy-to-clipboard';
// import { editor } from 'monaco-editor';
import { formatJson } from 'utils/format-json';

import { checkThingModelContent } from '../../../../services/thingModelApi';
// import { rule } from './rule';
import { ThingModelContent, ModelInfo } from '../../../../types';

import './index.less';

const { TextArea } = Input;

interface JsonCodeProps {
  info: ThingModelContent | ModelInfo;
  change: (data: ThingModelContent | ModelInfo) => void;
  changeSaveBtnStatus?: (flag: boolean) => void;
  isView: boolean;
}

const JsonCode = (props: JsonCodeProps): React.ReactElement => {
  const [error, setError] = useState<string>('');
  const [infoStr, setInfoStr] = useState<string>('');
  const editorRef = useRef<any>(null);

  /*
  const options: editor.IStandaloneEditorConstructionOptions = {
    selectOnLineNumbers: true,
    minimap: {
      enabled: false,
    },
  };

  // 保存编辑器实例
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);


  const editorWillMount: EditorWillMount = monaco => {
    console.log('editorWillMount', monaco.languages);
    if (monaco.languages.json) {
      console.log('-------jsonDefaults', monaco, monaco.languages);
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: rule,
      });
    }
  };

  const trigger = (e: editor.IStandaloneCodeEditor, id: string) => {
    if (!e) return;
    e.trigger('anyString', id, null);
  };
  // 格式化代码
  const onFormat = () => {
    if (editorRef.current) {
      trigger(editorRef.current, 'editor.action.formatDocument');
    }
  }; */
  // 改变
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 查看态不改变外部按钮状态
    if (props.isView) return;
    const content = event.target.value.trim();
    if (content !== '') {
      try {
        JSON.parse(content);
        setError('');
        props.changeSaveBtnStatus && props.changeSaveBtnStatus(true);
      } catch (err) {
        if (err) {
          setError(err.toString());
          props.changeSaveBtnStatus && props.changeSaveBtnStatus(false);
        }
      }
    }
    setInfoStr(content);
  };
  const onFormat = () => {
    if (editorRef.current) {
      // trigger(editorRef.current, 'editor.action.formatDocument');
      const formatContent = formatJson(editorRef.current.state.value);
      setInfoStr(formatContent);
    }
  };
  /**
   * @description: 校验模型功能是否合法，前端校验
   * 1：前端校验是否是合法的json
   * 2: 没有
   * 2：前端首次校验：传入空对象，属性，事件，服务都为空的时候不行，有一个为空可以
   * @param {type}
   * @return:
   */
  const handleCheckJson = (): boolean => {
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
        Toast('当前模型内容不正确');
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
        Toast('至少定义属性、事件、方法中的一项，再创建新模型');
        isPermission = false;
        return false;
      }
    } catch (err) {
      Toast('JSON 不合法');
      isPermission = false;
    }
    return isPermission;
  };
  // 校验内容
  const checkContent = () => {
    const content = infoStr.trim();
    const isValidate = handleCheckJson();
    if (!isValidate) return;
    // eslint-disable-next-line no-prototype-builtins
    if ((props.info as any).hasOwnProperty('models')) {
      // 物模型个
      checkThingModelContent(content)
        .then((res) => {
          if (res && res.code.toString() === '200') {
            Toast('格式校验通过');
            props.changeSaveBtnStatus && props.changeSaveBtnStatus(true);
            props.change(JSON.parse(content));
          } else {
            props.changeSaveBtnStatus && props.changeSaveBtnStatus(false);
            Toast(res.msg);
          }
        })
        ['catch']((err) => {
          props.changeSaveBtnStatus && props.changeSaveBtnStatus(false);
          Toast(err.msg);
        });
    } else {
      checkModelContent(content)
        .then((res) => {
          if (res && res.code.toString() === '200') {
            Toast('格式校验通过');
            props.change(JSON.parse(content));
          } else {
            Toast('模型内容不正确');
          }
        })
        ['catch']((err) => {
          Toast('模型内容不正确');
        });
    }
  };

  // const editorDidMount: EditorDidMount = (e, monaco) => {
  //   e.focus();
  //   e.layout();
  //   editorRef.current = e;
  //   setTimeout(() => {
  //     e.layout();
  //     editorRef.current = e;
  //   }, 100);
  // };

  useEffect(() => {
    console.log(props.info);
    setInfoStr(JSON.stringify(props.info));
  }, [props.info]);
  return (
    <div className="json-wrap">
      {/* 工具栏 start */}
      <div className={['tooltip', props.isView ? 'no-btn' : ''].join(' ')}>
        <div className="btn">
          <Button
            className="check-btn btn"
            onClick={checkContent}
            disabled={!!error || !!props.isView}
          >
            校验JSON
          </Button>
          <span className="line">|</span>

          <Button className="btn" onClick={onFormat}>
            格式化
          </Button>
          <span className="line">|</span>
          <CopyToClipboard
            text={infoStr}
            onCopy={() => message.success('复制成功')}
          >
            <Button type="link" className="btn">
              复制
            </Button>
          </CopyToClipboard>
        </div>
        {!props.isView && (
          <div className="tips">* JSON 校验通过后才能保存数据</div>
        )}
      </div>
      {/* 工具栏 end */}
      {/* json 在线解析工具 start */}
      <div className={['json-code', !props.isView ? '' : 'disabled'].join(' ')}>
        <div className="json-obtain">
          <div className="err-msg">{error}</div>
          <TextArea
            disabled={props.isView}
            value={infoStr}
            onChange={onChange}
            ref={editorRef}
            style={{ width: '100%', height: '100%' }}
          />
          {/* <MonacoEditor
            width="100%"
            height="100%"
            language="json"
            theme="vs"
            value={infoStr}
            options={options}
            onChange={onChange}
            editorWillMount={editorWillMount}
            editorDidMount={editorDidMount}
          /> */}
        </div>
      </div>
      {/* json 在线解析工具 end */}
    </div>
  );
};

export default JsonCode;
