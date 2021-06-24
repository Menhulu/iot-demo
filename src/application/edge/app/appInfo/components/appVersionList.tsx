import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Table from 'components/Table';
import { ColumnProps } from 'antd/lib/table';

import Modal from 'components/Modal';
import Toast from 'components/SimpleToast';

import AppVersionInfo from './appVersionInfo';

import useInitial from 'common/customHooks/useInitialList';
import { useParams } from 'react-router-dom';
import {
  QueryAppVersionParam,
  EdgeAppVersionInfo,
  EdgeAppItem,
} from '../../../types';
import { delEdgeAppVersion, getEdgeAppVersionList } from '../../../service';

export interface AppVersionListProps {
  basicInfo?: Partial<EdgeAppItem>;
  setHasVersion: (flag: boolean) => void;
}

const AppVersionList: React.FC<AppVersionListProps> = ({
  basicInfo,
  setHasVersion,
}) => {
  const { appId } = useParams<{ appId: string }>();

  const [showDelApp, setShowDelApp] = useState(false);
  const [versionToDel, setVersionToDel] = useState({
    version: '',
    id: '',
  });
  const [versionDrawerData, setVersionDrawerData] = useState<{
    type: 'create' | 'edit';
    title: string;
    visible: boolean;
    versionInfo?: Partial<EdgeAppVersionInfo>;
  }>({ type: 'create', title: '新增版本', visible: false });
  const initQueryParam: QueryAppVersionParam = {
    condition: { appId: appId },
    pageNo: 1,
    pageSize: 20,
  };
  const [{ queryParam, list, pagination, loading }, setQueryParam] = useInitial<
    EdgeAppVersionInfo,
    QueryAppVersionParam
  >(getEdgeAppVersionList, initQueryParam, [], 'edgeAppVersionList');

  useEffect(() => {
    setHasVersion(!!list.length);
  }, [list, setHasVersion]);

  /**
   * @description:
   * @param {type}
   * @return:
   */
  function handleDelete(): void {
    delEdgeAppVersion({
      appVersionId: versionToDel?.id,
    })
      .then((res) => {
        if (res.success) {
          let queryPageNO = 1;
          if (pagination.lastPage === 1) {
            queryPageNO = 1;
          } else {
            queryPageNO =
              list.length === 1 ? pagination.pageNo - 1 : pagination.pageNo;
          }
          setQueryParam({ ...queryParam, pageNo: queryPageNO });
          Toast('删除成功！');
          setShowDelApp(false);
        }
      })
      ['catch']((error) => {
        setShowDelApp(false);
      });
  }

  /**
   * @description: 点击不删除的按钮
   */
  function handleCancelDel(): void {
    setShowDelApp(false);
  }

  /**
   * @description: 点击列表上的删除图标
   */
  function handleClickDelBtn(item: EdgeAppVersionInfo) {
    const { version, id } = item;
    setShowDelApp(true);
    setVersionToDel({ version: version || '', id });
  }

  // 切换页码
  const pageChange = (page: number) => {
    setQueryParam({ ...queryParam, pageNo: page });
  };
  // 改变分页大小
  const onShowSizeChange = (current: number, pageSize: number) => {
    setQueryParam({ ...queryParam, pageNo: current, pageSize });
  };
  //  打开编辑&新增版本drawer
  const openEditDrawer = (data?: EdgeAppVersionInfo) => {
    console.log(basicInfo);
    setVersionDrawerData({
      type: data ? 'edit' : 'create',
      title: data ? '编辑版本' : '新增版本',
      visible: true,
      versionInfo: { ...data, appId: basicInfo?.id as string },
    });
  };
  // 管理编辑&新增版本drawer
  const closeDrawer = (flag?: boolean) => {
    setVersionDrawerData({
      type: 'create',
      title: '',
      visible: false,
      versionInfo: undefined,
    });
    if (flag) {
      setQueryParam({ ...queryParam });
    }
  };

  function getfilesize(size: number) {
    //把字节转换成正常文件大小
    if (!size) return '';
    var num = 1024.0; //byte
    if (size < num) return size + ' B';
    if (size < Math.pow(num, 2)) return (size / num).toFixed(1) + ' KB'; //kb
    if (size < Math.pow(num, 3))
      return (size / Math.pow(num, 2)).toFixed(1) + ' MB'; //M
    if (size < Math.pow(num, 4))
      return (size / Math.pow(num, 3)).toFixed(1) + ' G'; //G
    return (size / Math.pow(num, 4)).toFixed(1) + ' T'; //T
  }

  // 列表
  const columns: ColumnProps<EdgeAppVersionInfo>[] = [
    {
      title: '文件名称',
      dataIndex: 'packageName',
      key: 'packageName',
    },
    {
      title: '文件大小',
      dataIndex: 'packageSize',
      key: 'packageSize',
      render: (text: number) => getfilesize(text),
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '硬件平台',
      dataIndex: 'hardware',
      key: 'hardware',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (text: string, record: EdgeAppVersionInfo) => (
        <>
          <a href={record.packageUrl} download>
            <Button className="btn btn-delete " type="link">
              下载
            </Button>
          </a>
          <Button
            className="btn btn-delete ml-10"
            type="link"
            onClick={() => openEditDrawer(record)}
          >
            编辑
          </Button>

          <Button
            className="btn btn-delete"
            type="link"
            title="删除"
            onClick={() => handleClickDelBtn(record)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="appVersionList">
      <div className="clearfix">
        <Button
          type="primary"
          className="btn f-r mb-10"
          onClick={() => openEditDrawer()}
        >
          新建版本
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        pagination={pagination}
        pageChange={pageChange}
        loading={loading}
        rowKey={(record) => record.id}
        onShowSizeChange={onShowSizeChange}
      />

      {/* 列表end */}

      {/* 删除的二次确认弹框 */}
      <Modal
        title="删除提示"
        visible={showDelApp}
        onOk={handleDelete}
        onCancel={handleCancelDel}
        width="400px"
        cancelText="取消"
        okText="删除"
      >
        <p>应用版本删除后不可恢复，您确定要删除</p>
        <p>应用版本 “{versionToDel.version}” 吗？</p>
      </Modal>

      <AppVersionInfo
        title={versionDrawerData.title}
        visible={versionDrawerData.visible}
        type={versionDrawerData.type}
        appVersionData={versionDrawerData.versionInfo}
        closeDrawer={closeDrawer}
      />
    </div>
  );
};
export default AppVersionList;
