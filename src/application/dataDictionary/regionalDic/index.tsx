import React, { useEffect, useState } from 'react';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import { Tree } from 'antd';
import { AntTreeNode } from 'antd/lib/tree';

import { AreaVO } from '../types';
import {
  getAllProvince,
  getAllCityByProvince,
  getAllDistrictByCity,
} from '../services';
import './index.less';

const { TreeNode } = Tree;

const RegionalDataDic = (): React.ReactElement => {
  const [treeData, setTreeData] = useState<Partial<AreaVO>[]>([]);

  useEffect(() => {
    /**
     * @description: 查询全国所有省/自治区信息
     * @param {type}
     * @return:
     */
    const queryAllProvinceList = async () => {
      try {
        const res = await getAllProvince();
        if (res && res.data) {
          const allProvinceData = res.data || [];
          // eslint-disable-next-line no-return-assign
          allProvinceData.forEach((city: any) => (city.key = city.code));
          setTreeData([...allProvinceData]);
        } else {
          setTreeData([]);
        }
      } catch (error) {
        setTreeData([]);
      }
    };
    queryAllProvinceList();
  }, []);

  /**
   * @description: 级联查询
   * @param {type}
   * @return:
   */
  const loadMoreData = (node: AntTreeNode) => {
    const { level, name } = node.props.dataRef;
    if (level === 1) {
      return getAllCityByProvince({ provinceName: name }).then(res => {
        if (res && res.data) {
          const allCity = res.data || [];
          // eslint-disable-next-line no-return-assign
          allCity.forEach((city: any) => (city.key = city.name));
          node.props.dataRef.children = allCity;
          setTreeData([...treeData]);
        }
      });
    }
    return getAllDistrictByCity({ cityName: name }).then(res => {
      if (res && res.data) {
        const districtData = res.data || [];
        // eslint-disable-next-line no-return-assign
        districtData.forEach((city: any) => {
          city.key = city.name;
          city.isLeaf = true;
        });
        node.props.dataRef.children = districtData;
        setTreeData([...treeData]);
      }
    });
  };
  const renderTreeNodes = (data: Partial<AreaVO>) =>
    data.map((item: any) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.key} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode key={item.key} title={item.name} {...item} dataRef={item} />
      );
    });

  return (
    <div className="regional-data-dic">
      <ObtainHeight bgColor="#fff">
        <div className="main">
          {/* <header>
            <div className="search-wrap">
              <span>选择区域</span>
              <Cascader
                fieldNames={{ label: 'name', value: 'code' }}
                options={allProvince}
                loadData={loadMoreData}
                onChange={onChange}
                changeOnSelect
              />
              <Button
                type="primary"
                className="search-btn"
                onClick={() => handleSearch()}
              >
                <span className="icon-search" />搜索
              </Button>
            </div>
          </header> */}
          <Tree loadData={loadMoreData}>{renderTreeNodes(treeData)}</Tree>
        </div>
      </ObtainHeight>
    </div>
  );
};

export default RegionalDataDic;
