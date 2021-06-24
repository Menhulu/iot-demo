import React, { useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';

type AuthButtonProps = ButtonProps & {
  buttonKey: string;
  children?: React.ReactNode;
  routeAuthVOList: { authId: number; authName: string; description: string }[];
};

function AuthButton(props: AuthButtonProps) {
  const { buttonKey, routeAuthVOList, title, ...restProps } = props;
  const [hasPermission, setPermission] = useState<boolean>(true);
  useEffect(() => {
    const $hasPermission = routeAuthVOList.some((item) =>
      item.authName.includes(buttonKey)
    );
    setPermission($hasPermission);
  }, [buttonKey, routeAuthVOList]);
  return (
    <>
      {hasPermission ? (
        <Tooltip
          title={title}
          placement='bottom'
          overlayClassName='table-cell-tooltip'
        >
          <Button {...restProps}>{props.children}</Button>
        </Tooltip>
      ) : null}
    </>
  );
}

export default AuthButton;
