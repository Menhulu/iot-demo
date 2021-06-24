import React, { useContext } from 'react';
import { Tabs } from 'antd';

import GroupInfo from '../groupInfo';
import GroupTable from '../groupTable';
import { EditContext } from '../context';

import './index.less';

const { TabPane } = Tabs;

// 编辑分组
function GroupEdit(props: any) {
  return (
    <div className="group-edit-sll">
      <div className="group-edit-body">
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <GroupInfo />
          </TabPane>
          <TabPane tab="设备列表" key="2">
            <GroupTable />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default GroupEdit;
