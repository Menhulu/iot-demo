import { PaginationProps } from 'antd/lib/pagination';

export interface SPaginationProps extends PaginationProps {
  position?: string;
  lastPage?: number;
}
