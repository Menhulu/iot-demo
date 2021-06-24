import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import { Select, Spin, Divider } from 'antd';
import debounce from 'lodash/debounce';
import { queryProfileDict } from '../services';

const { Option } = Select;

interface Props {
  onChange?: (val: string) => void;
  style?: React.CSSProperties | undefined;
  defaultVal?: string;
}

const ProfileDictSelect = forwardRef((props: Props, ref) => {
  const initPdAreaPagination = useMemo(() => {
    return {
      current: 1,
      pageSize: 50,
      total: 0,
      lastPage: 1,
    };
  }, []);
  // 台区数据
  const [pdArea, setPdArea] = useState<string[]>([]);

  // 台区分页
  const [pdAreaPagination, setPdAreaPagination] = useState(
    initPdAreaPagination
  );
  // 模糊查询条件
  const [name, setName] = useState<string>('');
  // 档案字典类型
  const [type, setType] = useState<string>('台区');
  // 下拉框是否在加载中
  const [fetching, setFetching] = useState<boolean>(false);

  // 台区 start

  const onPdAreaSearch = debounce((value: string) => {
    console.log(value);
    setName(value);
  }, 500);

  // 台区分页加载更多
  const pageChange = () => {
    if (pdAreaPagination.current === pdAreaPagination.lastPage) {
      setPdAreaPagination({ ...pdAreaPagination, current: 1 });
    } else {
      setPdAreaPagination({
        ...pdAreaPagination,
        current: pdAreaPagination.current + 1,
      });
    }
  };

  useEffect(() => {
    const getPdAreaData = async () => {
      setFetching(true);
      try {
        const param = {
          pageNo: pdAreaPagination.current,
          pageSize: pdAreaPagination.pageSize,
          type,
          name,
        };
        const rs = await queryProfileDict(param);
        setFetching(false);
        if (rs) {
          setPdArea(rs.list || []);
          const { pageNo: current, pageSize, total } = rs.pageVO;
          const paginationInfo = {
            current,
            pageSize,
            total,
            lastPage: Math.ceil(total / pageSize),
          };
          if (
            JSON.stringify(paginationInfo) != JSON.stringify(pdAreaPagination)
          ) {
            setPdAreaPagination(paginationInfo);
          }
        }
      } catch (error) {
        console.log(error);
        setFetching(false);
        setPdArea([]);
        if (
          JSON.stringify(initPdAreaPagination) !=
          JSON.stringify(pdAreaPagination)
        ) {
          setPdAreaPagination(initPdAreaPagination);
        }
      }
    };
    getPdAreaData();
  }, [initPdAreaPagination, name, pdAreaPagination, type]);

  // 台区 end
  return (
    <Select
      style={props.style}
      showSearch
      placeholder="请选择档案值"
      defaultValue={props.defaultVal || undefined}
      notFoundContent={fetching ? <Spin size="small" /> : '暂无数据'}
      filterOption={false}
      onSearch={onPdAreaSearch}
      onChange={props.onChange}
      dropdownRender={menu => (
        <div>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          <div
            style={{ padding: '4px 8px' }}
            className="cursor-pointer primary-color"
            onMouseDown={e => e.preventDefault()}
            onClick={pageChange}
          >
            共{pdAreaPagination.total}条{' '}
            {`${
              pdAreaPagination.lastPage === pdAreaPagination.current
                ? '没有更多了'
                : '加载更多'
            }`}
          </div>
        </div>
      )}
      getPopupContainer={(triggerNode: HTMLElement) =>
        triggerNode.parentNode as HTMLElement
      }
    >
      {pdArea &&
        pdArea.map((v: string) => {
          return (
            <Option key={v} value={v}>
              {v}
            </Option>
          );
        })}
    </Select>
  );
});

export default ProfileDictSelect;
