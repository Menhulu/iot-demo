/*
 * @Author:
 * @Date: 2020-06-02 17:24:24
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-07-30 23:19:44
 */
import Toast from 'components/SimpleToast/index';

export const numberValidator = (
  rule: any,
  value: any,
  callback: any,
  type: string,
  max: string,
  min: string,
  step?: string,
  toast?: boolean
) => {
  console.log(
    value,
    type,
    max,
    min,
    Number(min) <= Number(value),
    Number(value) <= Number(max)
  );
  const regRx = /^(-?\d+)(\d+)?$/; // 数字
  const reg = /^(-?\d+)(\.\d+)+$/; // 小数
  const regScience = '^[+-]?((\\d+\\.?\\d*)|(\\.\\d+))[Ee][+-]?\\d+$';
  if (!value) {
    callback();
    return;
  }
  switch (type) {
    case 'float': // float
    case 'double': // double
      if (!(reg.test(value) || value.match(regScience))) {
        callback(`请输入${type}类型的值`);
        toast && Toast(`请输入${type}类型的值`);
      } else if (
        !(
          !!min.toString() &&
          !!max.toString() &&
          Number(min) <= Number(value) &&
          Number(value) <= Number(max)
        )
      ) {
        callback(`请输入${min}~${max}之间的值`);
        toast && Toast(`请输入${min}~${max}之间的值`);
      } else if (Number(value) % Number(step)) {
        callback(`请输入${step}的倍数`);
      } else {
        callback();
      }
      break;
    default:
      if (!regRx.test(value)) {
        callback(`请输入${type}类型的值`);
        toast && Toast(`请输入${type}类型的值`);
      } else if (
        !(
          !!min.toString() &&
          !!max.toString() &&
          Number(min) <= Number(value) &&
          Number(value) <= Number(max)
        )
      ) {
        callback(`请输入${min}~${max}之间的值`);
        toast && Toast(`请输入${min}~${max}之间的值`);
      } else if (Number(value) % Number(step)) {
        callback(`请输入${step}的倍数`);
      } else {
        callback();
      }
      break;
  }
};
