import { PageVo, Response } from 'typings/type';
import { useEffect, useState } from 'react';

enum ListPropName {
  data = 'data',
  list = 'list',
  dataList = 'dataList',
}
enum PagePropName {
  page = 'page',
  pageVO = 'pageVO',
}
export type ListResponse<T> = {
  data: { [listProp in ListPropName]?: T[] } &
    { [pageProp in PagePropName]?: PageVo } & {
      pageIndex?: number;
      pageSize?: number;
      totalCount?: number;
    };
};
// useFetch 的用法
/**
 * 请求列表的通用逻辑 T:代表列表中每一项的类型； P: 代表参数类型
 * @param api 请求列表的方法 (params: P) => Promise<Response<ListResponse<T>>>,
 * @param params 请求参数
 * @param defaultData 初始值
 * @param storageKey 进入详情页返回保持原有查询条件
 * @returns [{queryParam, list, pagination, loading}, setQueryParam]
 */
export default function useInitial<T, P>(
  api: (params: P) => Promise<Response<ListResponse<T>>>,
  params: P,
  defaultData: T[],
  storageKey?: string
) {
  const [list, setList] = useState<T[]>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 20,
    total: 0,
    lastPage: 1,
  });
  const getParams = () => {
    const isFromSubPage = sessionStorage.getItem('isFromSubPage');

    if (isFromSubPage === '1' && storageKey) {
      const storageQueryParams = JSON.parse(
        sessionStorage.getItem(storageKey) as string
      );

      return { ...params, ...storageQueryParams };
    } else {
      return params;
    }
  };
  const [queryParam, setQueryParam] = useState<P>(getParams());

  useEffect(() => {
    // 获取操作模块的数据
    const fetchList = async (param?: P) => {
      console.log(param, queryParam);
      setLoading(true);
      try {
        const queryListParam = param || queryParam;
        const res = await api(queryListParam);
        if (res && res.data) {
          const resList =
            res.data.list || res.data.data || res.data.dataList || [];
          setList(resList);
          const page = res.data.pageVO || res.data.page || (res.data as PageVo);
          const paginationInfo = {
            pageNo: page.pageIndex || page.pageNo,
            pageSize: page.pageSize,
            total: page.totalCount || page.total,
            lastPage: 1,
          };
          paginationInfo.lastPage = Math.ceil(
            paginationInfo.total / page.pageSize
          );
          setPagination(paginationInfo);
        } else {
          setList([]);
          const paginationInfo = {
            pageNo: 1,
            pageSize: 20,
            total: 0,
            lastPage: 1,
          };
          setPagination(paginationInfo);
        }
      } catch (error) {
        setList([]);
        const paginationInfo = {
          pageNo: 1,
          pageSize: 20,
          total: 0,
          lastPage: 1,
        };
        setPagination(paginationInfo);
      } finally {
        // sessionStorage.clear();
        storageKey && sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem('isFromSubPage');
        setLoading(false);
        sessionStorage.removeItem('tabKey');
      }
    };
    fetchList();
  }, [api, queryParam, storageKey]);

  return [{ queryParam, list, pagination, loading }, setQueryParam] as const;
}
