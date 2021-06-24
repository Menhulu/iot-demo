/*
 * @Author:
 * @Date: 2020-04-09 16:19:07
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-05-07 15:47:55
 */
import request from 'utils/request';
import { RestPwdParam, RestPwdResponse } from '../types';

export const resetPassword = (param: RestPwdParam) => {
  return request<RestPwdResponse>({
    url: 'user/edit_password',
    method: 'POST',
    data: param,
  });
};
