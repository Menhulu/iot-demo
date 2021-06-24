import React, { useContext } from 'react';
import { Form, Input, Button, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';
import { CreateEditContext, SET_CDMODAL_SHOW } from '../context';
import { CreateEditDataDicInfo } from '../../types';
import { createComDicList, updateComDicList } from '../../services';

import './index.less';

type CreateEditFormProps = FormComponentProps;

const CreateEditForm = (props: CreateEditFormProps) => {
  const { state, dispatch } = useContext(CreateEditContext);
  const { createEditInfo } = state;
  const { getFieldDecorator } = props.form;

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };

  /**
   * @description: 点击触发提交
   * @param {type}
   * @return:
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    props.form.validateFieldsAndScroll(
      (err: Array<string>, values: CreateEditDataDicInfo) => {
        if (!err) {
          const { id } = values;
          if (id) {
            // 编辑
            try {
              updateComDicList(values).then((res) => {
                console.log(res, 'updateComDicList--');
                if (res && res.code === 200) {
                  Toast('保存成功');
                  props.form.resetFields();
                  dispatch({
                    type: SET_CDMODAL_SHOW,
                    iscreateEditShow: false,
                  });
                } else {
                  Toast('保存失败');
                  props.form.resetFields();
                  dispatch({
                    type: SET_CDMODAL_SHOW,
                    iscreateEditShow: false,
                  });
                }
              });
            } catch (error) {
              Toast('保存失败');
              props.form.resetFields();
              dispatch({
                type: SET_CDMODAL_SHOW,
                iscreateEditShow: false,
              });
            }
          } else {
            // 创建
            try {
              createComDicList(values).then((res) => {
                if (res && res.code === 200) {
                  Toast('创建成功');
                  props.form.resetFields();
                  dispatch({
                    type: SET_CDMODAL_SHOW,
                    iscreateEditShow: false,
                  });
                } else {
                  Toast('创建失败');
                  props.form.resetFields();
                  dispatch({
                    type: SET_CDMODAL_SHOW,
                    iscreateEditShow: false,
                  });
                }
              });
            } catch (error) {
              Toast('创建失败');
              props.form.resetFields();
              dispatch({
                type: SET_CDMODAL_SHOW,
                iscreateEditShow: false,
              });
            }
          }
        }
      }
    );
  }

  /**
   * @description: 点击取消
   * @param {type}
   * @return:
   */
  function handleCancel() {
    dispatch({
      type: SET_CDMODAL_SHOW,
      iscreateEditShow: false,
    });
    props.form.resetFields();
  }

  return (
    <Form className="form-modal" {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="id" className="form-item" style={{ display: 'none' }}>
        {getFieldDecorator('id', { initialValue: createEditInfo.id || '' })(
          <Input name="id" />
        )}
      </Form.Item>
      <Form.Item label="类型">
        {getFieldDecorator('type', {
          rules: [
            {
              required: true,
              message: '类型不能为空',
            },
            {
              pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
              message: '类型仅支持中、英文',
            },
          ],
          initialValue: createEditInfo.type || '',
        })(
          <Input
            placeholder="请输入类型，例如：风险等级"
            name="type"
            maxLength={64}
          />
        )}
        <span className="tips">仅支持中文或英文</span>
      </Form.Item>
      <Form.Item label="名称">
        {getFieldDecorator('name', {
          rules: [
            {
              required: true,
              message: '名称不能为空',
            },
            {
              pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
              message: '名称仅支持中、英文',
            },
          ],
          initialValue: createEditInfo.name || '',
        })(
          <Input
            placeholder="请输入名称，例如：风险"
            name="name"
            maxLength={64}
          />
        )}
        <span className="tips">仅支持中文或英文</span>
      </Form.Item>
      <Form.Item label="编码">
        {getFieldDecorator('code', {
          rules: [
            {
              required: true,
              message: '编码不能为空',
            },
            {
              pattern: /^[0-9a-zA-Z]+$/,
              message: '编码仅支持数字和英文',
            },
          ],
          initialValue: createEditInfo.code || '',
        })(
          <Input
            placeholder="请输入编码，例如：001"
            name="code"
            maxLength={30}
          />
        )}
      </Form.Item>
      <Form.Item label="排序">
        {getFieldDecorator('dictOrder', {
          rules: [
            {
              required: true,
              message: '排序不能为空',
            },
            {
              pattern: /^[0-9]+$/,
              message: '排序仅支持数字',
            },
          ],
          initialValue: createEditInfo.dictOrder || '',
        })(
          <InputNumber
            placeholder="请输入排序，例如：1"
            name="dictOrder"
            maxLength={30}
          />
        )}
      </Form.Item>
      <Form.Item className="form-btn-item">
        <Button type="primary" htmlType="submit">
          {createEditInfo.id ? '保存' : '创建'}
        </Button>
        <Button onClick={() => handleCancel()}>取消</Button>
      </Form.Item>
    </Form>
  );
};

const CreateEditFormWrap = Form.create<CreateEditFormProps>()(CreateEditForm);

const CreateEditModal = (props: any) => {
  const { state, dispatch } = useContext(CreateEditContext);
  const { createEditInfo, iscreateEditShow } = state;
  /**
   * @description: 点击取消
   * @param {type}
   * @return:
   */
  function handelCancel() {
    dispatch({
      type: SET_CDMODAL_SHOW,
      iscreateEditShow: false,
    });
  }

  return (
    <Modal
      wrapClassName="create-edit-modal"
      title={createEditInfo.id ? '编辑通用字典' : '创建通用字典'}
      visible={iscreateEditShow}
      width={800}
      footer={null}
      onCancel={handelCancel}
    >
      <CreateEditFormWrap />
    </Modal>
  );
};

export default CreateEditModal;
