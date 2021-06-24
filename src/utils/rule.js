export const rule = [
  {
    uri: 'http://jdiot/things_model',
    fileMatch: ['*'],
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: '物模型',
      properties: {
        id: {
          $ref: 'http://jdiot/id_thing_model',
        },
        topic: {
          type: 'string',
        },
        models: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/model',
          },
        },
      },
      required: ['id'],
    },
  },
  {
    uri: 'http://jdiot/model',
    schema: {
      type: 'object',
      title: '模型的描述',
      required: ['id', 'type'],
      properties: {
        id: {
          $ref: 'http://jdiot/id_model',
        },
        description: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['entity', 'service'],
        },
        topic: {
          type: 'string',
        },
        properties: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/property',
          },
        },
        functions: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/function',
          },
        },
        events: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/event',
          },
        },
      },
    },
  },
  // id
  {
    uri: 'http://jdiot/id_property',
    schema: {
      type: 'string',
      pattern: 'urn:[\\w|-]+:property:\\w+(:\\w+)?',
      title: '示例: urn:jiot-spec-v1:property:light',
    },
  },
  {
    uri: 'http://jdiot/id_function',
    schema: {
      type: 'string',
      pattern: 'urn:[\\w|-]+:function:\\w*(:\\w+)',
      title: '示例: urn:jiot-spec-v1:function:light',
    },
  },
  {
    uri: 'http://jdiot/id_event',
    schema: {
      type: 'string',
      pattern: 'urn:[\\w|-]+:event:\\w+(:\\w+)?',
      title: '示例: urn:jiot-spec-v1:event:light',
    },
  },
  {
    uri: 'http://jdiot/id_model',
    schema: {
      type: 'string',
      pattern: 'urn:(\\w|-)+:model:\\w*(:\\w+)?',
      title: '示例: urn:jiot-spec-v1:model:light',
    },
  },
  {
    uri: 'http://jdiot/id_thing_model',
    schema: {
      type: 'string',
      pattern: 'urn:[\\w|-]+:thing_model:\\w*(:\\w+)?',
      title: '示例: urn:jiot-spec-v1:thing_model:light',
    },
  },
  {
    uri: 'http://jdiot/property',
    schema: {
      type: 'object',
      title: '属性',
      properties: {
        id: {
          $ref: 'http://jdiot/id_property',
        },
        description: {
          type: 'string',
          title: '属性的描述',
        },
        access: {
          type: 'string',
          enum: ['rw', 'r', 'w'],
          title: '属性的读写类型',
        },
        valuedef: {
          type: 'object',
          $ref: 'http://jdiot/valuedef',
        },
      },
    },
  },
  {
    uri: 'http://jdiot/event',
    schema: {
      type: 'object',
      title: '事件',
      properties: {
        id: {
          $ref: 'http://jdiot/id_event',
        },
        description: {
          type: 'string',
          title: '属性的描述',
        },
        parameters: {
          type: 'array',
          items: {
            types: {
              type: 'object',
              $ref: 'http://jdiot/property',
            },
          },
        },
      },
    },
  },
  {
    uri: 'http://jdiot/function',
    schema: {
      type: 'object',
      title: '方法',
      properties: {
        id: {
          $ref: 'http://jdiot/id_function',
        },
        description: {
          type: 'string',
          title: '方法的描述',
        },
        in: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/property',
          },
        },
        out: {
          type: 'array',
          items: {
            type: 'object',
            $ref: 'http://jdiot/property',
          },
        },
      },
    },
  },
  {
    uri: 'http://jdiot/valuedef',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'bool',
            'uint8',
            'uint16',
            'uint32',
            'int8',
            'int16',
            'int32',
            'int64',
            'float',
            'double',
            'string',
            'binary',
            'array',
            'enum',
            'struct',
            'date',
          ],
        },
        specs: {
          type: 'object',
          properties: {
            min: {
              type: 'string',
              pattern: '[0-9]*',
            },
            max: {
              type: 'string',
              pattern: '[1-9][0-9]?',
            },
            step: {
              type: 'string',
            },
            unit: {
              type: 'string',
              title: '单位',
              enum: [
                'percentage',
                'celsius',
                'seconds',
                'minutes',
                'hours',
                'days',
                'kelvin',
                'pascal',
                'arcdegrees',
                'rgb',
                'watt',
                'litre',
                'ppm',
                'lux',
                'mg/m3',
                'volt',
                'ampere',
              ],
            },
            unitdesc: {
              type: 'string',
            },
          },
        },
      },
    },
  },
];
