/*
 * @Author:
 * @Date: 2020-04-09 16:18:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-05-07 15:32:08
 */
// 请求修改密码的参数
export interface RestPwdParam {
  oldPassword: string;
  password: string;
  rePassword: string;
}

export interface RestPwdResponse {
  data: any;
  message: string;
}
