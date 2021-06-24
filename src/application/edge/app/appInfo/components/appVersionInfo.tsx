import React, { useRef, useState, useEffect } from 'react';

import { Button, Drawer } from 'antd';
import axios from 'axios'
import BasicVersionInfo from './basicVersionInfo';
import ContainerParams from './containerParams';
import './style.less';
import Toast from 'components/SimpleToast';
import { saveEdgeAppVersion, checkParams } from 'application/edge/service';
import { EdgeAppVersionInfo } from 'application/edge/types';
const XMLParser = require('react-xml-parser');
const CancelToken = axios.CancelToken;
let cancel = () => { }

export interface AppVersionInfoProps {
  type: 'create' | 'edit';
  title: string;
  visible: boolean;
  appVersionData?: Partial<EdgeAppVersionInfo>;
  closeDrawer: (flag?: true) => void;
}

const AppVersionInfo: React.FC<AppVersionInfoProps> = ({
  type,
  title,
  visible,
  appVersionData,
  closeDrawer,
}) => {
  const containerParamsRef = useRef<any>();
  const basicVersionInfoRef = useRef<any>();
  const [saveLoading, setSaveLoading] = useState(false);
  // 镜像包参数
  const [fileParam, setFileParam] = useState<any>({ url: '' })
  const initUploadStatus = { beginFlag: false, progress: 0 }
  // 开始上传
  const [begainUpload, setBegainUpload] = useState<{ beginFlag: boolean, progress: number }>(initUploadStatus)
  // 检测网络状态
  const [isOnline, setNetwork] = useState(window.navigator.onLine);


  useEffect(() => {
    setSaveLoading(false);
    setBegainUpload(initUploadStatus)
  }, [visible]);
  useEffect(() => {
    window.addEventListener("offline",
      () => {
        setNetwork(window.navigator.onLine)
        cancelUpload()
        Toast("当前网络不可用，恢复网络后请重新添加")
      }
    );
    window.addEventListener("online",
      () => {
        // 如果没有上传结束，继续
        setNetwork(window.navigator.onLine)
      }
    );
  });
  // 保存固件
  const submitAppVersionInfo = async (params: FormData) => {
    try {
      const res = await saveEdgeAppVersion(params, appVersionData?.id);
      if (res && res.code == 200) {
        Toast('保存成功');
        setSaveLoading(false);
        closeDrawer(true);
      } else {
        setSaveLoading(false);
      }
    } catch (error) {
      setSaveLoading(false);
      console.log(error);
    }
  };
  // 保存版本信息
  const saveAppVersion = () => {
    setSaveLoading(true);
    basicVersionInfoRef.current.validateFields((err: any, val: any) => {
      containerParamsRef.current.validateFields(async (errors: any, values: any) => {
        if (!errors && !err) {
          try {

            console.log(values);
            console.log(val, appVersionData);
            const { fileList, digest, ...rest } = val;
            console.log(values.env);
            values.env = values.env || [];
            values.volume = values.volume || [];
            values.portMapping = values.portMapping || [];
            if (values.env && values.env.length) {
              // 校验环境变量名称   如果用户增加 了环境变量则名称必填
              const keyEmpty = values.env.find(
                (item: { key: any }) => !item.key
              );
              if (keyEmpty) {
                Toast('环境变量名称不能为空');
                setSaveLoading(false);
                return;
              }
            }

            const formData = new FormData();

            const { url, ...restFileParam } = fileParam
            let packageData = {};
            // 上传文件参数
            if (type === 'create') {
              packageData = {
                packageName: fileList && fileList[0].name,
                packageSize: fileList[0].size
              }
            } else {
              packageData = {
                packageName: appVersionData?.packageName,
                packageSize: appVersionData?.packageSize,
                packageUrl: appVersionData?.packageUrl
              }
            }
            formData.append(
              'edgeAppVersion',
              JSON.stringify({
                ...restFileParam,
                ...rest,
                ...values,
                appId: appVersionData?.appId,
                packageType: 'binary',
                id: appVersionData?.id,
                ...packageData,
                digest
              })
            );
            // 添加校验参数逻辑
            try {
              const valiResult = await checkParams(formData)
              if (valiResult && valiResult.code === 200 && valiResult.data) {
                // 校验成功
                if (type == 'create') {
                  // 开始上传，展示上传进度
                  setBegainUpload({ ...begainUpload, beginFlag: true })
                  // 先上传文件
                  let tempUrl: string = ''
                  if (process.env.NODE_ENV === 'production') {
                    tempUrl = url
                  } else {
                    tempUrl = url.match(/cn-north-1.jdcloud-oss.com(\S*)/)[1]
                  }
                  // 先上传文件
                  // const tempUrl = url.match(/cn-north-1.jdcloud-oss.com(\S*)/)[1]
                  // 进行MD5校验
                  axios.put(tempUrl, fileList[0].originFileObj, {
                    headers: {
                      'Content-Type': fileList[0].originFileObj.type,
                      'Content-MD5': digest
                    },
                    onUploadProgress: progressEvent => {
                      let complete = (progressEvent.loaded / progressEvent.total * 100.).toFixed(2)
                      setBegainUpload({ beginFlag: true, progress: parseFloat(complete) })
                    },
                    cancelToken: new CancelToken(function executor(c) {
                      // executor 函数接收一个 cancel 函数作为参数
                      cancel = c;
                    })
                  })
                    .then((res: any) => {
                      if (res.status == 200) {
                        console.log(res)
                        submitAppVersionInfo(formData);
                      }
                    }).catch(
                      err => {
                        if (err && err.response && err.response.data) {
                          const errorJson = new XMLParser().parseFromString(err.response.data)
                          const errCode = errorJson.getElementsByTagName('Code')
                          if (errCode && errCode.length > 0) {
                            if (errCode[0].value === 'BadDigest') {
                              Toast('指定的Content-MD5签名值与我们接收到的不匹配')
                            } else if (errCode[0].value === 'InvalidDigest') {
                              Toast('Content-MD5签名值不合法')
                            }
                          }
                        }
                        cancelUpload()
                      })
                } else {
                  submitAppVersionInfo(formData);
                }
              } else {
                // 校验失败
                Toast(valiResult.message)
                setSaveLoading(false)
              }
            } catch (error) {
              console.log(error)
            }


          } catch (error) {
            console.log(error);
          }
        } else {
          setSaveLoading(false);
        }
      });
    });
  };
  const cancelSave = () => {
    setSaveLoading(false);
    cancelUpload()
    closeDrawer();
  };

  // 取消文件上传
  const cancelUpload = () => {
    cancel()
    setSaveLoading(false);
    setBegainUpload(initUploadStatus)
  }

  return (
    <Drawer
      title={title}
      closable={true}
      visible={visible}
      width={818}
      onClose={cancelSave}
    >
      <div className="edgeAppVersionInfo">
        <BasicVersionInfo
          ref={basicVersionInfoRef}
          appVersionData={appVersionData}
          type={type}
          onFileChange={(param: any) => {
            setFileParam(param)
          }}
          begainUpload={begainUpload}
          cancelUpload={cancelUpload}
        />
        {/* 容器参数 & 应用配置 */}
        <ContainerParams
          ref={containerParamsRef}
          data={appVersionData}
          preTitle="缺省"
        />
        <div className="drawer-footer">
          <Button onClick={() => {
            closeDrawer()
            cancelUpload()
          }}>取消</Button>
          <Button loading={saveLoading} onClick={saveAppVersion} type="primary">
            确定
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
export default AppVersionInfo;