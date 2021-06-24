import { TypeConfig } from '../../../../types/funcDefinition';

export const dataUnit = [
  { id: 'percentage', name: '百分比' },
  { id: 'celsius', name: '摄氏度' },
  { id: 'seconds', name: '秒' },
  { id: 'minutes', name: '分' },
  { id: 'hours', name: '小时' },
  { id: 'days', name: '天' },
  { id: 'kelvin', name: '开氏温标' },
  { id: 'pascal', name: '帕斯卡' },
  { id: 'arcdegrees', name: '弧度' },
  { id: 'rgb', name: 'RGB' },
  { id: 'watt', name: '瓦特' },
  { id: 'litre', name: '升' },
  { id: 'ppm', name: 'ppm浓度' },
  { id: 'lux', name: '勒克斯' },
  { id: 'mg/m3', name: '毫克每立方米' },
  { id: 'volt', name: '伏特' },
];

export const PropTypeConfig: { [propName: string]: TypeConfig } = {
  bool: {
    displayName: 'Boolean',
    specInfo: {
      '0': 'false',
      '1': 'true',
    },
  },
  uint8: {
    displayName: 'Uint8',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '',
      max: '',
      step: '',
    },
  },
  uint16: {
    displayName: 'Uint16',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 0
      max: '', // 65535
      step: '',
    },
  },
  uint32: {
    displayName: 'Uint32',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 0
      max: '', // 4294967295
      step: '',
    },
  },
  int8: {
    displayName: 'Int8',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '',
      max: '',
      step: '',
    },
  },
  int16: {
    displayName: 'Int16',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -32768
      max: '', // 32768
      step: '',
    },
  },
  int32: {
    displayName: 'Int32',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -2147483647
      max: '', // 2147483647
      step: '',
    },
  },
  int64: {
    displayName: 'Int64',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -9223372036854775808
      max: '', // 9223372036854775808
      step: '',
    },
  },
  float: {
    displayName: 'Float',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 1.4e-45
      max: '', // 3.4028235e+38
      step: '',
    },
  },
  double: {
    displayName: 'Double',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 4.9e-324
      max: '', // 1.7976931348623157e+308
      step: '', // 1.0
    },
  },
  string: {
    displayName: 'String',
    specInfo: { length: '' },
  },
  binary: { displayName: 'Binary', specInfo: { length: '' } },
  array: {
    displayName: 'Array',
    specInfo: {
      size: '128',
    },
  },
  enum: {
    displayName: 'Enum',
    specInfo: { values: {} },
  },
  struct: {
    displayName: 'Struct',
    specInfo: {},
  },
  date: {
    displayName: 'Date',
    specInfo: {},
  },
};

export const ArrayTypeConfig: { [propName: string]: TypeConfig } = {
  uint8: {
    displayName: 'Uint8',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '',
      max: '',
      step: '',
    },
  },
  uint16: {
    displayName: 'Uint16',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 0
      max: '', // 65535
      step: '',
    },
  },
  uint32: {
    displayName: 'Uint32',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 0
      max: '', // 4294967295
      step: '',
    },
  },
  int8: {
    displayName: 'Int8',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '',
      max: '',
      step: '',
    },
  },
  int16: {
    displayName: 'Int16',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -32768
      max: '', // 32768
      step: '',
    },
  },
  int32: {
    displayName: 'Int32',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -2147483647
      max: '', // 2147483647
      step: '',
    },
  },
  int64: {
    displayName: 'Int64',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // -9223372036854775808
      max: '', // 9223372036854775808
      step: '',
    },
  },
  float: {
    displayName: 'Float',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', // 1.4e-45
      max: '', // 3.4028235e+38
      step: '', // 1.0
    },
  },
  double: {
    displayName: 'Double',
    specInfo: {
      unit: '',
      unitdesc: '',
      min: '', //  4.9e-324
      max: '', // 1.7976931348623157e+308
      step: '', // 1.0
    },
  },
  string: {
    displayName: 'String',
    specInfo: { length: '' },
  },
  struct: {
    displayName: 'Struct',
    specInfo: {},
  },
};

// 展示在页面的操作权限
export const PERMISSION: { [propName: string]: string } = {
  R: '只读',
  W: '只写',
  RW: '可读可写',
};

// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾
export const displayNameReg = /^[a-zA-Z0-9\u4e00-\u9fa5]+([-_]*[a-zA-Z0-9\u4e00-\u9fa5]+)*$/;
export const displayNameRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾';
// 支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头和结尾
export const objectNameReg = /^[a-zA-Z0-9]+([-_]*[a-zA-Z0-9]+)*$/;
export const objectNameRule =
  '支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头和结尾';

// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头、结尾
export const commonTextReg = /^[a-zA-Z0-9\u4e00-\u9fa5]+([-_]*[a-zA-Z0-9\u4e00-\u9fa5]+)*$/;
export const commonTextRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾';

// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字、连字符开头、结尾
export const enumTextReg = /^[a-zA-Z0-9\u4e00-\u9fa5-]+([-_]*[a-zA-Z0-9\u4e00-\u9fa5]+)*$/;
export const enumTextRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字、连字符开头和结尾';
const regExp = /^[\u4e00-\u9fa5a-zA-Z0-9]+([-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9]+)*$/;
