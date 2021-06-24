import React, { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import './index.less';

interface Props {
  title: string;
  back?: boolean; // 是否有返回
  mClassName?: string;
  to?: string;
  children?: ReactNode;
  fromSubPage?: boolean; // 是否来自二级页面，用于配合保留搜索状态, 默认为true
  state?: string | Object | any // 用来记录原页面中的状态，比如多个tab情况下的默认tabKey
}
function Header(props: Props) {
  const history = useHistory();
  /**
   * 返回点击返回处理函数
   */
  const goBack = () => {
    const { to, state } = props;
    const fromSubPage =
      props.fromSubPage === undefined ? true : props.fromSubPage;
    try {
      // if (fromSubPage) {
      //   history.push({
      //     pathname: to,
      //     state: { isFromSubPage: '1' },
      //   });
      // } else {
      //   history.push(to as string);
      // }
      if (to) {
        // history.push(to as string);
        history.push(
          {
            pathname: to as string,
            state: state
          }
        )
      } else {
        history.goBack();
      }
      if (fromSubPage) {
        sessionStorage.setItem('isFromSubPage', '1');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`${props.mClassName || ''} mheader`}>
      {props.back && (
        <>
          <span className='back' onClick={goBack}>
            <span className='icon-direc-left' />
            返回
          </span>
          <div className='diviedr' />
        </>
      )}
      <span className='mheader-title'>{props.title}</span>
      {props.children}
    </div>
  );
}
export default Header;
