/* eslint-disable no-case-declarations */
import React, { useEffect, forwardRef } from 'react';
import { Form, Input, Modal, message, Button } from 'antd';
import Toast from 'components/SimpleToast';

import { FormComponentProps } from 'antd/lib/form';
import CopyToClipboard from 'react-copy-to-clipboard';

import './index.less';
import { numberValidator } from './validators';
import {
  PropertyInfo,
  ArrInfo,
  StrucInfo,
  StringInfo,
  StepInfo,
} from 'application/thingTypeCenter/types/funcDefinition';

interface DesiredValueFormProps extends FormComponentProps {
  record: PropertyInfo;
  visible: boolean;
  onCancel: () => void;
  onOk: (val: Record<string, string>) => void;
}
const { TextArea } = Input;
const DesiredValueForm = ({
  visible,
  record,
  form,
  onCancel,
  onOk,
}: DesiredValueFormProps) => {
  console.log(record);
  const { getFieldDecorator, validateFields, setFieldsValue } = form;
  const handleSave = () => {
    form.validateFields((err, val) => {
      console.log(val);
      if (!err) {
        onOk({ [record.key as string]: val.propKey });
        form.resetFields();
      }
    });
  };
  const validateValue = (rule: any, value: string, callback: any) => {
    const { valuedef } = record;
    const { specs, type } = valuedef;
    console.log(value, type);
    let jsonVal: Record<string, string> | any[] = [];
    try {
      console.log(JSON.parse(value));
      jsonVal = JSON.parse(value);
      callback();
    } catch (error) {
      callback('请输入json格式的数据');
    }

    if (type === 'array') {
      if (!Array.isArray(jsonVal)) {
        callback('请输入数组类型的值');
        return;
      }
      callback();

      const valueArr: any[] = jsonVal as any[];
      console.log(valueArr);
      const { size, item } = specs as ArrInfo;
      const dataType = item.type;
      if (valueArr.length > Number(size)) {
        callback('元素个数超过最大长度');
      }
      callback();

      if (dataType === 'struct') {
        const { members } = item.specs as StrucInfo;
        members.forEach((_member: any, index: number) => {
          valueArr.forEach((valItem: any) => {
            Object.keys(valItem).forEach((k: string) => {
              if (k === _member.key) {
                if (_member.type !== 'string') {
                  numberValidator(
                    rule,
                    valItem[k],
                    callback,
                    _member.type,
                    _member.specs.max,
                    _member.specs.min,
                    _member.step,
                    true
                  );
                } else {
                  if (valItem[k].length > _member.specs.length) {
                    callback('元素长度超过最大长度');
                    Toast('元素长度超过最大长度');
                  }
                  callback();
                }
              }
            });
          });
        });
      } else if (dataType === 'string') {
        const { length } = item.specs as StringInfo;
        const invalidate = valueArr.some((valItem) => valItem.length > length);
        console.log(invalidate);
        if (invalidate) {
          callback('元素长度超过最大长度');
          Toast('元素长度超过最大长度');
        }
        callback();
      } else {
        const { min, max, step } = item.specs as StepInfo;

        valueArr.forEach((valItem) => {
          numberValidator(
            rule,
            valItem,
            callback,
            dataType,
            max,
            min,
            step,
            true
          );
        });
      }
    } else {
      console.log(Array.isArray(jsonVal));
      if (Array.isArray(jsonVal)) {
        Toast('请输入对象类型的值');
        callback('请输入对象类型的值');
      } else {
        // struct 类型
        const { members } = specs as StrucInfo;
        const structJson = jsonVal as Record<string, string>;
        Object.keys(structJson).forEach((key) => {
          members.forEach((_member: any, index: number) => {
            if (_member.key === key) {
              if (_member.type !== 'string') {
                numberValidator(
                  rule,
                  structJson[key],
                  callback,
                  _member.type,
                  _member.specs.max,
                  _member.specs.min,
                  _member.step,
                  true
                );
              } else {
                if (structJson[key].length > _member.specs.length) {
                  callback('元素长度超过最大长度');
                  Toast('元素长度超过最大长度');
                }
                callback();
              }
            }
          });
        });
      }
    }
  };
  const getTips = () => {
    const { valuedef, type } = record;
    const { specs } = valuedef;
    let tips = '';
    switch (type) {
      case 'array':
        const { size, item } = specs as ArrInfo;
        const dataType = item.type;

        if (dataType === 'struct') {
          const { members } = item.specs as StrucInfo;
          // tips = `请输入json对象表示的元素为${dataType}类型的数组，最多输入${size}个元素。 每个元素包含${members.length}个键值对。`;
          // members.forEach((_member: any, index: number) => {
          //   if (_member.type === 'string') {
          //     tips += `元素${index + 1}键为${_member.key}， 值类型为${
          //       _member.type
          //     }, 值最大长度为${_member.specs.length};`;
          //   } else {
          //     tips += `元素${index + 1}，键为${_member.key}， 值类型为${
          //       _member.type
          //     }, 最小值${_member.specs.min}，最大值${_member.specs.max}。`;
          //   }
          // });
          tips += `[{`;
          members.forEach((_member: any, index: number) => {
            tips += `"${_member.key}": ${
              _member.type === 'string' ? '""' : _member.specs.max
              }`;
            if (index < members.length - 1) {
              tips += ',';
            }
          });
          tips += `}]`;
        }
        // else if (dataType === 'string') {
        //   const { length } = item.specs;
        //   tips = `请输入json对象表示的元素为${dataType}类型的数组，每个元素最大字符长度为${length}`;
        // } else {
        //   const { min, max } = item.specs;
        //   tips = `请输入json对象表示的元素为${dataType}类型的数组，最大值为${max}，最小值为${min}，最多输入${size}个元素。`;
        // }
        break;
      case 'struct':
        const { members } = specs as StrucInfo;
        // tips = `请输入json对象,`;
        // members.forEach((_member: any, index: number) => {
        //   if (_member.type === 'string') {
        //     tips += `元素${index + 1}键为${_member.key}，值类型为${
        //       _member.type
        //     }, 值最大长度为${_member.specs.length};`;
        //   } else {
        //     tips += `元素${index + 1},键为${_member.key}， 值类型为${
        //       _member.type
        //     }, 最小值${_member.specs.min}，最大值${_member.specs.max}。`;
        //   }
        // });
        tips += `{`;
        members.forEach((_member: any, index: number) => {
          tips += `"${_member.key}": ${
            _member.type === 'string' ? '""' : _member.specs.max
            }`;
          if (index < members.length - 1) {
            tips += ',';
          }
        });
        tips += `}`;
        break;
      default:
        break;
    }
    return tips;
  };
  return (
    <Modal
      title="期望值"
      centered
      visible={visible}
      okText="确认"
      cancelText="取消"
      onOk={handleSave}
      onCancel={onCancel}
      wrapClassName="desired-info-modal"
    >
      <Form>
        <Form.Item>
          {getFieldDecorator('propKey', {
            rules: [{ validator: validateValue }],
            initialValue: record.desired ? JSON.stringify(record.desired) : '',
          })(
            <TextArea
              rows={6}
              placeholder={getTips()}
              disabled={!record.access.toLowerCase().indexOf('w')}
            />
          )}
        </Form.Item>

        {getTips() ? (
          <>
            数据示范：{getTips()}
            <CopyToClipboard
              text={getTips()}
              onCopy={() => message.success('复制成功')}
            >
              <Button type="link">复制</Button>
            </CopyToClipboard>
          </>
        ) : (
            ''
          )}
      </Form>
      <div className="tips-wrap">
        <div className="tips">
          数据定义：
          {JSON.stringify(record.valuedef)}
        </div>
      </div>
    </Modal>
  );
};

export default Form.create<DesiredValueFormProps>()(DesiredValueForm);
