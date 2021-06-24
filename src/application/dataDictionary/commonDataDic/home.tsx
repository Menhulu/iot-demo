import React, { useEffect, useState, useContext, useCallback } from 'react';
import dayjs from 'dayjs';
import ObtainHeight from 'components/HomeLayout/obtainHeightContainer';
import PaginationOwn from 'components/Pagination';
import Toast from 'components/SimpleToast';
import Modal from 'components/Modal';
import AuthButton from 'components/AuthButton';
import { Select, Table } from 'antd';
import { ColumnProps } from 'antd/es/table';
import CreateEditModal from './createEdit';
import { CreateEditContext, SET_CDMODAL_SHOW, SET_EDIT_INFO } from './context';
import { DictionaryInfo, Pagination, QueryDictParams } from '../types';
import { queryComDicList, findAllType, delComDicList } from '../services';
import './index.less';

const { Option } = Select;

type CommonDataDicProps = {
  authVOList: { authId: number; authName: string; description: string }[];
};
function useFetch(initQueryParams: QueryDictParams) {
  const [dataList, setDataList] = useState<DictionaryInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination>({
    pageNo: 1,
    pageSize: 20,
    total: 0,
    lastPage: 1,
  });
  const [queryParam, setQueryParam] = useState<QueryDictParams>(
    initQueryParams
  );
  useEffect(() => {
    const fetchList = async (param?: QueryDictParams) => {
      setLoading(true);
      try {
        const res = await queryComDicList(queryParam);
        if (res && res.list) {
          const { list, pageVO } = res;
          setDataList(list);
          const paginationInfo = {
            pageNo: pageVO.pageNo,
            pageSize: pageVO.pageSize,
            total: pageVO.total,
            lastPage: Math.ceil(pageVO.total / pageVO.pageSize),
          };
          setPagination(paginationInfo);
          setLoading(false);
        } else {
          setDataList([]);
          setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
          setLoading(false);
        }
      } catch (error) {
        setDataList([]);
        setPagination({ pageSize: 20, pageNo: 1, total: 0, lastPage: 1 });
        setLoading(false);
      }
    };

    fetchList();
  }, [queryParam]);
  return [
    { queryParam, dataList, pagination, loading },
    setQueryParam,
  ] as const;
}

