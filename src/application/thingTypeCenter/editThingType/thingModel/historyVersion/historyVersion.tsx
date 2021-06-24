import React from 'react';
import { VersionItem } from '../../../types/thingModel';
import './index.less';

export default function HistoryVersion(props: { versionList: VersionItem[] }) {
  // const { id } = useParams<{ id: string; thingModelVersion: string }>();
  const versionList =
    props.versionList.filter(item => item.publishedStatus === 1) || [];

  return (
    <div className="history-version">
      <h1>历史记录</h1>
      <div className="basic-info-main">
        {versionList.length > 0 &&
          versionList.map(item => (
            <dl className="basic-con" key={item.thingModelVersion}>
              <dt className="version">V{item.thingModelVersion}</dt>
              <dd className="changelog">
                <div>本次迭代升级内容如下</div>
                <div>{item.changeLog}</div>
              </dd>
            </dl>
          ))}
      </div>
    </div>
  );
}
