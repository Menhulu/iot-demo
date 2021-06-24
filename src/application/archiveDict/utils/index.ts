export const inputType = (type: any, value: any) => {
  let isRight = true;
  const regRx = /^(-?\d+)(\d+)?$/;
  const reg = /^(-?\d+)(\.\d+)?$/;

  // const regRx = /^(\d+)(\d+)?$/;
  console.log(regRx.test(value), '===============');

  if (type === 2) {
    isRight = regRx.test(value) && value >= -2147483648 && value <= 2147483647;
  } else if (type === 3) {
    isRight = reg.test(value);
  }
  return isRight;
};
// if (type === 'y') {
//   // eslint-disable-next-line no-unused-expressions
//   isRight = regRx.test(value) && value >= -128 && value <= 127;
// } else if (type === 'n') {
//   isRight = regRx.test(value) && value >= -32768 && value <= 32767;
// } else if (type === 'i') {
//   isRight = regRx.test(value) && value >= -2147483648 && value <= 2147483647;
// } else if (type === 'q') {
//   isRight = regRx.test(value) && value >= 0 && value <= 65535;
// } else if (type === 'u') {
//   isRight = regRx.test(value) && value >= 0 && value <= 4294967295;
// } else if (type === 'h') {
//   isRight = regRx.test(value) && value >= 0 && value <= 4294967295;
// } else if (type === 't') {
//   // const reg = /^(0|[1-9][0-9]*)$/;
//   if (regRx.test(value) && value >= 0 && value.length <= 20) {
//     isRight = true;
//   } else {
//     isRight = false;
//   }
//   // isRight = value >= 0 && value <= 18446744073709551615;
// } else if (type === 'x') {
//   // console.log(value.indexof('-'), '@@@@@@@@@@@@@@');
//   if (regRx.test(value) && value.length <= 20) {
//     isRight = true;
//   } else {
//     isRight = false;
//   }
//   // if (reg.test(value) && value.length <= 20) {
//   //   isRight = true;
//   // } else {
//   //   isRight = false;
//   // }
//   // isRight = value >= -9223372036854775808 && value <= 9223372036854775807;
// } else if (type === 'f') {
//   if (reg.test(value)) {
//     isRight = true;
//   } else {
//     isRight = false;
//   }
// } else if (type === 'd') {
//   if (reg.test(value)) {
//     isRight = true;
//   } else {
//     isRight = false;
//   }
// }
