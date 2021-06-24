import { lazy } from 'react';
import { RouteConfig } from './react-router-config';

const routes: RouteConfig[] = [
  // 首页--数据概览
  {
    path: '/',
    exact: true,
    key: 'default',
    component: lazy(() => import('application/dataOverview/dataOverview')),
    requireAuth: true,
  },
  {
    path: '/dataOverview/home',
    exact: true,
    key: 'DATA_OVER_VIEW',
    component: lazy(() => import('application/dataOverview/dataOverview')),
    requireAuth: true,
  },
  // 物类型列表
  {
    path: '/thingtype/list',
    exact: true,
    key: 'THING_TYPE_LIST_QUERY_PERMISSION',
    component: lazy(() =>
      import('application/thingTypeCenter/thingTypeList/index')
    ),
    requireAuth: true,
  },
  // 创建物类型
  {
    path: '/thingtype/create',
    exact: true,
    key: 'THING_TYPE_LIST_CREATE_PERMISSION',
    component: lazy(() =>
      import('application/thingTypeCenter/createThingType/createThingType')
    ),
    requireAuth: true,
  },
  // 编辑物类型
  {
    path: '/thingtype/edit/:id/:nodeType',
    exact: true,
    key: 'THING_TYPE_LIST_UPDATE_PERMISSION',
    component: lazy(() => import('application/thingTypeCenter/editThingType')),
    requireAuth: true,
  },
  // 注册设备
  {
    path: '/deviceManage/addDevice',
    exact: true,
    key: 'DEVICE_MANAGE_DEVICE_LIST_CREATE_PERMISSION',
    component: lazy(() =>
      import('application/deviceManageCenter/addDevice/addDevice')
    ),
    requireAuth: true,
  },
  // 编辑设备
  {
    path: '/deviceManage/editDevice/:id/:tab?',
    exact: true,
    key: 'DEVICE_MANAGE_DEVICE_LIST_UPDATE_PERMISSION',
    component: lazy(() =>
      import('application/deviceManageCenter/editDevice/editDevice')
    ),
    requireAuth: true,
  },
  // 设备列表
  {
    path: '/deviceManage/deviceList',
    exact: true,
    key: 'DEVICE_MANAGE_DEVICE_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/deviceManageCenter/deviceList')),
    requireAuth: true,
  },
  // 设备分组
  {
    path: '/deviceManage/deviceGroup',
    exact: true,
    key: 'DEVICE_MANAGE_DEVICE_GROUP_QUERY_PERMISSION',
    component: lazy(() =>
      import('application/deviceManageCenter/deviceGroup/index')
    ),
    requireAuth: true,
  },
  // 物模型列表
  {
    path: '/thingModel/list',
    exact: true,
    key: 'THING_MODEL_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/modelCenter/modelList/index')),
    requireAuth: true,
  },
  // 创建模型
  {
    path: '/thingModel/create',
    exact: true,
    key: 'THING_MODEL_LIST_UPDATE_PERMISSION',
    component: lazy(() => import('application/modelCenter/modelEdit')),
    requireAuth: true,
  },
  // 编辑模型
  {
    path: '/thingModel/edit/:name/:specName',
    exact: true,
    key: 'THING_MODEL_LIST_UPDATE_PERMISSION',
    component: lazy(() => import('application/modelCenter/modelEdit')),
    requireAuth: true,
  },
  // 日志服务
  {
    path: '/monitor/logService',
    exact: true,
    key: 'MONITOR_LOG_SERVICE',
    component: lazy(() => import('application/monitor/logService/index')),
    requireAuth: true,
  },
  // 对象存储
  {
    path: '/systemConfig/ossConfig',
    exact: true,
    key: 'OSS_LIST',
    component: lazy(() => import('application/systemConfig/ossConfig/index')),
    requireAuth: true,
  },

  // 创建，编辑和查看对象存储，create:创建，edit:编辑，view：查看
  {
    path: '/systemConfig/ossConfig/:action/:id',
    exact: true,
    key: 'OSS_LIST_UPDATE_PERMISSION',
    component: lazy(() =>
      import('application/systemConfig/ossConfig/edit/index')
    ),
    requireAuth: true,
  },
  // 档案字典
  {
    path: '/archives/list',
    exact: true,
    key: `ARCHIVES_LIST_QUERY_PERMISSION`,
    component: lazy(() => import('application/archiveDict/list/index')),
    requireAuth: true,
  },

  // 数据字典
  {
    path: '/archives/datadic',
    exact: true,
    key: `DATA_DICTIONARY`,
    component: lazy(() => import('application/dataDictionary/index')),
    requireAuth: true,
    hasPermission: true,
  },

  // 规则引擎
  {
    path: '/rule/list',
    exact: true,
    key: `RULE_LIST_QUERY_PERMISSION`,
    component: lazy(() => import('application/ruleEngine/ruleList/index')),
    requireAuth: true,
  },
  // 编辑&创建规则
  {
    path: '/rule/edit/:id',
    exact: true,
    key: `RULE_LIST_UPDATE_PERMISSION`,
    component: lazy(() => import('application/ruleEngine/editRule/edit')),
    requireAuth: true,
  },
  // 查看规则
  {
    path: '/rule/view/:id',
    exact: true,
    key: `RULE_LIST_UPDATE_PERMISSION`,
    component: lazy(() => import('application/ruleEngine/editRule')),
    requireAuth: true,
  },
  // 用户行为审计
  {
    path: '/userBehaviorAudit/list',
    exact: true,
    key: `USER_BEHAVIOR_AUDIT_LIST_QUERY_PERMISSION`,
    component: lazy(() =>
      import('application/userManage/userBehaviorAudit/index')
    ),
    requireAuth: true,
  },
  // 固件升级
  {
    path: '/firmware/list',
    exact: true,
    key: 'OTA_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/monitor/ota/firmware/list')),
    requireAuth: true,
  },
  {
    path: '/firmware/add',
    exact: true,
    key: 'OTA_LIST_CREATE_PERMISSION',
    component: lazy(() =>
      import('application/monitor/ota/firmware/baseInfo/edit')
    ),
    requireAuth: true,
  },
  // 编辑固件
  {
    path: '/firmware/edit/:firmwareId',
    exact: true,
    key: 'OTA_LIST_UPDATE_PERMISSION',
    component: lazy(() =>
      import('application/monitor/ota/firmware/baseInfo/edit')
    ),
    requireAuth: true,
  },
  // 查看固件
  {
    path: '/firmware/view/:firmwareId',
    exact: true,
    key: 'OTA_LIST_QUERY_PERMISSION',
    component: lazy(() =>
      import('application/monitor/ota/firmware/baseInfo/view')
    ),
    requireAuth: true,
  },
  // 任务管理
  {
    path: '/ota/job/list',
    exact: true,
    key: 'OTA_JOB_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/monitor/ota/job/list')),
    requireAuth: true,
  },
  {
    path: '/ota/job/add/:thingTypeCode?/:firmwareId?',
    exact: true,
    key: 'OTA_JOB_LIST_CREATE_PERMISSION',
    component: lazy(() => import('application/monitor/ota/job/edit')),
    requireAuth: true,
  },
  // 编辑固件
  {
    path: '/ota/job/edit/:thingTypeCode/:firmwareId/:jobId',
    exact: true,
    key: 'OTA_JOB_LIST_UPDATE_PERMISSION',
    component: lazy(() => import('application/monitor/ota/job/edit')),
    requireAuth: true,
  },
  // 查看固件
  {
    path: '/ota/job/view/:thingTypeCode/:version',
    exact: true,
    key: 'OTA_JOB_LIST_VIEW_PERMISSION',
    component: lazy(() => import('application/monitor/ota/job/edit')),
    requireAuth: true,
  },
  // 任务管理
  {
    path: '/ota/jobDetail/list/:jobId',
    exact: true,
    key: 'OTA_JOB_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/monitor/ota/job/list/jobDetail')),
    requireAuth: true,
  },
  // 边缘计算
  {
    path: '/edge/app',
    exact: true,
    key: 'APP_APPLICATION_MANAGEMENT_QUERY_PERMISSION',
    component: lazy(() => import('application/edge/app/appList')),
    requireAuth: true,
  },
  // 边缘计算
  {
    path: '/edge/app/add',
    exact: true,
    key: 'APP_APPLICATION_MANAGEMENT_CREATE_PERMISSION',
    component: lazy(() => import('application/edge/app/appInfo/addEdgeApp')),
    requireAuth: true,
  },
  {
    path: '/edge/app/edit/:appId',
    exact: true,
    key: 'APP_APPLICATION_MANAGEMENT_UPDATE_PERMISSION',
    component: lazy(() => import('application/edge/app/appInfo/editAdgeApp')),
    requireAuth: true,
  },

  // 边缘节点
  {
    path: '/edge/node',
    exact: true,
    key: 'EDGE_NODE_LIST_QUERY_PERMISSION',
    component: lazy(() => import('application/edge/node/nodeListNew')),
    requireAuth: true,
  },
  // 边缘计算-注册节点
  {
    path: '/edge/node/add',
    exact: true,
    key: 'EDGE_NODE_LIST_CREATE_PERMISSION',
    component: lazy(() =>
      import('application/deviceManageCenter/addDevice/addDevice')
    ),
    requireAuth: true,
  },
  // 边缘节点-节点详情
  {
    path: '/edge/node/edit/:nodeId',
    exact: true,
    key: 'EDGE_NODE_LIST_UPDATE_PERMISSION',
    component: lazy(() =>
      import('application/edge/node/nodeInfo/editAdgeNode')
    ),
    requireAuth: true,
  },
  // 404路由，需要始终保持在最后一个
  {
    path: '',
    component: lazy(() => import('application/noMatch')),
    key: 'NO_MATCH',
    hasPermission: true,
  },
];

export default routes;