const CommonDataDic = (props: CommonDataDicProps): React.ReactElement => {
  const { state, dispatch } = useContext(CreateEditContext);
  const { iscreateEditShow } = state;
  const { authVOList } = props;

  const columns: ColumnProps<DictionaryInfo>[] = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: '20%',
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      width: '20%',
    },
    {
      title: '排序',
      dataIndex: 'dictOrder',
      key: 'dictOrder',
      align: 'center',
      width: '10%',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: '15%',
      render: (text: any, record: DictionaryInfo, index: number) =>
        dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
      width: '15%',
      render: (text: any, record: DictionaryInfo, index: number) => (
        <>
          <AuthButton
            type="primary"
            shape="circle"
            title="编辑"
            className="btn-edit"
            buttonKey="UPDATE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => {
              handleEditRecord(record);
            }}
          >
            <span className="icon-edit" />
          </AuthButton>
          <AuthButton
            type="primary"
            shape="circle"
            title="删除"
            className="btn-delete"
            buttonKey="DELETE_PERMISSION"
            routeAuthVOList={authVOList}
            onClick={() => showDelModal(record)}
          >
            <span className="icon-delete" />
          </AuthButton>
        </>
      ),
    },
  ];
  const initQueryParams: QueryDictParams = {
    type: '',
    pageNo: 1,
    pageSize: 20,
  };
  // 查询列表相关
  const [
    { queryParam, dataList, pagination, loading },
    setQueryParam,
  ] = useFetch(initQueryParams);
  // 类型相关的信息
  const [typeInfo, setTypeInfo] = useState<string[]>([]);

  // 查询类型
  const findType = useCallback(async () => {
    try {
      const res = await findAllType({
        t: new Date().valueOf().toString(),
      });
      if (res) {
        if (res) {
          setTypeInfo(res || []);
        } else {
          setTypeInfo([]);
        }
      }
    } catch (error) {
      setTypeInfo([]);
    }
  }, []);

  // 是否展示删除的提示框
  const [isDelModalShow, setIsDelModalShow] = useState<boolean>(false);

  // 删除的id
  const [delParam, setDelParam] = useState<{
    id: number;
    type: string;
    name: string;
  }>();

  useEffect(() => {
    if (!iscreateEditShow) {
      setQueryParam({ ...queryParam });
      findType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iscreateEditShow]);
  /**
   * @description: 点击选择类型
   * @param {type}
   * @return:
   */
  const handleSelectType = (value: string) => {
    setQueryParam({ ...queryParam, type: value });
  };

  /**
   * @description: 点击搜索
   * @param {type}
   * @return:
   */
  const handleSearch = () => {
    setQueryParam({ ...queryParam });
  };

  /**
   * @description: 翻页
   * @param {type}
   * @return:
   */
  const pageChange = (current: number) => {
    setQueryParam({ ...queryParam, pageNo: current });
  };

  /**
   * @description: 点击删除按钮，弹出二次确认提示框
   * @param {number} id [字典的id]
   * @return:
   */
  function showDelModal(record: DictionaryInfo) {
    const { id, type, name } = record;
    setIsDelModalShow(true);
    setDelParam({ id, type, name });
  }
  /**
   * @description: 点击确定删除
   * @param {type}
   * @return:
   */
  const handleDelOK = async () => {
    try {
      if (delParam) {
        const res = await delComDicList(delParam);
        if (res && res.code === 200) {
          Toast('删除成功');
          setIsDelModalShow(false);
          setQueryParam({ ...queryParam });
          findType();
        } else {
          setIsDelModalShow(false);
        }
      }
    } catch (error) {
      setIsDelModalShow(false);
    }
  };

  /**
   * @description: 点击取消
   * @param {type}
   * @return:
   */
  const handelDelCancel = () => {
    setIsDelModalShow(false);
  };

  /**
   * @description: 点击新增以后，出现弹框
   * @param {type}
   * @return:
   */
  function handelShowCreate() {
    const editData = {
      type: '',
      name: '',
      code: '',
      dictOrder: 0,
      id: '',
    };
    dispatch({
      type: SET_EDIT_INFO,
      createEditInfo: editData,
    });
    dispatch({
      type: SET_CDMODAL_SHOW,
      iscreateEditShow: true,
    });
  }

  /**
   * @description: 点击编辑信息
   * @param {type}
   * @return:z
   */
  function handleEditRecord(info: DictionaryInfo) {
    const { createTime, updateTime, ...editData } = info;
    dispatch({
      type: SET_CDMODAL_SHOW,
      iscreateEditShow: true,
    });
    dispatch({
      type: SET_EDIT_INFO,
      createEditInfo: editData,
    });
  }

  return (
    <div className="common-data-dic">
      <ObtainHeight bgColor="#fff">
        <div className="main">
          <header>
            <div className="search-wrap">
              <span className="search-label">类型：</span>
              <Select
                showSearch
                value={queryParam.type}
                placeholder="请选择类型"
                style={{ width: 180 }}
                onSelect={handleSelectType}
              >
                <Option key="all" value="">
                  全部
                </Option>
                {typeInfo.map((type: string, index: number) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Option value={type} key={`${type}${index}`}>
                    {type}
                  </Option>
                ))}
              </Select>
              <AuthButton
                type="primary"
                className="search-btn"
                buttonKey="QUERY_PERMISSION"
                routeAuthVOList={authVOList}
                onClick={() => handleSearch()}
              >
                <span className="icon-search" />
                搜索
              </AuthButton>
            </div>
            <div className="btn-wrap">
              <AuthButton
                type="primary"
                buttonKey="CREATE_PERMISSION"
                routeAuthVOList={authVOList}
                onClick={() => {
                  handelShowCreate();
                }}
              >
                新增
              </AuthButton>
            </div>
          </header>
          <Table
            columns={columns}
            loading={loading}
            dataSource={dataList}
            rowKey={(record: DictionaryInfo, index: number) =>
              record.id.toString()
            }
            pagination={false}
            locale={{
              emptyText: (
                <div className="list-empty-box">
                  <span className="icon-null" />
                  <p className="empty-text">当前暂无任何设备</p>
                </div>
              ),
            }}
          />
          {dataList.length > 0 && (
            <PaginationOwn
              total={pagination.total}
              pageSize={pagination.pageSize}
              current={pagination.pageNo}
              lastPage={pagination.lastPage || 1}
              onChange={pageChange}
            />
          )}
          <Modal
            title="删除提示"
            visible={isDelModalShow}
            onOk={handleDelOK}
            onCancel={handelDelCancel}
            cancelText="不删除"
            okText="删除"
          >
            <div>确定要删除此条记录吗？</div>
          </Modal>
          <CreateEditModal />
        </div>
      </ObtainHeight>
    </div>
  );
};

export default CommonDataDic;
