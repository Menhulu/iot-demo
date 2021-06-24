/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-10 15:07:20
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-09-15 17:36:39
 */
/**
 * @description: 获取元素在页面距离顶部的偏移量
 * @param {element} 元素节点
 * @return:  Number
 */
export const getElementTop: (element: HTMLDivElement) => number = (
  element: HTMLDivElement
) => {
  // 获取 element 元素距离父元素的 offsetTop 像素;
  // console.log(element);
  if (!element) return 200;
  let actualTop = element.offsetTop;
  let current = element.offsetParent;
  // console.log(element, actualTop, current);
  // 判断当前元素是都循环到 HTML 根元素了
  while (current !== null) {
    // offsetTop 循环相加
    actualTop += (current as HTMLDivElement).offsetTop;
    // 当 current 为 HTML 根元素是， current.offsetParent 的值为 null
    current = (current as HTMLDivElement).offsetParent;
    // console.log(element, actualTop, current);
  }
  // console.log(actualTop);
  return actualTop;
};
// 写cookies

export function setCookie(name: string, value: any) {
  const Days = 30;
  const exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${escape(value)};expires=${exp.toUTCString()}`;
}
// 读取cookies
export function getCookie(name: string) {
  let arr;
  const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);

  if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
  return null;
}
// 删除cookies
export function delCookie(name: string) {
  const exp = new Date();
  exp.setTime(exp.getTime() - 1);
  const cval = getCookie(name);
  if (cval != null)
    document.cookie = `${name}=${cval};expires=${exp.toUTCString()}`;
}

// 事件触发函数
export function triggerEvent(el: Element | Window, type: string) {
  if ('createEvent' in document) {
    // modern browsers, IE9+
    const e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    el.dispatchEvent(e);
  }
}

/**
 * @description: 生成唯一的id
 * @param {number} length 长度
 * @return:
 */

export const genID = (length: number): string => {
  const id = `${Math.random()}-${Date.now()}`;
  console.log(id, 'id---');
  return id;
};

/**
 * @description: 给数据加一个模拟的id，在刚刚获取数据或者新建一条数据的时候
 * @param {type}
 * @return:
 */
export const addId = (data: any[]): any[] => {
  return data.map((item) => {
    return { ...item, id: item.id || genID(40) };
  });
};

/**
 *@description 版本号的的比较顺序应该是从大版本往小版本开始对比，每个版本之间用.隔开。因此我们可以将两个版本字符串以.分隔开，从第一个版本号开始往下对比，若遇到version1的当前版本号大于version2，则返回1,否则返回-1。若一方的小版本号为空，则看另外一方的小版本号是否不为0。
 * @param version1 版本1
 * @param version2 版本2
 */

export const compareVersion = (version1: string, version2: string) => {
  let pA = 0;
  let pB = 0;
  /** 寻找各区间版本号位置 */
  const findDigit = (str: string, start: number) => {
    let i = start;
    while (str[i] !== '.' && i < str.length) {
      i++;
    }
    return i;
  };
  //  版本从大到小 逐个比较
  while (pA < version1.length && pB < version2.length) {
    // 获取相同区间的版本号结束索引
    const nextA = findDigit(version1, pA);
    const nextB = findDigit(version2, pB);
    // 获取区间版本号
    const numberA = +version1.substr(pA, nextA - pA);
    const numberB = +version2.substr(pB, nextB - pB);
    if (numberA !== numberB) {
      return numberA > numberB ? 1 : -1;
    }
    pA = nextA + 1;
    pB = nextB + 1;
  }
  /** 如果version1 仍有小版本号 */
  while (pA < version1.length) {
    const nextA = findDigit(version1, pA);
    const numberA = +version1.substr(pA, nextA - pA);
    if (numberA > 0) {
      return 1;
    }
    pA = nextA + 1;
  }

  /** 如果version2 仍有小版本号 */
  while (pB < version2.length) {
    const nextB = findDigit(version1, pA);
    const numberB = +version1.substr(pA, nextB - pB);
    if (numberB > 0) {
      return -1;
    }
    pA = nextB + 1;
  }
  //  版本号完全相同
  return 0;
};
