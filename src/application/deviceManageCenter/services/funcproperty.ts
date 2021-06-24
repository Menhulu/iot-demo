import request from 'utils/request';
import { RequestResponse } from '../types';

import { QueryParam } from '../types/funcproperety';

export const getFuncList = (params: QueryParam) => {
  return request<RequestResponse>({
    url: `function/list`,
    method: 'POST',
    data: params,
  });
};

export const getFuncCall = (params: QueryParam) => {
  return request<RequestResponse>({
    url: `event/list`,
    method: 'POST',
    data: params,
  });
};
