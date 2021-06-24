import React from 'react';
import './index.less';

type slideBoxProps = {
  visible: boolean;
  bgColor?: string; // 背景色
  children: React.ReactNode;
  closeSlideBox: any;
  style: React.CSSProperties;
  className?: string;
};

//  计算滚动内容高度的组件
const SlideBox = (props: slideBoxProps) => {
  const contentHeight = parseInt(props.style.height as string, 10) - 50;
  return (
    <div
      className={`slide-box ${props.className} ${
        props.visible ? 'slide-box-show' : ''
      }`}
      style={props.visible ? props.style : { height: 0, overflow: 'hidden' }}
    >
      <div className='slide-content'>
        <div className='close' onClick={props.closeSlideBox}>
          收起
          <span className='double-down icon-retract' />
        </div>
        <div
          className='children-content'
          style={{
            height: props.visible ? contentHeight : 0,
            overflowY: 'auto',
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};
export default SlideBox;
