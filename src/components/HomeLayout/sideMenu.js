/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-09 21:45:56
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-10 20:15:41
 */

const sideMenu = [{
    key: 'dataOverview',
    icon: 'data',
    name: '数据概览',
    to: '/dataOverview/home',
    hasPermission: true,
    children: [{
      key: '/dataOverview/home',
      name: '数据概览',
      to: '/dataOverview/home',
      hasPermission: true,
      parentKey: 'dataOverview',
    }, ],
  },
  // {
  //   key: 'modelManagement',
  //   icon: 'product',
  //   name: '模型管理',
  //   to: '/thingModel/list',
  //   hasPermission: true,
  //   children: [
  //     {
  //       key: 'thingModel',
  //       name: '模型列表',
  //       to: '/thingModel/list',
  //       hasPermission: true,
  //       parentKey: 'modelManagement',
  //     },
  //   ],
  // },
  {
    key: 'deviceManage',
    icon: 'manage',
    name: '设备管理',
    to: '/thingtype/list',
    hasPermission: true,
    children: [{
        key: '/thingtype/list',
        name: '物类型列表',
        to: '/thingtype/list',
        hasPermission: true,
        parentKey: 'deviceManage',
      },
      {
        key: 'deviceManage',
        name: '设备列表',
        to: '/deviceManage/deviceList',
        hasPermission: true,
        parentKey: 'deviceManage',
      },
      {
        key: '/deviceManage/deviceGroup',
        name: '设备分组',
        to: '/deviceManage/deviceGroup',
        hasPermission: true,
        parentKey: 'deviceManage',
      },
    ],
  },
  {
    key: 'rule',
    icon: 'ruleengine',
    name: '规则引擎',
    to: '/rule/list',
    hasPermission: true,
    children: [{
      key: '/rule/list',
      name: '规则列表',
      to: '/rule/list',
      hasPermission: true,
      parentKey: 'rule',
    }, ],
  },

  {
    key: 'ota',
    icon: 'control',
    name: '固件升级',
    hasPermission: true,
    to: '/firmware/list',
    children: [{
        key: '/firmware/list',
        name: '固件管理',
        to: '/firmware/list',
        hasPermission: true,
        parentKey: 'ota',
      },
      {
        key: 'job',
        name: '任务管理',
        to: '/ota/job/list',
        hasPermission: true,
        parentKey: 'ota',
      },
    ],
  },
  {
    key: '/edge/node',
    icon: 'edge-computing',
    name: '边缘计算',
    hasPermission: true,
    to: '/edge/node',
    children: [{
        key: '/edge/node',
        name: '边缘节点',
        to: '/edge/node',
        hasPermission: true,
        parentKey: '/edge/node',
      },
      {
        key: '/edge/app',
        name: '应用管理',
        to: '/edge/app',
        hasPermission: true,
        parentKey: '/edge/node',
      },
    ],
  },
  {
    icon: 'audit',
    key: 'archives',
    name: '档案管理',
    hasPermission: true,
    to: '/archives/list',
    children: [{
      key: 'archives',
      name: '档案列表',
      hasPermission: true,
      to: '/archives/list',
      parentKey: 'archives',
    }, ],
  },
  {
    key: 'monitor',
    icon: 'monitor',
    name: '运维监控',
    to: '/monitor/logService',
    hasPermission: true,
    children: [{
      key: '/monitor/logService',
      name: '日志服务',
      to: '/monitor/logService',
      hasPermission: true,
      parentKey: 'monitor',
    }, ],
  },
  {
    key: 'systemConfig',
    icon: 'func-intro',
    name: '系统配置',
    to: '/systemConfig/ossConfig',
    hasPermission: true,
    children: [{
      key: '/systemConfig/ossConfig',
      name: '对象存储配置',
      to: '/systemConfig/ossConfig',
      hasPermission: true,
      parentKey: 'systemConfig',
    }, ],
  },
];

export default sideMenu;