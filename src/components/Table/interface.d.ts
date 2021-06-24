import { TableProps } from 'antd/lib/table';

export interface PageVo {
  total: number;
  pageSize: number;
  current?: number;
  pageNo?: number; // 和current一个意思
  lastPage: number;
  position?: string;
}

declare const EmptyType: ['noSearch', 'noSearch'];

export interface TableProps extends TableProps<T> {
  pagination?: PageVo;
  pageChange?:
    | ((page: number, pageSize?: number | undefined) => void)
    | undefined;
  onShowSizeChange?: ((current: number, size: number) => void) | undefined;
  emptyType?: typeof EmptyType[number];
  scrollHeight?: number;
}
