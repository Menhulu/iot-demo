import React, { Component } from 'react';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import './index.less';

const { TextArea } = Input;

type TextareaProps = typeof Textarea.defaultProps &
  TextAreaProps & {
    width?: number;
    height?: number;
  };

export default class Textarea extends Component<TextareaProps, {}> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    maxLength: 200,
  };

  handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { onChange } = this.props;
    onChange && onChange(event);
  };

  render() {
    const {
      maxLength,
      value,
      placeholder,
      name,
      defaultValue,
      width,
      height,
      disabled,
      ...restProps
    } = this.props;
    return (
      <div
        className={
          disabled ? 'textarea-with-count disabled' : 'textarea-with-count'
        }
        style={{ width, height }}
      >
        <TextArea
          autoSize={false}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          onChange={this.handleChange}
          disabled={disabled}
          {...restProps}
        />
        <div className="count">
          <span className="f-r">
            {value ? (value as string).length : 0}/{maxLength}
          </span>
        </div>
      </div>
    );
  }
}
