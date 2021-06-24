/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2020-05-26 15:52:43
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-09 18:40:28
 */

import commonLogo from 'static/img/logo@2x.png';
import jdiotLogo from 'static/logo.png';
console.log(process.env);
export const REGION = process.env.REGION_ENV;

export const IS_MICRO = process.env.IS_MICRO;
export const IS_SEPARATE = process.env.IS_SEPARATE;
// 网站信息配置
const config = {
  lishui: {
    websiteTitle: '丽水经济技术开发区智慧能源管理平台',
    websiteLogo: commonLogo,
    logoSize: 'small',
  },
  jdiot: {
    websiteTitle: '物联网管理平台',
    websiteLogo: jdiotLogo,
    logoSize: 'big',
  },
  jichang: {
    websiteTitle: '物联网管理平台',
    websiteLogo: commonLogo,
    logoSize: 'small',
  },
  hefei: {
    websiteTitle: '京东智联云(长三角)数字经济产业园物联网管理平台',
    websiteLogo: jdiotLogo,
    logoSize: 'small',
  },
  jdcloud: {
    websiteTitle: '物联网管理平台',
    websiteLogo: jdiotLogo,
    logoSize: 'big',
  },
  panshi: {
    websiteTitle: '云谷磐石数据中心物联网平台',
    websiteLogo: commonLogo,
    logoSize: 'small',
  },
  yqcity: {
    websiteTitle: '乐清市智慧城市运营指挥中心的基础设施平台',
    websiteLogo: jdiotLogo,
    logoSize: 'big',
  },
};
export const websiteData = config[REGION as keyof typeof config];
// 节点类型
export const nodeTypeConfig = [
  {
    label: '直连设备',
    value: 1,
    desc: '直连设备:即一般可直接联网的设备，可通过基站、路由器直接连入因特网，本身具有IP地址且不能挂载子设备。',
  },
  {
    label: '连接代理设备',
    value: 2,
    desc: '连接代理设备:这类设备不仅自身具有 IP 地址，可以连入因特网;同时代理子设备，具有子设备管理模块，可以维持子设备的拓扑关系。',
  },
  {
    label: '非直连设备',
    value: 3,
    desc: '非直连设备:这类设备不具有独立 IP，不能直接连入因特网，需要依赖连接代理设备设备接入物联网平台，如电表等。',
  },
  {
    label: '边缘节点',
    value: 4,
    desc: '边缘节点：计算力更强的连接代理设备，可通过边缘应用管理非直连设备，或执行其他计算任务，例如AI推理。',
  },
];
// 联网方式
export const initConnectionTypeOptions = [
  { label: '蜂窝（2G/3G/4G）', value: '2G/3G/4G' },
  { label: '以太网', value: 'ethernet' },
  { label: 'Wi-Fi', value: 'wifi' },
];
// 硬件平台
export const hardwareOptions = [
  { label: 'arm64', value: 'arm64', disabled: false },
  { label: 'x86_64', value: 'x86_64', disabled: false },
];
// 操作系统
export const osOptions = [{ label: 'Linux', value: 'Linux' }];
export const connectionAgentTypeOptions = [
  { label: 'RS485', value: 'RS485' },
  { label: 'LoRa', value: 'LoRa' },
  { label: 'NB-IoT', value: 'NB-IoT' },
  { label: 'HPLC', value: 'HPLC' },
  { label: 'ZigBee', value: 'ZigBee' },
  { label: '其他', value: '-1' },
];

// export const websiteTitle =
//   WEBSITE_TITLE[process.env.REGION_ENV as keyof typeof WEBSITE_TITLE];
// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾
export const displayNameReg =
  /^[a-zA-Z0-9\u4e00-\u9fa5]+([-_]*[a-zA-Z0-9\u4e00-\u9fa5]+)*$/;
export const displayNameRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾';
// 支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头和结尾
export const objectNameReg = /^[a-zA-Z0-9]+([-_]*[a-zA-Z0-9]+)*$/;
export const objectNameRule =
  '支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头和结尾';

// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头、结尾
export const commonTextReg =
  /^[a-zA-Z0-9\u4e00-\u9fa5]+([-_]*[a-zA-Z0-9\u4e00-\u9fa5]+)*$/;
export const commonTextRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头和结尾';

export const versionReg = ['jichang'].includes(REGION as string)
  ? /^[0-9]+$/
  : /^[v|V]?\d{1,4}(\.\d{1,4}){2}$/;
export const versionRule = ['jichang'].includes(REGION as string)
  ? '请输入数字'
  : '请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0';
export const edgeVersionReg = /^[v|V]?\d{1,4}(\.\d{1,4}){2}$/;
export const edgeVersionRule = '请遵循语义化版本规范，版本号格式：主版本号.次版本号.修订号，例如 V1.0.0、v1.0.0 或 1.0.0'

// 支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头
export const deviceDisplayNameReg =
  /^[a-zA-Z0-9\u4e00-\u9fa5]+[a-zA-Z0-9\u4e00-\u9fa5-_]*$/;
export const deviceDisplayNameRule =
  '支持30个字符内的中文、英文字母、数字、连字符、下划线，且以中、英文、数字开头';
// 支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头
export const objectNameRegStart = /^[a-zA-Z0-9]+[a-zA-Z0-9-_]*$/;
export const objectNameRuleStart =
  '支持30个字符内的英文字母、数字、连字符、下划线，且以英文、数字开头';

export const displayNameReg64 =
  /^[\u4e00-\u9fa5a-zA-Z0-9]+([-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9]+)*$/;
// /^([\u4e00-\u9fa5a-zA-Z0-9]|[\u4e00-\u9fa5a-zA-Z0-9]+[\u4e00-\u9fa5a-zA-Z0-9\-_.\s]*[\u4e00-\u9fa5a-zA-Z0-9])$/;
export const displayNameRule64 =
  '仅支持64个以内的汉字、英文、数字、下划线(_)、连字符(-)、点(.)、空格，并且开头和结尾只能包含汉字、英文、数字';

// 是否接入城操
export const IMPORTCITYOS = IS_MICRO === 'true' ? true : false;
// 获取城操作的token信息
export const getCityOsToken = () => {
  let accessToken =
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImFjY291bnRJZCI6MSwidGVuYW50SWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJ1c2VyVHlwZSI6MCwiaXNzIjoiZHJpZ2h0Iiwic3ViIjoidG9rZW4iLCJpYXQiOjE2MTQ5Mjk2MTUsIm5iZiI6MTYxNDkyOTYxNSwiZXhwIjoxNjE1MDE2MDE1fQ.pKIBEY53OI8UCdDWJ5QRqWkDiGJuTjuWS14spSgj13c';
  // let accessToken = '';
  if (localStorage.getItem('access_token')) {
    accessToken = JSON.parse(
      JSON.parse(localStorage.getItem('access_token') as any).v
    );
  }
  console.log(accessToken, '最终的token');
  return accessToken;
};
// 代理后端的地址
// export const PREFIXOWN = 'http://10.241.242.28:31640'; // 城操的开发环境
export const PREFIXOWN =
  IS_SEPARATE === 'true'
    ? 'http://10.241.242.28:31640' // 城操的开发环境
    : ''; // 我们自己开发环境
