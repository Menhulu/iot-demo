import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Tree, Tooltip } from 'antd';

import Header from 'components/Header/index';
import Modal from 'components/Modal/index';
import Toast from 'components/SimpleToast/index';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import AuthButton from 'components/AuthButton/index';
import GroupCreate from './groupCreate';
import GroupEdit from './groupEdit';
import EditContextWrap, {
  EditContext,
  SET_REFRESH_GROUP_LIST,
  SET_AUTH_VO_LIST,
  SET_GROUP_LIST,
  SET_EDIT_INFO,
  SET_PLAIN_GROUP_LIST,
} from './context';
import { DeviceGroupInfo } from '../types/deviceGroup';
import { getGroupList, delGroup } from '../services/deviceGroup';
import './index.less';

const { TreeNode } = Tree;
function DeviceGroup(props: any) {
  const { state, dispatch } = useContext(EditContext);
  const { refreshGroupList, groupList, editInfo } = state;

  // 页面按钮权限
  const authVOList =
    props.route && props.route.authVOList ? props.route.authVOList : [];

  const [showNewGroup, setShowNewGroup] = useState(true); // 是否展示新建分组页面
  const [originGroupList, setOriginGroupList] = useState<DeviceGroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [showDelModel, setShowDelModel] = useState<boolean>(false);
  const initEditInfo = {
    deviceNum: 0,
    onlineNum: 0,
    description: '',
    groupName: '',
    id: 0,
    level: 0,
    parentId: 0,

    rootFlag: true,
    createTime: 0,
    groupNameChangeFlag: false,
    children: [],
  };
  // 点击增加分组
  const onAddGroupClick = () => {
    setShowNewGroup(true);

    dispatch({
      type: SET_EDIT_INFO,
      editInfo: initEditInfo,
    });
  };
  // 新增下级分组
  const setAddGroup = (item: DeviceGroupInfo) => {
    setShowNewGroup(true);
    dispatch({
      type: SET_EDIT_INFO,
      editInfo: item,
    });
  };
  // 选择分组
  const onSelect = (item: DeviceGroupInfo) => {
    console.log(item);
    dispatch({
      type: SET_EDIT_INFO,
      editInfo: item,
    });
    setShowNewGroup(false);
    const newExpandedKeys = [...expandedKeys, item.id.toString()];
    setExpandedKeys(Array.from(new Set(newExpandedKeys)));
  };
  // 删除
  const setDelGroup = (item: DeviceGroupInfo) => {
    setShowDelModel(true);
    dispatch({
      type: SET_EDIT_INFO,
      editInfo: item,
    });
  };

  // 展开收起
  const onExpand = (selectedKeys: string[], info: any) => {
    setExpandedKeys(selectedKeys);
  };
  // 生成树形结构
  const makeTree = useCallback(
    (
      items: DeviceGroupInfo[],
      id = 0,
      link: keyof DeviceGroupInfo = 'parentId'
    ): any => {
      return items
        .filter((item: DeviceGroupInfo) => item[link] === id)
        .map((item) => {
          item.children = makeTree(items, item.id);
          item.isLeaf = !item.children.length;

          if (!item.children.length) {
            Reflect.deleteProperty(item, 'children');
          }
          return item;
        });
    },
    []
  );

  // 渲染树节点
  const renderTreeNode = (list: DeviceGroupInfo[]) => {
    return list.map((item: DeviceGroupInfo) => (
      <TreeNode
        title={
          <>
            <Tooltip
              title={item.groupName}
              placement="bottom"
              overlayClassName="table-cell-tooltip"
            >
              <span
                className="group-name"
                onClick={() => {
                  onSelect(item);
                }}
              >
                {item.groupName}
              </span>
            </Tooltip>

            <AuthButton
              type="link"
              buttonKey="DELETE_PERMISSION"
              routeAuthVOList={authVOList}
              className="icon-plus"
              title="新增分组"
              onClick={() => {
                console.log('新增分组');
                setAddGroup(item);
              }}
            >
              <span className="icon-add-to" />
            </AuthButton>

            <AuthButton
              type="link"
              buttonKey="DELETE_PERMISSION"
              routeAuthVOList={authVOList}
              className="icon-delete"
              title="删除"
              onClick={() => {
                setDelGroup(item);
              }}
            >
              <span className="icon-delete" />
            </AuthButton>
          </>
        }
        key={`${item.id}`}
      >
        {item.children && renderTreeNode(item.children)}
      </TreeNode>
    ));
  };
  // 获取分组列表
  const fetchData = useCallback(() => {
    refreshGroupList &&
      getGroupList()
        .then((res) => {
          if (res && res.code === 200) {
            const listTree = makeTree(res.data);
            dispatch({
              type: SET_GROUP_LIST,
              groupList: listTree,
            });
            dispatch({
              type: SET_PLAIN_GROUP_LIST,
              plainGroupList: res.data,
            });
            setLoading(false);
            setOriginGroupList(res.data);
          } else {
            dispatch({
              type: SET_GROUP_LIST,
              groupList: [],
            });
            dispatch({
              type: SET_PLAIN_GROUP_LIST,
              plainGroupList: [],
            });
            setLoading(false);
            setOriginGroupList([]);
          }
        })
        ['catch']((err) => {
          dispatch({
            type: SET_GROUP_LIST,
            groupList: [],
          });
          dispatch({
            type: SET_PLAIN_GROUP_LIST,
            plainGroupList: [],
          });
          setLoading(false);
          setOriginGroupList([]);
        })
        ['finally'](() => {
          dispatch({
            type: SET_REFRESH_GROUP_LIST,
            refreshGroupList: false,
          });
        });
  }, [dispatch, makeTree, refreshGroupList]);

  // 确定删除，调用删除接口
  const handleOk = () => {
    console.log(editInfo, '=========================');
    delGroup({
      groupId: editInfo.id,
      deviceGroupName: editInfo.groupName,
    })
      .then((res) => {
        if (res.code === 200) {
          Toast('删除成功');
          setShowDelModel(false);
          dispatch({
            type: SET_REFRESH_GROUP_LIST,
            refreshGroupList: true,
          });
          const parentItem = originGroupList.find(
            (item) => item.id === editInfo.parentId
          );
          console.log(parentItem);
          dispatch({
            type: SET_EDIT_INFO,
            editInfo: parentItem || initEditInfo,
          });
          if (parentItem) {
            setExpandedKeys([
              parentItem.parentId.toString(),
              parentItem.id.toString(),
            ]);
          } else {
            setShowNewGroup(true);
          }
        }
      })
      ['catch']((err) => {
        //
      });
  };
  const handleCancel = () => {
    setShowDelModel(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    dispatch({
      type: SET_AUTH_VO_LIST,
      authVOList,
    });
  }, [authVOList, dispatch]);

  return (
    <div className="device-group">
      <Header title="设备分组" />
      <ObtainHeight>
        <div className="device-group-box">
          <div className="device-group-tree">
            <div className="device-group-tree-header">
              <span className="title">分组列表</span>
              <span
                className="cursor-pointer primary-color f-r"
                onClick={onAddGroupClick}
              >
                <span className="icon-add-to" /> 添加分组
              </span>
            </div>
            <div className="device-group-tree-content">
              {!loading && (
                <Tree
                  expandedKeys={expandedKeys}
                  selectedKeys={[editInfo.id.toString()]}
                  onExpand={onExpand}
                >
                  {renderTreeNode(groupList)}
                </Tree>
              )}
            </div>
          </div>
          <div className="device-group-main">
            {showNewGroup ? <GroupCreate /> : <GroupEdit />}
          </div>
        </div>
      </ObtainHeight>
      <Modal
        title="删除分组提示"
        visible={showDelModel}
        onOk={handleOk}
        onCancel={handleCancel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>设备分组删除后不可恢复，您确定要删除吗？</p>
      </Modal>
    </div>
  );
}
const DeviceGroupWrap = (props: any) => {
  return (
    <EditContextWrap>
      <DeviceGroup {...props} />
    </EditContextWrap>
  );
};
export default DeviceGroupWrap;
