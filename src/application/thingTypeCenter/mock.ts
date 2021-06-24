import { ThingModelInfo } from './types/thingModel';

export const thingModelData: ThingModelInfo = {
  content: {
    models: [
      // {
      //   functions: [
      //     {
      //       'display-name': '获得灯泡型号',
      //       in: [],
      //       description: 'Get  informations',
      //       id: 'urn:user-spec-v1:function:get-info:444',
      //       key: 'light1.get-info',
      //       out: [
      //         {
      //           access: 'r',
      //           valuedef: {
      //             specs: {
      //               length: '20',
      //             },
      //             type: 'string',
      //           },
      //           description: 'manufacture',
      //           id: 'urn:user-spec-v1:property:manufacture:555',
      //           key: 'manufacture',
      //           'display-name': '设备厂商',
      //         },
      //       ],
      //     },
      //     {
      //       'display-name': 'test',
      //       in: [
      //         {
      //           access: 'w',
      //           valuedef: {
      //             specs: {
      //               length: '20',
      //             },
      //             type: 'string',
      //           },
      //           description: 'inparam',
      //           id: 'urn:user-spec-v1:property:inparam:666',
      //           key: 'inparam',
      //           'display-name': 'echo test',
      //         },
      //       ],
      //       description: 'test',
      //       id: 'urn:user-spec-v1:function:test:5555',
      //       key: 'light1.test',
      //       out: [
      //         {
      //           access: 'r',
      //           valuedef: {
      //             specs: {
      //               length: '20',
      //             },
      //             type: 'string',
      //           },
      //           description: 'outparam',
      //           id: 'urn:user-spec-v1:property:outparam:777',
      //           key: 'outparam',
      //           'display-name': 'echo test',
      //         },
      //       ],
      //     },
      //   ],
      //   description: 'light',
      //   id: 'urn:user-spec-v1:model:light:1',
      //   type: 'entity',
      //   key: 'light1',
      //   'display-name': '灯',
      //   properties: [
      //     {
      //       access: 'rw',
      //       valuedef: {
      //         specs: {
      //           '0': 'off',
      //           '1': 'on',
      //         },
      //         type: 'bool',
      //       },
      //       description: 'on off the object',
      //       id: 'urn:user-spec-v1:property:on-off:2',
      //       key: 'light1.on-off',
      //       'display-name': '开关',
      //     },
      //     {
      //       access: 'rw',
      //       valuedef: {
      //         specs: {
      //           unitdesc: '光照亮度',
      //           unit: 'percentage',
      //           min: '0',
      //           max: '100',
      //           step: '1',
      //         },
      //         type: 'uint8',
      //       },
      //       description: 'the brightness',
      //       id: 'urn:user-spec-v1:property:brightness:3',
      //       key: 'light1.brightness',
      //       'display-name': '光照亮度',
      //     },
      //   ],
      // },
      // {
      //   functions: [
      //     {
      //       'display-name': '获得灯泡型号',
      //       in: [],
      //       description: 'Get  informations',
      //       id: 'urn:user-spec-v1:function:get-info:444',
      //       key: 'light2.get-info',
      //       out: [
      //         {
      //           access: 'r',
      //           valuedef: {
      //             specs: {
      //               length: '20',
      //             },
      //             type: 'string',
      //           },
      //           description: 'manufacture',
      //           id: 'urn:user-spec-v1:property:manufacture:555',
      //           key: 'manufacture',
      //           'display-name': '设备厂商',
      //         },
      //       ],
      //     },
      //   ],
      //   description: 'light',
      //   id: 'urn:user-spec-v1:model:light:4',
      //   type: 'entity',
      //   key: 'light2',
      //   'display-name': '灯2',
      //   properties: [
      //     {
      //       access: 'rw',
      //       valuedef: {
      //         specs: {
      //           '0': 'off',
      //           '1': 'on',
      //         },
      //         type: 'bool',
      //       },
      //       description: 'on off the object',
      //       id: 'urn:user-spec-v1:property:on-off:5',
      //       key: 'light2.on-off',
      //       'display-name': '开关',
      //     },
      //     {
      //       access: 'rw',
      //       valuedef: {
      //         specs: {
      //           unitdesc: '光照亮度',
      //           unit: 'percentage',
      //           min: '0',
      //           max: '100',
      //           step: '1',
      //         },
      //         type: 'uint8',
      //       },
      //       description: 'the brightness',
      //       id: 'urn:user-spec-v1:property:brightness:6',
      //       key: 'light2.brightness',
      //       'display-name': '光照亮度',
      //     },
      //   ],
      // },
      // {
      //   description: 'battery',
      //   id: 'urn:user-spec-v1:service:battery:7',
      //   type: 'entity',
      //   key: 'battery',
      //   'display-name': '电池',
      //   properties: [
      //     {
      //       access: 'r',
      //       valuedef: {
      //         specs: {
      //           unitdesc: '电池电量',
      //           unit: 'percentage',
      //           min: '0',
      //           max: '100',
      //           step: '0.1',
      //         },
      //         type: 'float',
      //       },
      //       description: 'the capacity',
      //       id: 'urn:user-spec-v1:property:capacity:8',
      //       key: 'battery.capacity',
      //       'display-name': '电池电量',
      //     },
      //   ],
      //   events: [
      //     {
      //       description: 'alert!!!',
      //       id: 'urn:user-spec-v1:event:alert:9',
      //       parameters: [
      //         {
      //           access: 'r',
      //           valuedef: {
      //             specs: {
      //               unitdesc: '当前温度',
      //               unit: 'celsius',
      //               min: '0',
      //               max: '100',
      //               step: '0.1',
      //             },
      //             type: 'float',
      //           },
      //           description: 'current temperature',
      //           id: 'urn:user-spec-v1:property:current-temperature:10',
      //           key: 'current-temperature',
      //           'display-name': '电池电量',
      //         },
      //         {
      //           access: 'r',
      //           valuedef: {
      //             type: 'date',
      //           },
      //           description: 'current time ',
      //           id: 'urn:user-spec-v1:property:date:11',
      //           key: 'date',
      //           'display-name': '当前时间',
      //         },
      //       ],
      //       key: 'battery.alert',
      //       'display-name': '电池警告',
      //     },
      //   ],
      // },
    ],
  },
  thingTypeId: '',
  thingModelVersion: '',
  description: '',
  spec: 'user-spec-v1',
};
