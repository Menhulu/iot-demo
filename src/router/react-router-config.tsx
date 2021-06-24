/*
 * @Author: zhaohongyun1@jd.com
 * @Date: 2019-10-09 14:09:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-03 15:55:29
 */
import React, { Suspense } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import * as H from 'history';

export interface AuthVO {
  authId: number;
  authName: string;
  description: string;
}

export interface RouteConfigComponentProps<
  Params extends { [K in keyof Params]?: string } = {}
> extends RouteComponentProps<Params> {
  route?: RouteConfig;
}

export interface RouteConfig {
  key?: React.Key;
  location?: Location;
  component?:
    | React.ComponentType<RouteConfigComponentProps<any>>
    | React.ComponentType
    | React.LazyExoticComponent<any>;

  path?: string | string[];
  exact?: boolean;
  strict?: boolean;
  routes?: RouteConfig[];
  render?: (props: RouteConfigComponentProps<any>) => React.ReactNode;
  requireAuth?: boolean;
  authVOList?: AuthVO[];
  [propName: string]: any;
}
export interface SwitchProps {
  children?: React.ReactNode;
  location?: H.Location;
}

function renderRoutes(
  routes: RouteConfig[] | undefined,
  authed: boolean,
  authPath: string,
  extraProps?: any,
  switchProps?: SwitchProps
): JSX.Element | null;

function renderRoutes(
  routes: RouteConfig[] | undefined,
  authed: boolean,
  authPath = '/login',
  extraProps = {},
  switchProps = {}
) {
  return routes ? (
    <Switch {...switchProps}>
      {routes.map((route: RouteConfig, i: number) => (
        <Route
          key={route.key || i}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          render={(props) => {
            if (!route.requireAuth || authed || route.path === authPath) {
              console.log(route, 'router-----');
              if (route.hasPermission) {
                if (route.render) {
                  return route.render({ ...props, ...extraProps, route });
                }
                if (route.component) {
                  return (
                    <Suspense fallback={null}>
                      <route.component
                        {...props}
                        {...extraProps}
                        route={route}
                      />
                    </Suspense>
                  );
                }
              }
              return <>无权限</>;
            }
            return (
              <Redirect
                // eslint-disable-next-line react/prop-types
                to={{ pathname: authPath, state: { from: props.location } }}
              />
            );
          }}
        />
      ))}
    </Switch>
  ) : null;
}

export default renderRoutes;
