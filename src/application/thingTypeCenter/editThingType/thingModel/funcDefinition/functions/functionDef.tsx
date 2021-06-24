/**
 * @author: zhaohongyun1@jd.com
 * @description: 添加&编辑事件的drawer内容
 */
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Radio,
  Button,
  AutoComplete,
  Pagination,
  Tooltip,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Textarea from 'components/TextArea';
import useInitial from 'common/customHooks/useInitialList';
import {
  getFuncList,
  queryFuncInfo,
} from 'application/thingTypeCenter/services/thingModelApi';
import {
  displayNameReg,
  objectNameReg,
  displayNameRule,
  objectNameRule,
} from '../property/constant';

import {
  FuncOperationInfo,
  FunctionInfo,
  PageType,
  QueryFuncParam,
  QueryFuncRes,
} from '../../../../types/funcDefinition';
import ParamsTable from './paramsTable';

import './functionDef.less';
import { validateDisplayNameLength } from '../utils';

const RadioGroup = Radio.Group;
const AutoCompleteOption = AutoComplete.Option;

interface FunctionDefProps extends FormComponentProps {
  info: FuncOperationInfo; // 主要使用pageType和itemInfo进行操作和条件判断
  closeDrawer: () => void; // 关闭抽屉层
  onChange: (param: { pageType: PageType; itemInfo: FunctionInfo }) => void; // 本组件保存信息传回上层进行保存
}

const FunctionDef = (props: FunctionDefProps) => {
  console.log(props.info);
  const { info, onChange, closeDrawer } = props;
  const { needRequire, functionList, pageType, hasModelKey } = info;
  const formDisabled = pageType === 'VIEW';

  const { getFieldDecorator, setFieldsValue, resetFields } = props.form;
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  const initQueryParam: QueryFuncParam = {};
  const [{ queryParam, list, pagination }, setQueryParam] = useInitial<
    QueryFuncRes,
    QueryFuncParam
  >(getFuncList, initQueryParam, []);
  // 编辑态初始化表单
  useEffect(() => {
    console.log(info);
    if (info.itemInfo) {
      const { id, required, description, out } = info.itemInfo;
      const code = id ? id.split(':')[3] : '';
      const fields: Record<string, any> = {
        displayName: info.itemInfo['display-name'],
        code,
        description,
        inParams: info.itemInfo['in'],
        outParams: out,
      };
      if (needRequire) fields.required = required;
      console.log('params fields', fields);
      setFieldsValue({
        ...fields,
      });
    } else {
      setFieldsValue({
        displayName: '',
        code: '',
        description: '',
        inParams: [],
        outParams: [],
      });
    }
  }, [info, needRequire, setFieldsValue]);
  /**
   * @description 查询模型库快速填充
   */
  const handleSearch = (searchText: string) => {
    // setQueryParam({
    //   ...queryParam,
    //   pageNo: 1,
    //   pageSize: 100,
    //   order: '',
    //   isStd: -1,
    //   funcDisplayName: searchText,
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
    // 选择已有的某一模型
    if (value.includes('|')) {
      const [funcName, specName] = value.split('|');
      // 查询模型信息
      queryFuncInfo({ funcName, specName }).then(res => {
        const { funcDisplayName, description, out, required } = res.data;
        const fields: Record<string, any> = {
          displayName: funcDisplayName,
          code: funcName,
          description,
          inParams: JSON.parse(res.data['in']),
          outParams: JSON.parse(out),
        };
        if (needRequire) fields.required = required;
        setFieldsValue({
          ...fields,
        });
      });
    }
  };
  //  点击取消弹窗
  const onClose = () => {
    closeDrawer();
  };
  // 保存 通过onChange 将数据传回上层
  const onSave = () => {
    props.form.validateFields((err, values: any) => {
      console.log(values);
      if (err) return;
      const {
        displayName,
        code,
        required,
        description,
        inParams,
        outParams,
      } = values;
      const item: FunctionInfo = {
        'display-name': displayName,
        id: `urn:user-spec-v1:function:${code}`,
        description,
        in: inParams,
        out: outParams,
      };
      if (info.itemInfo && info.itemInfo.key) item.key = info.itemInfo.key;
      if (needRequire) item.required = required;
      onChange({ pageType: info.pageType, itemInfo: item });
      props.form.resetFields();
    });
  };
  // 校验标识符重复
  const validateCode = (
    rule: any,
    value: string,
    callback: (message?: string) => void
  ) => {
    let otherFunctions = [...functionList];
    let flag = false;
    if (pageType === 'EDIT') {
      // 编辑态先去掉当前事件
      const curCode =
        info.itemInfo && info.itemInfo.id ? info.itemInfo.id.split(':')[3] : '';
      otherFunctions = functionList.filter(
        item => item.id.split(':')[3] !== curCode
      );
    }
    for (const event of otherFunctions) {
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
  // 自动补全下拉
  const options = list
    .map(item => (
      <AutoCompleteOption
        key={item.funcName}
        title={item.funcName}
        value={`${item.funcName}|${item.specName}`}
      >
        {item.funcDisplayName}（{item.funcName}）
        {/* <span className="certain-search-item-count">
          {item.isStd ? '标准方法' : '自定义方法'}
        </span> */}
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
  return (
    <Form {...formItemLayout} className="value-def-form">
      {pageType === 'CREATE' ? (
        <Form.Item label="功能名称" className="flex-form-item">
          {/* {getFieldDecorator('displayName', {
            rules: [
              { required: true, message: '请输入模型名称' },
              { pattern: displayNameReg, message: displayNameRule },
              { validator: validateDisplayNameLength },
            ],
          })(
            <AutoComplete
              dataSource={options}
              onSearch={handleSearch}
              onSelect={displayNameChange}
              optionLabelProp="title"
              placeholder="请输入功能名称，如电压"
              getPopupContainer={(triggerNode: HTMLElement) =>
                triggerNode.parentNode as HTMLElement
              }
            />
          )} */}
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
      {needRequire && (
        <Form.Item label="是否必选">
          {getFieldDecorator('required', {
            rules: [{ required: true, message: '请选择此方法是否必选' }],
          })(
            <RadioGroup disabled={formDisabled}>
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
          <Tooltip title="限制此方法在创建物模型时，是否必选，必选方法不可删除">
            <span className="primary-color rule">查看说明</span>
          </Tooltip>
        </Form.Item>
      )}

      <Form.Item label="输入参数">
        {getFieldDecorator('inParams', {
          // rules: [{ required: true, message: '请填写输入参数' }],
        })(
          // 自定义表单，通过forwardRef添加ref支持，默认会传入value和onChange两个属性，能够与表单关联起来
          <ParamsTable disabled={formDisabled} hasModelKey={hasModelKey} />
        )}
      </Form.Item>
      <Form.Item label="输出参数">
        {getFieldDecorator('outParams', {
          // rules: [{ required: true, message: '请填写输出参数' }],
        })(
          // 自定义表单，通过forwardRef添加ref支持，默认会传入value和onChange两个属性，能够与表单关联起来
          <ParamsTable disabled={formDisabled} hasModelKey={hasModelKey} />
        )}
      </Form.Item>
      <Form.Item label="描述">
        {getFieldDecorator('description')(
          <Textarea disabled={formDisabled} maxLength={200} />
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

export default Form.create<FunctionDefProps>()(FunctionDef);
