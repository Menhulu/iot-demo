import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  AutoComplete,
  Pagination,
  Tooltip,
} from 'antd';

import { FormComponentProps } from 'antd/lib/form';

import Textarea from 'components/TextArea';

import useInitial from 'common/customHooks/useInitialList';
import {
  getPropertyList,
  queryPropertyInfo,
} from 'application/thingTypeCenter/services/thingModelApi';

import { SelectValue } from 'antd/lib/select';
import Toast from 'components/SimpleToast';
import {
  validatorRange,
  validatorStep,
  validateLength,
  validateDisplayNameLength,
} from '../utils';
import {
  PropTypeConfig,
  ArrayTypeConfig,
  dataUnit,
  displayNameReg,
  objectNameReg,
  displayNameRule,
  objectNameRule,
} from './constant';
import {
  OperationInfo,
  PropertyInfo,
  PageType,
  QueryPropertyParam,
  QueryPropertyRes,
  EnumInfo,
  ArrInfo,
} from '../../../../types/funcDefinition';

import EnumTable from './enumTable';
import StructTable from './structTable';

import './valueDef.less';

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
interface ValueDefProps extends FormComponentProps {
  info: OperationInfo;
  closeDrawer: () => void;
  onChange: (param: { pageType: PageType; itemInfo: PropertyInfo }) => void;
}
const ValueDef = (props: ValueDefProps) => {
  console.log(props.info);
  const { info, onChange, closeDrawer } = props;
  const formDisabled = info.pageType === 'VIEW';
  const { needRequire, paramList, pageType } = info;
  console.log(paramList);
  const { getFieldDecorator, setFieldsValue, resetFields } = props.form;
  const [dataType, setDataType] = useState<string>('');
  const [arrDataType, setArrDataType] = useState<string>('');
  const [maxDirty, setMaxDirty] = useState<boolean>(false);
  const [stepDirty, setStepDirty] = useState<boolean>(false);

  const [dataInfo, setDataInfo] = useState<any>();
  const initQueryParam: QueryPropertyParam = {};
  const [{ queryParam, list, pagination }, setQueryParam] = useInitial<
    QueryPropertyRes,
    QueryPropertyParam
  >(getPropertyList, initQueryParam, []);
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    if (info.item) {
      const { id, access, valuedef, description } = info.item;
      const code = id ? id.split(':')[3] : '';
      const { type, specs } = valuedef;
      console.log(specs);
      setDataType(type);
      // ????????????????????????
      let fields: Record<string, any> = {
        displayName: info.item['display-name'],
        code,
        access,
        description,
        dataType: type,
      };
      if (needRequire) fields.required = info.item.required;
      // ???????????????????????? array?????????????????????????????????
      if (type === 'array') {
        fields = {
          ...fields,
          size: specs.size,
          type: specs.item.type,
          ...specs.item.specs,
        };
        setArrDataType(specs.item.type);
      } else if (type === 'enum') {
        const newEnumArr = Object.keys(specs.values).map((key) => ({
          [`${key}`]: specs.values[key],
        }));
        fields = {
          ...fields,
          enum: newEnumArr,
        };
      } else {
        fields = {
          ...fields,
          ...specs,
        };
      }
      console.log(fields);
      setDataInfo({ ...fields });
    } else {
      setDataInfo({
        displayName: '',
        code: '',
        access: '',
        description: '',
        dataType: '',
      });
      setDataType('');
      setArrDataType('');
      resetFields();
    }
  }, [info, needRequire, resetFields]);
  useEffect(() => {
    console.log(dataInfo);
    setMaxDirty(false);
    setStepDirty(false);
    setFieldsValue({ ...dataInfo });
  }, [dataInfo, setFieldsValue]);

  // ???????????????
  const handleDataTypeChange = (value: SelectValue) => {
    const type: string = value as string;
    console.log(type);
    setDataType(type);
    const {
      displayName,
      code,
      access,
      description,
      required,
    } = props.form.getFieldsValue();
    const $dataInfo: Record<string, any> = {
      displayName,
      code,
      access,
      description,
      dataType: type,
      ...PropTypeConfig[type].specInfo,
    };
    if (needRequire) $dataInfo.required = required;
    setDataInfo($dataInfo);
  };
  // array ??????????????????
  const handleArrDataTypeChange = (value: SelectValue) => {
    console.log(value);
    console.log('dataInfo', dataInfo);
    const size = props.form.getFieldValue('size');
    setDataInfo({
      ...dataInfo,
      type: value,
      size,
      ...ArrayTypeConfig[value as string].specInfo,
    });
    setArrDataType(value as string);
  };

  /**
   * @description ???????????????????????????
   */
  const handleSearch = (searchText: string) => {
    // setQueryParam({
    //   ...queryParam,
    //   pageNo: 1,
    //   pageSize: 100,
    //   order: '',
    //   isStd: -1,
    //   propDisplayName: searchText,
    // });
  };
  /**
   * @description  ????????????????????????
   */
  const pageChange = () => {
    const next = queryParam.pageNo ? queryParam.pageNo + 1 : 1;
    setQueryParam({ ...queryParam, pageNo: next });
  };
  /**
   * @description ??????????????????????????????
   */
  const displayNameChange = (value: any) => {
    console.log(value);
    // ???????????????????????????
    if (value.includes('|')) {
      const [propName, specName] = value.split('|');
      // ??????????????????
      queryPropertyInfo({ propName, specName }).then((res) => {
        // ???????????????????????????
        const {
          id,
          propDisplayName,
          description,
          valueDef,
          access,
          required,
        } = res.data;
        const { type, specs } =
          typeof valueDef === 'string' ? JSON.parse(valueDef) : valueDef;
        console.log(specs);
        setDataType(type);
        // ????????????????????????
        let fields: Record<string, any> = {
          displayName: propDisplayName,
          code: propName,
          access,
          description,
          dataType: type,
        };
        if (needRequire) fields.required = required;
        // ???????????????????????? array?????????????????????????????????
        if (type === 'array') {
          fields = {
            ...fields,
            size: (specs as ArrInfo).size,
            type: (specs as ArrInfo).item.type,
            ...(specs as ArrInfo).item.specs,
          };
          setArrDataType((specs as ArrInfo).item.type);
        } else if (type === 'enum') {
          const newEnumArr = Object.keys((specs as EnumInfo).values).map(
            (key) => ({
              key: (specs as EnumInfo).values[key],
            })
          );
          fields = {
            ...fields,
            enum: newEnumArr,
          };
        } else {
          fields = {
            ...fields,
            ...specs,
          };
        }
        console.log(fields);
        setDataInfo({ ...fields });
      });
    }
  };
  //  ??????????????????
  const onClose = () => {
    closeDrawer();
  };
  // ??????
  const onSave = () => {
    console.log('save--');
    props.form.validateFields((err, values: any) => {
      console.log(err, values);
      if (err) return;
      const {
        displayName,
        code,
        access,
        // eslint-disable-next-line no-shadow
        dataType,
        type,
        description,
        required,
        ...rest
      } = values;
      console.log('rest:', rest);
      let item: PropertyInfo = {
        'display-name': displayName,
        id: info.item ? info.item.id : `urn:user-spec-v1:property:${code}`,
        access,
        description,
        valuedef: {
          type: dataType,
          specs: rest,
        },
      };
      if (info.item) item.key = info.item.key;
      if (needRequire) item.required = required;
      console.log('item:', item);
      if (dataType === 'array') {
        const { size, ...strcutRest } = rest;
        const valuedef = {
          type: 'array',
          specs: {
            size,
            item: {
              type,
              specs: strcutRest,
            },
          },
        };
        item = { ...item, valuedef };
      }
      if (dataType === 'enum') {
        let enumSpecs = {};

        if (Array.isArray(rest['enum'])) {
          try {
            rest['enum'].forEach((eItem) => {
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
        const valuedef = {
          type: 'enum',
          specs: { values: enumSpecs },
        };
        item = { ...item, valuedef };
      }
      onChange({ pageType: info.pageType, itemInfo: item });
      props.form.resetFields();
    });
  };

  // ???????????????
  const validateNumRange = (rule: any, value: any, callback: any) => {
    const values = props.form.getFieldsValue();
    const newDataInfo = { ...dataInfo, ...values };
    if (newDataInfo.dataType === 'array') {
      validatorRange(rule, value, callback, newDataInfo.type);
    } else {
      validatorRange(rule, value, callback, newDataInfo.dataType);
    }
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
    const validateType: string =
      dataInfo.dataType === 'array' ? dataInfo.type : dataInfo.dataType;
    validatorStep(rule, value, callback, validateType, maxVal, minVal);
  };
  // ????????????
  const validateMaxLength = (rule: any, value: any, callback: any) => {
    if (dataType === 'array') {
      validateLength(rule, value, callback, arrDataType);
    } else {
      validateLength(rule, value, callback, dataType);
    }
  };
  // ??????????????????
  const validateArrMaxLength = (rule: any, value: any, callback: any) => {
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
      const curCode =
        info.item && info.item.id ? info.item.id.split(':')[3] : '';
      otherParams = paramList.filter(
        (item) => item.id.split(':')[3] !== curCode
      );
    }
    for (const event of otherParams) {
      if (event.id.split(':')[3] === value) {
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

  const options = list
    .map((item) => (
      <AutoCompleteOption
        key={item.propName}
        title={item.propName}
        value={`${item.propName}|${item.specName}|${item.propDisplayName}`}
      >
        {item.propDisplayName}???{item.propName}???
      </AutoCompleteOption>
    ))
    .concat([
      <AutoCompleteOption
        disabled
        key="pagination"
        className={pagination.lastPage > 1 ? 'show-pagination' : 'dsn'}
      >
        <Pagination
          simple
          hideOnSinglePage
          defaultCurrent={pagination.pageNo}
          total={pagination.total}
          onChange={pageChange}
        />
      </AutoCompleteOption>,
    ]);
  console.log(list, options);

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
                disabled={formDisabled}
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
                placeholder="???????????????????????????????????????1024"
                disabled={formDisabled}
              />
            )}
            <Tooltip title="binary??????base64??????????????????????????????????????????binary????????????????????????base64?????????">
              <span className="primary-color rule">????????????</span>
            </Tooltip>
          </Form.Item>
        );
      case 'array':
        return (
          <div className="array">
            <Form.Item label="??????????????????">
              {getFieldDecorator('size', {
                rules: [
                  { required: true, message: '???????????????????????????' },
                  { pattern: /^[1-9][0-9]*$/, message: '??????????????????????????????' },
                  { validator: validateArrMaxLength },
                ],
              })(
                <Input
                  disabled={formDisabled}
                  placeholder="???????????????????????????????????????128"
                />
              )}
            </Form.Item>
            <Form.Item label="?????????">
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '??????????????????' }],
              })(
                <Select
                  onChange={handleArrDataTypeChange}
                  disabled={formDisabled}
                  placeholder="??????????????????"
                >
                  {Object.keys(ArrayTypeConfig).map((key) => (
                    <Option key={key} value={key}>
                      {ArrayTypeConfig[key].displayName}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            {getDataConfig(arrDataType)}
          </div>
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
                  { validator: validateNumRange },
                  { validator: compareToMax },
                ],
              })(<Input placeholder="??????????????????" disabled={formDisabled} />)}
            </Form.Item>
            <Form.Item label="?????????">
              {getFieldDecorator('max', {
                rules: [
                  { required: true, message: '??????????????????' },
                  { validator: validateNumRange },
                  { validator: compareToMin },
                ],
              })(
                <Input
                  placeholder="??????????????????"
                  disabled={formDisabled}
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
                  placeholder="???????????????"
                  disabled={formDisabled}
                  onBlur={handleStepBlur}
                />
              )}
            </Form.Item>
            <Form.Item label="??????">
              {getFieldDecorator('unit')(
                <Select
                  className="basic-select"
                  placeholder="???????????????"
                  disabled={formDisabled}
                >
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
                <Input
                  maxLength={200}
                  placeholder="?????????????????????"
                  disabled={formDisabled}
                />
              )}
            </Form.Item>
          </div>
        );
      case 'enum':
        return (
          <Form.Item label="?????????">
            {getFieldDecorator('enum', {
              rules: [{ required: true, message: '??????????????????' }],
            })(<EnumTable disabled={formDisabled} />)}
          </Form.Item>
        );
      case 'struct':
        return (
          <Form.Item label="json??????">
            {getFieldDecorator('members', {
              rules: [{ required: true, message: '?????????json??????' }],
            })(<StructTable disabled={formDisabled} />)}
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
    <Form {...formItemLayout} className="value-def-form">
      {pageType === 'CREATE' ? (
        <Form.Item label="????????????" className="flex-form-item">
          {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '?????????????????????' },
              { pattern: displayNameReg, message: displayNameRule },
            ],
          })(
            <Input
              placeholder="?????????????????????????????????"
              disabled={formDisabled}
              maxLength={30}
            />
          )}
          {/* {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '?????????????????????' },
              { pattern: displayNameReg, message: displayNameRule },
              { validator: validateDisplayNameLength },
            ],
          })(
            <AutoComplete
              backfill
              dataSource={options}
              onSearch={handleSearch}
              onSelect={displayNameChange}
              placeholder="?????????????????????????????????"
              optionLabelProp="title"
              getPopupContainer={(triggerNode: HTMLElement) =>
                triggerNode.parentNode as HTMLElement
              }
            />
          )} */}
          <Tooltip title={displayNameRule}>
            <span className="primary-color rule">????????????</span>
          </Tooltip>
        </Form.Item>
      ) : (
        <Form.Item label="????????????" className="flex-form-item">
          {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '?????????????????????' },
              { pattern: displayNameReg, message: displayNameRule },
            ],
          })(
            <Input
              placeholder="?????????????????????????????????"
              disabled={formDisabled}
              maxLength={30}
            />
          )}
          <Tooltip title={displayNameRule}>
            <span className="primary-color rule">????????????</span>
          </Tooltip>
        </Form.Item>
      )}

      <Form.Item label="?????????" className="flex-form-item">
        {getFieldDecorator('code', {
          rules: [
            { required: true, message: '??????????????????' },
            { pattern: objectNameReg, message: objectNameRule },
            { validator: validateCode },
          ],
        })(
          <Input
            placeholder="????????????????????????UA"
            maxLength={30}
            disabled={formDisabled || pageType === 'EDIT'}
          />
        )}
        <Tooltip title={objectNameRule}>
          <span className="primary-color rule">????????????</span>
        </Tooltip>
      </Form.Item>

      <Form.Item label="????????????">
        {getFieldDecorator('access', {
          rules: [{ required: true, message: '?????????????????????' }],
        })(
          <RadioGroup disabled={formDisabled}>
            <Radio value="r">??????</Radio>
            <Radio value="w">??????</Radio>
            <Radio value="rw">??????</Radio>
          </RadioGroup>
        )}
      </Form.Item>
      {needRequire && (
        <Form.Item label="????????????">
          {getFieldDecorator('required', {
            rules: [{ required: true, message: '???????????????????????????????????????' }],
          })(
            <RadioGroup disabled={formDisabled}>
              <Radio value>???</Radio>
              <Radio value={false}>???</Radio>
            </RadioGroup>
          )}
          <Tooltip title="??????????????????????????????????????????????????????????????????????????????">
            <span className="primary-color rule">????????????</span>
          </Tooltip>
        </Form.Item>
      )}

      <Form.Item label="?????????">
        {getFieldDecorator('dataType', {
          rules: [{ required: true, message: '??????????????????' }],
        })(
          <Select
            onChange={handleDataTypeChange}
            disabled={formDisabled}
            placeholder="??????????????????"
          >
            {Object.keys(PropTypeConfig).map((key) => (
              <Option key={key} value={key}>
                {PropTypeConfig[key].displayName}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>
      {getDataConfig(dataType)}
      <Form.Item label="??????">
        {getFieldDecorator('description')(
          <Textarea
            maxLength={200}
            placeholder="???????????????"
            disabled={formDisabled}
          />
        )}
      </Form.Item>
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
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          ??????
        </Button>
        {info.pageType !== 'VIEW' && (
          <Button onClick={onSave} type="primary">
            ??????
          </Button>
        )}
      </div>
    </Form>
  );
};

export default Form.create<ValueDefProps>()(ValueDef);
