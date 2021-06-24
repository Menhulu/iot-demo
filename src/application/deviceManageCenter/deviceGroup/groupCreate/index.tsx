import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Form, Input, Row, Col, Cascader } from 'antd';

import AuthButton from 'components/AuthButton';
import Textarea from 'components/TextArea';
import Toast from 'components/SimpleToast';

import { EditContext, SET_REFRESH_GROUP_LIST } from '../context';

import { addGroup } from '../../services/deviceGroup';
import { DeviceGroupInfo } from '../../types';
import './index.less';

// 分组信息的form

const InfoForm = (props: any) => {
  const { state, dispatch } = useContext(EditContext);
  const { editInfo, authVOList, groupList, plainGroupList } = state;
  const { getFieldDecorator, setFieldsValue } = props.form;

  // 创建一个groupInfo，用来点击创建的时候添加数据
  const initGroupInfo = {
    level: 1,
    parentId: 0,
    rootFlag: true,
  };
  const [groupInfo, setGroupInfo] = useState<
    Pick<DeviceGroupInfo, 'level' | 'parentId' | 'rootFlag'>
  >(initGroupInfo);

  const findParentIds = useCallback(
    (parentId: number, list: DeviceGroupInfo[]) => {
      let parentIds: number[] = [];
      let pId = parentId;
      let parent: DeviceGroupInfo | undefined;
      do {
        parent = list.find((item) => item.id === pId);
        if (parent) {
          pId = parent.parentId;
          parentIds.unshift(parent.id);
        }
      } while (parent && parent.parentId);
      return parentIds;
    },
    []
  );
  useEffect(() => {
    setGroupInfo({
      level: editInfo.level + 1,
      parentId: editInfo.id,
      rootFlag: editInfo.level === 0,
    });
    if (editInfo.parentId) {
      const parentIds = findParentIds(editInfo.parentId, plainGroupList);
      console.log(parentIds);
      setFieldsValue({
        parentId: [...parentIds, editInfo.id],
        groupName: '',
        description: '',
      });
    } else if (editInfo.id) {
      setFieldsValue({
        parentId: [editInfo.id],
        groupName: '',
        description: '',
      });
    } else {
      setFieldsValue({ parentId: [], groupName: '', description: '' });
    }
  }, [editInfo, findParentIds, groupList, plainGroupList, setFieldsValue]);
  const handleParentChange = (
    value: string[],
    selectedOptions?: any[] | undefined
  ) => {
    if (selectedOptions) {
      console.log(selectedOptions);
      setGroupInfo({
        level: selectedOptions[selectedOptions.length - 1].level + 1,
        parentId: selectedOptions[selectedOptions.length - 1].id,
        rootFlag: false,
      });
    }
  };
  /**
   * @description: 点击创建按钮的时候触发
   * @param {type}
   * @return:
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFieldsAndScroll(
      (err: Array<string>, values: DeviceGroupInfo) => {
        const { groupName, description } = values;
        if (!err) {
          addGroup({ ...groupInfo, groupName, description }).then((res) => {
            if (res.code === 200) {
              Toast('保存成功');
              dispatch({
                type: SET_REFRESH_GROUP_LIST,
                refreshGroupList: true,
              });
            }
          });
        }
      }
    );
  };

  console.log(editInfo);
  return (
    <div className="dev-group-create">
      <header>
        <h3 className="title">新建分组</h3>
      </header>
      <Form className="basic-info-form" onSubmit={handleSubmit} colon={false}>
        <Row className="basic-form-row">
          <Col span={24}>
            <Form.Item label="选择父级" className="form-item">
              {getFieldDecorator('parentId')(
                <Cascader
                  placeholder="请选择父级"
                  disabled={!!editInfo.id}
                  options={groupList}
                  onChange={handleParentChange}
                  fieldNames={{
                    label: 'groupName',
                    value: 'id',
                    children: 'children',
                  }}
                  changeOnSelect
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={24}>
            <Form.Item label="分组名" className="form-item">
              {getFieldDecorator('groupName', {
                rules: [
                  {
                    required: true,
                    message: '分组名不能为空',
                  },
                ],
              })(
                <Input
                  placeholder="仅支持30个字符"
                  maxLength={30}
                  name="groupName"
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row className="basic-form-row">
          <Col span={24}>
            <Form.Item label="分组描述" className="form-item">
              {getFieldDecorator('description')(
                <Textarea
                  rows={3}
                  placeholder="简单描述一下分组"
                  maxLength={200}
                  name="description"
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        <div className="submit-btn-wrap">
          <AuthButton
            type="primary"
            buttonKey="CREATE_PERMISSION"
            htmlType="submit"
            className="create-btn"
            routeAuthVOList={authVOList}
          >
            创建
          </AuthButton>
        </div>
      </Form>
    </div>
  );
};

export default Form.create()(InfoForm);
