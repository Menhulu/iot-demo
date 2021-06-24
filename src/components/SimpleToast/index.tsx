import SimpleToast from './simpleToast';

interface Option {
  type: string;
  msg: string;
}

export default function(option: Option | string) {
  console.log(option);
  if (typeof option === 'string') {
    SimpleToast.newInstance().then((instance: any) => instance.success(option));
  } else {
    switch (option.type) {
      case 'success':
        SimpleToast.newInstance().then((instance: any) =>
          instance.success(option.msg)
        );
        break;
      case 'warn':
        SimpleToast.newInstance().then((instance: any) =>
          instance.warning(option.msg)
        );
        break;
      default:
        SimpleToast.newInstance().then((instance: any) =>
          instance.success(option.msg)
        );
    }
  }
}

// 使用
// SimpleToast({
//   type: 'success',
//   msg: '创建成功'
// });
// SimpleToast('创建成功');
// SimpleToast({
//   type: 'warn',
//   msg: '创建失败'
// });
