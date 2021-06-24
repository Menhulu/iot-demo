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
      // 拆成平铺数据结构
      let fields: Record<string, any> = {
        displayName: info.item['display-name'],
        code,
        access,
        description,
        dataType: type,
      };
      if (needRequire) fields.required = info.item.required;
      // 拆成平铺数据结构 array类型层级多需要特殊处理
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

  // 选择值类型
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
  // array 类型下的类型
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
   * @description 查询属性库快速填充
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
   * @description  模型名称下拉翻页
   */
  const pageChange = () => {
    const next = queryParam.pageNo ? queryParam.pageNo + 1 : 1;
    setQueryParam({ ...queryParam, pageNo: next });
  };
  /**
   * @description 选择或者输入模型名称
   */
  const displayNameChange = (value: any) => {
    console.log(value);
    // 选择已有的某一属性
    if (value.includes('|')) {
      const [propName, specName] = value.split('|');
      // 查询模型信息
      queryPropertyInfo({ propName, specName }).then((res) => {
        // 调整结构给表单赋值
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
        // 拆成平铺数据结构
        let fields: Record<string, any> = {
          displayName: propDisplayName,
          code: propName,
          access,
          description,
          dataType: type,
        };
        if (needRequire) fields.required = required;
        // 拆成平铺数据结构 array类型层级多需要特殊处理
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
  //  点击取消弹窗
  const onClose = () => {
    closeDrawer();
  };
  // 保存
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
                  throw Error('枚举值说明是必填项');
                } else {
                  enumSpecs = { ...enumSpecs, ...eItem };
                }
              });
            });
          } catch (error) {
            Toast('枚举值说明是必填项');
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

  // 校验值范围
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
  // 校验最大值和步长值
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
  // 校验最小值和步长值
  const compareToMin = (rule: any, value: any, callback: any) => {
    const minVal = props.form.getFieldValue('min');
    const stepVal = props.form.getFieldValue('step');

    if (value && Number(value) <= Number(minVal)) {
      callback('最大值必须大于最小值');
    } else if (value && stepDirty && stepVal) {
      props.form.validateFields(['step'], { force: true });
    }
    callback();
  };
  // 校验步长值
  const validateStep = (rule: any, value: string, callback: any) => {
    const minVal = props.form.getFieldValue('min');
    const maxVal = props.form.getFieldValue('max');
    const validateType: string =
      dataInfo.dataType === 'array' ? dataInfo.type : dataInfo.dataType;
    validatorStep(rule, value, callback, validateType, maxVal, minVal);
  };
  // 校验长度
  const validateMaxLength = (rule: any, value: any, callback: any) => {
    if (dataType === 'array') {
      validateLength(rule, value, callback, arrDataType);
    } else {
      validateLength(rule, value, callback, dataType);
    }
  };
  // 校验数组长度
  const validateArrMaxLength = (rule: any, value: any, callback: any) => {
    validateLength(rule, value, callback, dataType);
  };
  // 校验标识符重复
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
      // 编辑态先去掉当前事件
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
      callback('标识符不能重复');
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
        {item.propDisplayName}（{item.propName}）
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
          <Form.Item label="长度">
            {getFieldDecorator('length', {
              rules: [
                { required: true, message: '请输入字符长度' },
                { pattern: /^[1-9][0-9]*$/, message: '长度仅支持正整数' },
                { validator: validateMaxLength },
              ],
            })(
              <Input
                disabled={formDisabled}
                placeholder="请输入长度限制，最大长度为1024"
              />
            )}
          </Form.Item>
        );
      case 'binary':
        return (
          <Form.Item label="长度" className="flex-form-item">
            {getFieldDecorator('length', {
              rules: [
                { required: true, message: '请输入字符长度' },
                { pattern: /^[1-9][0-9]*$/, message: '长度仅支持正整数' },
                { validator: validateMaxLength },
              ],
            })(
              <Input
                placeholder="请输入长度限制，最大长度为1024"
                disabled={formDisabled}
              />
            )}
            <Tooltip title="binary经过base64转换之后的最大长度，需要注意binary在传输时需要转成base64字符串">
              <span className="primary-color rule">查看说明</span>
            </Tooltip>
          </Form.Item>
        );
      case 'array':
        return (
          <div className="array">
            <Form.Item label="数组最大长度">
              {getFieldDecorator('size', {
                rules: [
                  { required: true, message: '请输入数组最大长度' },
                  { pattern: /^[1-9][0-9]*$/, message: '数组长度仅支持正整数' },
                  { validator: validateArrMaxLength },
                ],
              })(
                <Input
                  disabled={formDisabled}
                  placeholder="请输入长度限制，最大长度为128"
                />
              )}
            </Form.Item>
            <Form.Item label="值类型">
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择值类型' }],
              })(
                <Select
                  onChange={handleArrDataTypeChange}
                  disabled={formDisabled}
                  placeholder="请选择值类型"
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
            <Form.Item label="最小值">
              {getFieldDecorator('min', {
                rules: [
                  { required: true, message: '请输入最小值' },
                  { validator: validateNumRange },
                  { validator: compareToMax },
                ],
              })(<Input placeholder="请输入最小值" disabled={formDisabled} />)}
            </Form.Item>
            <Form.Item label="最大值">
              {getFieldDecorator('max', {
                rules: [
                  { required: true, message: '请输入最大值' },
                  { validator: validateNumRange },
                  { validator: compareToMin },
                ],
              })(
                <Input
                  placeholder="请输入最大值"
                  disabled={formDisabled}
                  onBlur={handleMaxBlur}
                />
              )}
            </Form.Item>
            <Form.Item label="步长">
              {getFieldDecorator('step', {
                rules: [
                  { required: true, message: '请输入步长值' },
                  { validator: validateStep },
                ],
              })(
                <Input
                  placeholder="请输入步长"
                  disabled={formDisabled}
                  onBlur={handleStepBlur}
                />
              )}
            </Form.Item>
            <Form.Item label="单位">
              {getFieldDecorator('unit')(
                <Select
                  className="basic-select"
                  placeholder="请选择单位"
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
            <Form.Item label="单位描述">
              {getFieldDecorator('unitdesc')(
                <Input
                  maxLength={200}
                  placeholder="请输入单位描述"
                  disabled={formDisabled}
                />
              )}
            </Form.Item>
          </div>
        );
      case 'enum':
        return (
          <Form.Item label="枚举值">
            {getFieldDecorator('enum', {
              rules: [{ required: true, message: '请填写枚举值' }],
            })(<EnumTable disabled={formDisabled} />)}
          </Form.Item>
        );
      case 'struct':
        return (
          <Form.Item label="json对象">
            {getFieldDecorator('members', {
              rules: [{ required: true, message: '请填写json对象' }],
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
        <Form.Item label="功能名称" className="flex-form-item">
          {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '请输入功能名称' },
              { pattern: displayNameReg, message: displayNameRule },
            ],
          })(
            <Input
              placeholder="请输入功能名称，如电压"
              disabled={formDisabled}
              maxLength={30}
            />
          )}
          {/* {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '请输入功能名称' },
              { pattern: displayNameReg, message: displayNameRule },
              { validator: validateDisplayNameLength },
            ],
          })(
            <AutoComplete
              backfill
              dataSource={options}
              onSearch={handleSearch}
              onSelect={displayNameChange}
              placeholder="请输入功能名称，如电压"
              optionLabelProp="title"
              getPopupContainer={(triggerNode: HTMLElement) =>
                triggerNode.parentNode as HTMLElement
              }
            />
          )} */}
          <Tooltip title={displayNameRule}>
            <span className="primary-color rule">查看规则</span>
          </Tooltip>
        </Form.Item>
      ) : (
        <Form.Item label="功能名称" className="flex-form-item">
          {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '请输入功能名称' },
              { pattern: displayNameReg, message: displayNameRule },
            ],
          })(
            <Input
              placeholder="请输入功能名称，如电压"
              disabled={formDisabled}
              maxLength={30}
            />
          )}
          <Tooltip title={displayNameRule}>
            <span className="primary-color rule">查看规则</span>
          </Tooltip>
        </Form.Item>
      )}

      <Form.Item label="标识符" className="flex-form-item">
        {getFieldDecorator('code', {
          rules: [
            { required: true, message: '请输入标识符' },
            { pattern: objectNameReg, message: objectNameRule },
            { validator: validateCode },
          ],
        })(
          <Input
            placeholder="请输入标识符，如UA"
            maxLength={30}
            disabled={formDisabled || pageType === 'EDIT'}
          />
        )}
        <Tooltip title={objectNameRule}>
          <span className="primary-color rule">查看规则</span>
        </Tooltip>
      </Form.Item>

      <Form.Item label="读写权限">
        {getFieldDecorator('access', {
          rules: [{ required: true, message: '请选择读写权限' }],
        })(
          <RadioGroup disabled={formDisabled}>
            <Radio value="r">只读</Radio>
            <Radio value="w">只写</Radio>
            <Radio value="rw">读写</Radio>
          </RadioGroup>
        )}
      </Form.Item>
      {needRequire && (
        <Form.Item label="是否必选">
          {getFieldDecorator('required', {
            rules: [{ required: true, message: '请选择此属性是否为必须属性' }],
          })(
            <RadioGroup disabled={formDisabled}>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
          <Tooltip title="限制此属性在创建物模型时，是否必选，必选属性不可删除">
            <span className="primary-color rule">查看说明</span>
          </Tooltip>
        </Form.Item>
      )}

      <Form.Item label="值类型">
        {getFieldDecorator('dataType', {
          rules: [{ required: true, message: '请选择值类型' }],
        })(
          <Select
            onChange={handleDataTypeChange}
            disabled={formDisabled}
            placeholder="请选择值类型"
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
      <Form.Item label="描述">
        {getFieldDecorator('description')(
          <Textarea
            maxLength={200}
            placeholder="请输入描述"
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
          取消
        </Button>
        {info.pageType !== 'VIEW' && (
          <Button onClick={onSave} type="primary">
            确定
          </Button>
        )}
      </div>
    </Form>
  );
};

export default Form.create<ValueDefProps>()(ValueDef);
