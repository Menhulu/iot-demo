import React, { useState, useRef, useLayoutEffect } from 'react';

import { getElementTop, triggerEvent } from 'utils/tools';

type ObtainHeightProps = {
  bgColor?: string; // 背景色
  children: React.ReactNode;
  overflow?: string;
  className?: string;
};

//  计算滚动内容高度的组件
const ObtainHeight = (props: ObtainHeightProps) => {
  const { className, bgColor, overflow } = props;
  const obtainRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(
    document.documentElement.clientHeight - 200
  );

  const setObtainHeight = () => {
    const contentDom: HTMLDivElement | null = obtainRef.current;
    if (contentDom) {
      const top = contentDom?.getBoundingClientRect().top;
      // getElementTop(contentDom as HTMLDivElement);
      const clientHeight = document.documentElement.clientHeight - top;
      setHeight(clientHeight);
    }
  };
  useLayoutEffect(() => {
    setObtainHeight();
    window.onresize = () => {
      setObtainHeight();
    };
    // 主动触发一次resize,解决计算不准确的bug
    const evt = window.document.createEvent('UIEvents');
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
    setTimeout(() => {
      triggerEvent(window, 'resize');
    }, 200);
    return () => {
      window.onresize = null;
    };
  }, []);

  return (
    <div
      className={`${className} obtain-height`}
      ref={obtainRef}
      style={{ height, background: bgColor, overflow }}
    >
      {props.children}
    </div>
  );
};
export default ObtainHeight;
