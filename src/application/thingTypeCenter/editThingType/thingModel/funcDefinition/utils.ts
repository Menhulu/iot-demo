import { PageType } from '../../../types/funcDefinition';

/**
 * @description: 校验最大值，最小值校验，在前端安全值范围之内的数字（-9007199254740991 ~ 9007199254740991 ）这些会校验范围，但是对于不在这个范围内的值，则只会校验长度
 * @param {type}
 * @return:
 */

export const validatorRange = (
  rule: any,
  value: any,
  callback: any,
  type: any
) => {
  const regRx = /^(-?\d+)(\d+)?$/; // 数字
  const reg = /^(-?\d+)(\.\d+)+$/; // 小数
  const regScience = '^[+-]?((\\d+\\.?\\d*)|(\\.\\d+))[Ee][+-]?\\d+$';
  if (!value) {
    callback();
    return;
  }
  switch (type) {
    case 'byte': // byte
      !(value >= -128 && value <= 127 && regRx.test(value))
        ? callback('请输入-128~127之间的Byte')
        : callback();
      break;
    case 'int8': // int8
      !(value >= -128 && value <= 127 && regRx.test(value))
        ? callback('请输入-128~127之间的Int8')
        : callback();
      break;
    case 'int16': // int16
      !(value >= -32768 && value <= 32767 && regRx.test(value))
        ? callback('请输入-32768~32767之间的Int16')
        : callback();
      break;
    case 'int32': // int32
      !(value >= -2147483648 && value <= 2147483647 && regRx.test(value))
        ? callback('请输入-2147483648~2147483647之间的Int32')
        : callback();
      break;
    case 'uint8': // unit16
      !(value >= 0 && value <= 255 && regRx.test(value))
        ? callback('请输入0~255之间的unit8')
        : callback();
      break;
    case 'uint16': // unit16
      !(value >= 0 && value <= 65535 && regRx.test(value))
        ? callback('请输入0~65535之间的Unit16')
        : callback();
      break;
    case 'uint32': // unit32
      !(value >= 0 && value <= 4294967295 && regRx.test(value))
        ? callback('请输入0~4294967295之间的Unit32')
        : callback();
      break;
    // case 'int64': // int64
    //   !(regRx.test(value) && value.length <= 20)
    //     ? callback('请输入 -9223372036854775808~9223372036854775807之间的Int64')
    //     : callback();
    //   break;
    // case 'unit64': // unit64
    //   !(regRx.test(value) && value >= 0 && value.length <= 20)
    //     ? callback('请输入0~18446744073709551615之间的Unit64')
    //     : callback();
    //   break;
    case 'int64':
    case 'unit64':
      !(
        value >= -9007199254740991 &&
        value <= 9007199254740991 &&
        regRx.test(value)
      )
        ? callback('请输入-9007199254740991~9007199254740991之间的数字')
        : callback();
      break;
    case 'float': // float
    case 'double': // double
      !(reg.test(value) || value.match(regScience))
        ? callback('请输入正确的数值范围')
        : callback();
      break;
    default:
      callback();
      break;
  }
};
/**
 * @description 校验步长值 步长的类型应与数据类型一致且是大于0，小于或等于最大值-最小值的
 * @param type
 * @param maxVal
 * @param minVal
 */
export const validatorStep = (
  rule: any,
  value: any,
  callback: any,
  type: string,
  maxVal: string,
  minVal: string
) => {
  const regRx = /^(-?\d+)(\d+)?$/; // 数字
  const reg = /^(-?\d+)(\.\d+)+$/; // 小数
  const regScience = '^[+-]?((\\d+\\.?\\d*)|(\\.\\d+))[Ee][+-]?\\d+$';
  if (!value || !minVal || !maxVal) {
    callback();
    return;
  }
  switch (type) {
    case 'float':
    case 'double':
      if (!(reg.test(value) || value.match(regScience))) {
        callback(`请输入${type}类型的值`);
      } else if (
        !(
          !!minVal &&
          !!maxVal &&
          Number(value) > 0 &&
          Number(value) <= Number(maxVal) - Number(minVal)
        )
      ) {
        callback('步长值应大于0且小于或等于最小值和最大值之间的差值');
      } else {
        callback();
      }
      break;
    default:
      if (!regRx.test(value)) {
        callback(`请输入${type}类型的值`);
      } else if (
        !(
          !!minVal &&
          !!maxVal &&
          Number(value) > 0 &&
          Number(value) <= Number(maxVal) - Number(minVal)
        )
      ) {
        callback('步长值应大于0且小于或等于最小值和最大值之间的差值');
      } else {
        callback();
      }
      break;
  }
};
/**
 * @description 校验string binary array类型长度限制
 * @param rule
 * @param value 用户输入
 * @param callback
 * @param type 值类型
 */

export const validateLength = (
  rule: any,
  value: any,
  callback: any,
  type: any
) => {
  if (!value) {
    callback();
    return;
  }
  switch (type) {
    case 'string':
    case 'binary':
      if (value > 1024) {
        callback('最大不能超过1024');
      } else {
        callback();
      }
      break;
    case 'array':
      if (value > 128) {
        callback('最大不能超过128');
      } else {
        callback();
      }
      break;
    default:
      callback();
      break;
  }
};

export const validateDisplayNameLength = (
  rule: any,
  value: string,
  callback: any
) => {
  if (value.length > 30) {
    callback('不能超过30个字符');
  } else {
    callback();
  }
};

// 数组中是否存在同名的对象
export function hasExist<T>(
  item: T,
  list: T[],
  pageType: PageType,
  mark?: string
): boolean {
  let flag = false;
  let arr = [...list];
  const uniqueId = mark || 'key';
  if (arr.length > 0) {
    // 如果是编辑的话,先去除掉这个元素
    if (pageType === 'EDIT') {
      arr = arr.filter(
        i => i[uniqueId as keyof T] !== item[uniqueId as keyof T]
      );
    }

    for (const ele of arr) {
      if (ele[uniqueId as keyof T] === item[uniqueId as keyof T]) {
        flag = true;
        break;
      }
    }
  }
  return flag;
}
