/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import ReactDOM from 'react-dom';
import './simpleToast.less';

let seed = 0;
const now = Date.now();
function getUuid() {
  return `rcNotification_${now}_${seed++}`;
}

interface State {
  data: Notice[];
}

interface Notice {
  type: string;
  msg: string;
  key: string;
}

class SimpleToast extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { data: [] };
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  }

  static newInstance: () => any;

  add(notice: Notice) {
    this.setState({ data: [...this.state.data, notice] });
    const that = this;
    setTimeout(() => that.remove(notice.key), 2000);
  }

  remove(key: string) {
    const temp = this.state.data.filter((item) => {
      const result = item.key !== key;
      return result;
    });
    this.setState({ data: [...temp] });
  }

  render() {
    return (
      <div className='toast-wrap'>
        {this.state.data.map((item) => {
          if (item.type === 'success') {
            return (
              <div className='toast-success' key={item.key}>
                {item.msg}
              </div>
            );
          }
          return (
            <div className='toast-warning' key={item.key}>
              {item.msg}
            </div>
          );
        })}
      </div>
    );
  }
}

let instance: any;
SimpleToast.newInstance = async () => {
  if (instance) {
    return instance;
  }
  const toast: React.LegacyRef<SimpleToast> = React.createRef();

  const div = document.createElement('div');
  document.body.appendChild(div);
  await ReactDOM.render(<SimpleToast ref={toast} />, div);

  instance = {
    success: (msg: string) => {
      if (toast.current) {
        toast.current.add({ type: 'success', msg, key: getUuid() });
      }
    },
    warning(msg: string) {
      toast.current &&
        toast.current.add({ type: 'warning', msg, key: getUuid() });
    },
  };
  return instance;
};

export default SimpleToast;
