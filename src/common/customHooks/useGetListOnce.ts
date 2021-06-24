import { useEffect, useState } from 'react';
import { Response } from 'typings/type';

export type ListOnlyResponse<T> = {
  data: T[];
};
// useFetch 的用法
/**
 * 请求不分页列表的通用逻辑 T:代表列表中每一项的类型；
 * @param api 请求列表的方法 (params: P) => Promise<Response<ListResponse<T>>>,
 * @param defaultData 初始值
 * @param param 请求参数 可能没有
 */
export default function useInitialListAll<T>(
  api: () => Promise<Response<ListOnlyResponse<T>>>,
  defaultData: T[]
) {
  const [allList, setAllList] = useState<T[]>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 获取操作模块的数据
    const fetchList = async () => {
      try {
        const res = await api();
        if (res && res.data) {
          setAllList(res.data);
          setLoading(false);
        } else {
          setAllList([]);

          setLoading(false);
        }
      } catch (error) {
        // setList([]);
        setLoading(false);
      }
    };
    if (!loading) return;

    fetchList();
  }, [api, loading]);

  return [{ allList, loading }, setLoading] as const;
}
