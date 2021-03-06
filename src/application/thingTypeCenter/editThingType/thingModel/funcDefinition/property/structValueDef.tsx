/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Tooltip } from 'antd';
import Toast from 'components/SimpleToast';
import { FormComponentProps } from 'antd/lib/form';

import { SelectValue } from 'antd/lib/select';

import EnumTable from './enumTable';
import {
  dataUnit,
  displayNameReg,
  objectNameReg,
  displayNameRule,
  objectNameRule,
  PropTypeConfig,
} from './constant';

import {
  StrcutParamsInfo,
  OperationInfo,
  PageType,
} from '../../../../types/funcDefinition';

import './valueDef.less';
import { validatorRange, validatorStep, validateLength } from '../utils';

const { Option } = Select;

interface StructValueDefProps extends FormComponentProps {
  info: OperationInfo;
  onOk: (param: { pageType: PageType; itemInfo: StrcutParamsInfo }) => void;
  onClose: () => void;
}
const StructValueDef = (props: StructValueDefProps) => {
  const { getFieldDecorator, setFieldsValue, resetFields } = props.form;
  const { info, onOk, onClose } = props;
  const { paramList, pageType } = info;
  const [dataType, setDataType] = useState<string>('');

  const [dataInfo, setDataInfo] = useState<Record<string, any>>();
  const [maxDirty, setMaxDirty] = useState<boolean>(false);
  const [stepDirty, setStepDirty] = useState<boolean>(false);

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    if (info.item) {
      const { key, type, specs } = info.item;
      let fields: Record<string, any> = { key, type };
      if (type === 'enum') {
        const newEnumArr = Object.keys(specs.values).map((key) => ({
          [`${key}`]: specs.values[key],
        }));
        fields = {
          ...fields,
          values: newEnumArr,
        };
      } else {
        fields = {
          ...fields,
          ...specs,
        };
      }
      setDataType(type);
      setDataInfo(fields);
    } else {
      setDataType('');
      setDataInfo({
        key: '',
        type: '',
      });
      resetFields();
    }
  }, [info, resetFields]);
  useEffect(() => {
    console.log(dataInfo);
    setMaxDirty(false);
    setMaxDirty(false);
    setFieldsValue({ ...dataInfo });
  }, [dataInfo, setFieldsValue]);
  // ???????????????
  const handleDataTypeChange = (val: SelectValue) => {
    const type: string = val as string;
    console.log(type);
    setDataType(type);
    const { key } = props.form.getFieldsValue();
    setDataInfo({
      key,
      type,
      ...PropTypeConfig[type].specInfo,
    });
  };
  // ?????? ??????drawer
  const closeDrawer = () => {
    //
    onClose();
  };
  /*
   * ??????struct?????????????????????????????????????????????
   */
  const onSave = () => {
    props.form.validateFields((err, values: Record<string, any>) => {
      console.log('StructValueDef', values);
      if (err) return;
      const { key, type, ...rest } = values;
      let specs = { ...rest };
      if (type === 'enum') {
        let enumSpecs = {};
        if (Array.isArray(rest['values'])) {
          try {
            rest['values'].forEach((eItem) => {
              Object.keys(eItem).forEach((key) => {
                const enumDesc = eItem[key];
                console.log(enumDesc);
                if (!enumDesc) {
                  throw Error('???????????????????????????');
                } else {
                  enumSpecs = { ...enumSpecs, ...eItem };
                }
              });
            });
          } catch (error) {
            Toast('???????????????????????????');
            return;
          }
        }
        specs = { values: enumSpecs };
      }

      const item = {
        key,
        type,
        specs: { ...specs },
      };
      onOk && onOk({ pageType: info.pageType, itemInfo: item });
      resetFields();
    });
  };

  // ???????????????
  const validatorNumber = (rule: any, value: any, callback: any) => {
    validatorRange(rule, value, callback, dataType);
  };
  const handleMaxBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setMaxDirty(!!value);
  };
  const handleStepBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setStepDirty(!!value);
  };
  // ???????????????????????????
  const compareToMax = (rule: any, value: any, callback: any) => {
    const maxVal = props.form.getFieldValue('max');
    const stepVal = props.form.getFieldValue('step');

    if (value && maxDirty && maxVal) {
      props.form.validateFields(['max'], { force: true });
    }
    if (value && stepDirty && stepVal) {
      props.form.validateFields(['step'], { force: true });
    }
    callback();
  };
  // ???????????????????????????
  const compareToMin = (rule: any, value: any, callback: any) => {
    const minVal = props.form.getFieldValue('min');
    const stepVal = props.form.getFieldValue('step');

    if (value && Number(value) <= Number(minVal)) {
      callback('??????????????????????????????');
    } else if (value && stepDirty && stepVal) {
      props.form.validateFields(['step'], { force: true });
    }
    callback();
  };
  // ???????????????
  const validateStep = (rule: any, value: string, callback: any) => {
    const minVal = props.form.getFieldValue('min');
    const maxVal = props.form.getFieldValue('max');

    validatorStep(rule, value, callback, dataType, maxVal, minVal);
  };
  // ????????????
  const validateMaxLength = (rule: any, value: any, callback: any) => {
    validateLength(rule, value, callback, dataType);
  };
  // ?????????????????????
  const validateCode = (
    rule: any,
    value: string,
    callback: (message?: string) => void
  ) => {
    if (!paramList) {
      callback();
      return;
    }
    let otherParams = [...paramList];
    let flag = false;
    if (pageType === 'EDIT') {
      // ??????????????????????????????
      const curCode = info.item.key;
      otherParams = paramList.filter((item) => item.key !== curCode);
    }
    for (const event of otherParams) {
      if (event.key === value) {
        flag = true;
        break;
      }
    }
    if (flag) {
      callback('?????????????????????');
    } else {
      callback();
    }
  };

  const getDataConfig = (type: string): React.ReactElement | null => {
    switch (type) {
      case 'string':
        return (
          <Form.Item label="??????">
            {getFieldDecorator('length', {
              rules: [
                { required: true, message: '?????????????????????' },
                { pattern: /^[1-9][0-9]*$/, message: '????????????????????????' },
                { validator: validateMaxLength },
              ],
            })(
              <Input
                disabled={pageType === 'VIEW'}
                placeholder="???????????????????????????????????????1024"
              />
            )}
          </Form.Item>
        );
      case 'binary':
        return (
          <Form.Item label="??????" className="flex-form-item">
            {getFieldDecorator('length', {
              rules: [
                { required: true, message: '?????????????????????' },
                { pattern: /^[1-9][0-9]*$/, message: '????????????????????????' },
                { validator: validateMaxLength },
              ],
            })(
              <Input
                disabled={pageType === 'VIEW'}
                placeholder="???????????????????????????????????????1024"
              />
            )}
            <Tooltip title="binary??????base64??????????????????????????????????????????binary????????????????????????base64?????????">
              <span className="primary-color rule">????????????</span>
            </Tooltip>
          </Form.Item>
        );
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'float':
      case 'double':
        return (
          <div className="number">
            <Form.Item label="?????????">
              {getFieldDecorator('min', {
                rules: [
                  { required: true, message: '??????????????????' },
                  { validator: validatorNumber },
                  { validator: compareToMax },
                ],
              })(
                <Input
                  disabled={pageType === 'VIEW'}
                  placeholder="??????????????????"
                />
              )}
            </Form.Item>
            <Form.Item label="?????????">
              {getFieldDecorator('max', {
                rules: [
                  { required: true, message: '??????????????????' },
                  { validator: validatorNumber },
                  { validator: compareToMin },
                ],
              })(
                <Input
                  disabled={pageType === 'VIEW'}
                  placeholder="??????????????????"
                  onBlur={handleMaxBlur}
                />
              )}
            </Form.Item>
            <Form.Item label="??????">
              {getFieldDecorator('step', {
                rules: [
                  { required: true, message: '??????????????????' },
                  { validator: validateStep },
                ],
              })(
                <Input
                  disabled={pageType === 'VIEW'}
                  onBlur={handleStepBlur}
                  placeholder="??????????????????"
                />
              )}
            </Form.Item>
            <Form.Item label="??????">
              {getFieldDecorator('unit')(
                <Select className="basic-select" disabled={pageType === 'VIEW'}>
                  {dataUnit.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name} / {item.id}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="????????????">
              {getFieldDecorator('unitdesc')(
                <Input disabled={pageType === 'VIEW'} maxLength={100} />
              )}
            </Form.Item>
          </div>
        );
      case 'enum':
        return (
          <Form.Item label="?????????">
            {getFieldDecorator('values', {
              rules: [{ required: true, message: '??????????????????' }],
            })(<EnumTable disabled={pageType === 'VIEW'} />)}
          </Form.Item>
        );
      case 'bool':
        return (
          <>
            <Form.Item>
              {getFieldDecorator('0', { initialValue: 'false' })(
                <Input type="hidden" />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('1', { initialValue: 'true' })(
                <Input type="hidden" />
              )}
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <Form {...formItemLayout} className="value-def-form">
        <Form.Item label="?????????" className="flex-form-item">
          {getFieldDecorator('key', {
            rules: [
              { required: true, message: '??????????????????' },
              { pattern: objectNameReg, message: objectNameRule },
              { validator: validateCode },
            ],
          })(
            <Input
              disabled={pageType === 'VIEW'}
              maxLength={30}
              placeholder="????????????????????????UA"
            />
          )}
          <Tooltip title={objectNameRule}>
            <span className="primary-color rule">????????????</span>
          </Tooltip>
        </Form.Item>
        <Form.Item label="?????????">
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '??????????????????' }],
          })(
            <Select
              onChange={handleDataTypeChange}
              disabled={pageType === 'VIEW'}
            >
              {Object.keys(PropTypeConfig).map((key) => (
                <Option
                  key={key}
                  value={key}
                  className={`${
                    ['struct', 'array'].includes(key) ? 'hidden' : ''
                  }`}
                >
                  {PropTypeConfig[key].displayName}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {getDataConfig(dataType)}
      </Form>
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }}
      >
        <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
          ??????
        </Button>
        {pageType !== 'VIEW' && (
          <Button onClick={onSave} type="primary">
            ??????
          </Button>
        )}
      </div>
    </>
  );
};

export default Form.create<StructValueDefProps>()(StructValueDef);
