/*
 * @Author:zhaohongyn1@jd.com
 * @Date: 2021-01-03 20:10:13
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-17 19:53:05
 */

export const type = {
  'device-app': '设备应用',
  'biz-app': '业务应用',
};

// 签名算法
// export const DigestAlgorithm = ['SHA256', 'MD5'];
export const DigestAlgorithm = ['MD5']
// CPU优先级
export const CpuShares = ['Lower', 'Normal', 'Higher'];
// 硬件平台
export const Hardware = ['arm64', 'x86_64'];
// 操作系统
export const OS = ['Linux'];
// 重启策略
export const RestartPolicy = {
  Never: '从不重启',
  Always: '总是重启',
  OnFailure: '失败时重启',
};

// 重启策略
export const AppState = {
  stop: '停止',
  Stopped: '停止',
  Running: '运行中',
  Installing: '安装中',
  UnInstalling: '卸载中',
  fail: '失败',
};

// 请输入30个字符以内的中英文字符、数字、下划线、连字符、点和空格
export const publisherReg = /^[a-zA-Z0-9\u4e00-\u9fa5-_.\s]*$/;
export const publisherRule =
  '请输入30个字符以内的中英文字符、数字、下划线、连字符、点或空格';

export const appNameReg = /^[\u4e00-\u9fa5a-zA-Z0-9]{1,30}$/;
export const appNameRule = '请输入1-30个字符，支持中文、英文、数字';

export const appCodeReg = /^[a-zA-Z0-9\-_]{1,30}$/;
export const appCodeRule =
  '请输入1-30个字符，支持英文、数字、下划线（_）和连字符（-）';
