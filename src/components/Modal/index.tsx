import React from 'react';
import { Modal } from 'antd';
import './index.less';
import { ModalProps } from 'antd/lib/modal/index';

interface Props extends ModalProps {
  children?: React.ReactNode;
}
function ModalOwn(props: Props) {
  const wClassName = `state-grid-modal ${props.wrapClassName}`;
  const {
    width,
    title,
    visible,
    onCancel,
    onOk,
    cancelText,
    okText,
    footer,
    ...rest
  } = props;
  return (
    <Modal
      wrapClassName={wClassName}
      width={width || '500px'}
      centered
      title={title}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      cancelText={cancelText}
      okText={okText}
      footer={footer}
      {...rest}
    >
      {props.children}
    </Modal>
  );
}

export default ModalOwn;
