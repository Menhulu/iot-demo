import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from 'antd';
import './index.less';

const { Option } = Select;

export type SearchOption = {
  value: number | string;
  text: string | number;
  [propName: string]: any;
};

type SearchProps = {
  options: SearchOption[]; // 前面 select的选项内容
  selectWidth?: number; // 前面Select 的宽度
  flag: string | number; // select 当前选择的
  value: string;
  onSearch?: (searchFlag: string | number, searchVal: string | number) => void; // 点击搜索的时候
};

function SearchInput(props: SearchProps) {
  const { options, selectWidth, onSearch, flag, value } = props;
  const initSearchFlag = flag || options[0].value;
  const [searchFlag, setSearchFlag] = useState(initSearchFlag);
  const [searchVal, setSearchVal] = useState(value || '');

  /**
   * @description: 改变select选择的内容
   * @param {type}
   * @return:
   */
  const onSearchFlagChange = (val: string | number) => {
    setSearchFlag(val);
  };
  /**
   * @description: 点击搜索按钮的时候
   * @param {type}
   * @return:
   */
  const handleSearch = () => {
    onSearch && onSearch(searchFlag, searchVal);
  };

  /**
   * @description: input的输入框的值改变的时候改变input 的值
   * @param {type}
   * @return:
   */
  const handleChangeSearchVal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  /**
   * @description: 模糊搜索前面的选择
   * @param {type}
   * @return:
   */
  const selectBefore = (
    <Select
      className='search-before'
      value={searchFlag}
      onChange={onSearchFlagChange}
      style={{ width: `${selectWidth}px` }}
    >
      {options.map((item) => (
        <Option value={item.value} key={item.value}>
          {item.text}
        </Option>
      ))}
    </Select>
  );
  /**
   * @description: 模糊搜索后面Icon
   * @param {type}
   * @return:
   */
  const selectAfter = (
    <Button
      className='search-btn'
      icon='search'
      type='primary'
      onClick={handleSearch}
    >
      搜索
    </Button>
  );

  useEffect(() => {
    setSearchFlag(flag);
    setSearchVal(value);
  }, [flag, value]);
  return (
    <div className='search-input'>
      <Input
        className='search-input-wrap'
        addonBefore={selectBefore}
        addonAfter={selectAfter}
        value={searchVal}
        onChange={handleChangeSearchVal}
        onPressEnter={handleSearch}
        placeholder='请输入关键字'
      />
    </div>
  );
}

export default SearchInput;
