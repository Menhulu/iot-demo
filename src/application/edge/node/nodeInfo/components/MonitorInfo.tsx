import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Select, DatePicker, ConfigProvider } from 'antd';
import dayjs, { UnitType } from 'dayjs';
import moment from 'moment';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import { queryMetrics, queryDiskMetrics } from 'application/edge/service';
import { QueryMetricsParam } from 'application/edge/types';
import './index.less';
import { RangePickerValue } from 'antd/lib/date-picker/interface';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function MonitorInfo() {
  const { nodeId } = useParams<{ nodeId: string }>();
  // 设置监控时间逻辑
  let timeIndex: number = 0;
  const [dates, setDates] = useState<Array<any>>([]);
  const [dateValue, setDateValue] = useState<Array<any>>();

  const chartEmpty = {
    title: {
      text: '',
      show: true,
      textStyle: {
        // color: '#007aff',
        fontSize: 16,
      },
      left: 'center',
      top: 'center',
    },
  };
  const timeRange: Array<{ count: number; unit: UnitType; desc: string }> = [
    {
      count: 1,
      unit: 'hour',
      desc: '过去一小时',
    },
    {
      count: 6,
      unit: 'hour',
      desc: '过去六小时',
    },
    {
      count: 12,
      unit: 'hour',
      desc: '过去十二小时',
    },
    {
      count: 1,
      unit: 'day',
      desc: '过去一天',
    },
    {
      count: 3,
      unit: 'day',
      desc: '过去三天',
    },
    {
      count: 7,
      unit: 'day',
      desc: '过去七天',
    },
  ];

  const initDateVal = [
    dayjs().subtract(timeRange[timeIndex].count, timeRange[timeIndex].unit),
    dayjs(),
  ];
  const [dateRangeShow, setDateRangeShow] = useState<boolean>(false);
  const initQueryMetricsParam: QueryMetricsParam = {
    edgeOid: nodeId,
    startTime: initDateVal[0].valueOf(),
    endTime: initDateVal[1].valueOf(),
  };

  // const timeRange = {
  //   hour: '过去一小时',
  //   day: '过去一天',
  //   week: '过去七天',
  //   custom: '自定义时间',
  // };

  // 图表数据
  const [cpuData, setCpuData] = useState<any>(chartEmpty);
  const [memoryData, setMemoryData] = useState<any>(chartEmpty);
  const [diskData, setDiskData] = useState<any>(chartEmpty);
  const [networkInData, seNetworkInData] = useState<any>(chartEmpty);
  const [networkOutData, seNetworkOutData] = useState<any>(chartEmpty);

  // 修改时间段
  const changeTimeRange = (val: any) => {
    if (val === 'custom') {
      setDateRangeShow(true);
    } else {
      timeIndex = val;
      setDateRangeShow(false);
      const dataVal = [
        dayjs().subtract(timeRange[timeIndex].count, timeRange[timeIndex].unit),
        dayjs(),
      ];
      fetchData({
        ...initQueryMetricsParam,
        startTime: dataVal[0].valueOf(),
        endTime: dataVal[1].valueOf(),
      });
      console.log(
        timeIndex,
        dayjs(dataVal[0].valueOf()).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(dataVal[1].valueOf()).format('YYYY-MM-DD HH:mm:ss')
      );
    }
  };
  // 时间范围变化
  const handleRangeChange = (
    // dates: RangePickerValue,
    dates: any,
    dateStrings: [string, string]
  ) => {
    clearTimeout();
    setDateValue(dates);
  };

  // 日期不可选
  function disabledDate(current: moment.Moment | null): boolean {
    if (!current) {
      return false;
    }
    if (!dates || dates.length === 0) {
      return current > moment().endOf('day');
    }

    return (
      dates[0].diff(current, 'days') > 30 ||
      current.diff(dates[0], 'days') > 30 ||
      current > moment().endOf('day')
    );
  }
  const onOpenChange = (open: boolean) => {
    if (open) {
      setDates([]);
    } else {
      // 关闭后查询数据
      if (dates.length > 0) {
        fetchData({
          ...initQueryMetricsParam,
          startTime: dates[0].valueOf(),
          endTime: dates[1].valueOf(),
        });
        console.log(
          dayjs(dates[0].valueOf()).format('YYYY-MM-DD HH:mm:ss'),
          dayjs(dates[1].valueOf()).format('YYYY-MM-DD HH:mm:ss')
        );
      }
    }
  };

  // 生成折线图数据
  const createLineChartData = (data: any, unit: string) => {
    let unitArray: Array<any> = [unit, null, null, null];
    const xAxisData: string[] = [];
    const seriesData: number[] = [];
    // 取数据最小值的单位
    const valueData = data.map((item: any) => {
      return item.value;
    });
    const maxData = Math.max.apply(
      Math,
      valueData.filter((item: string | number) => {
        return String(item) !== '0';
      })
    );
    Array.isArray(data) &&
      data.forEach((item: any) => {
        const key = dayjs(item.timestamp).format('YYYY-MM-DD\nHH:mm:ss');
        const value = item.value;
        xAxisData.push(key);
        // 处理流入流出速率单位
        if (unit === 'Bytes/s') {
          if (maxData / 1024 / 1024 / 1024 > 1) {
            unitArray[3] = 'GB/s';
            seriesData.push(
              parseFloat((value / 1024 / 1024 / 1024).toFixed(1))
            );
          } else if (maxData / 1024 / 1024 > 1) {
            unitArray[2] = 'MB/s';
            seriesData.push(parseFloat((value / 1024 / 1024).toFixed(1)));
          } else if (maxData / 1024 > 1) {
            unitArray[1] = 'KB/s';
            seriesData.push(parseFloat((value / 1024).toFixed(1)));
          } else {
            seriesData.push(value);
          }
        } else {
          seriesData.push(value);
        }
      });
    // 获取最大单位
    let newUnit: string = '';
    unitArray.map((unit) => {
      if (unit != null) {
        newUnit = unit;
      }
    });

    const chartData = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        name: '时间',
        type: 'category',
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#007aff',
          },
        },
        silent: false,
        splitLine: {
          show: false,
        },
        splitArea: {
          show: false,
        },
      },
      grid: {
        bottom: 30,
      },
      dataZoom: [
        {
          type: 'inside',
        },
        {
          type: 'slider',
        },
      ],
      yAxis: {
        minInterval: 1,
        name: `单位：${newUnit}`,
        type: 'value',
        nameTextStyle: {
          color: '#007aff',
          align: 'left',
        },
        axisLine: {
          lineStyle: {
            color: '#007aff',
          },
        },
        axisLabel: {
          color: '#007aff',
        },
      },
      color: ['#007aff'],
      series: [
        {
          data: seriesData,
          type: 'bar',
          large: true,
        },
      ],
    };
    return chartData;
  };

  // 生成磁盘双层折线图数据
  const createDoubleLineChartData = (data: any) => {
    const dateKeys = Object.keys(data);
    const newKey: Array<string> = [];

    const xAxisDataArray: Array<string>[] = [];
    const seriesDataArray: Array<number>[] = [];
    Array.isArray(dateKeys) &&
      dateKeys.forEach((item: any, index: number) => {
        const xAxisData: string[] = [];
        const seriesData: number[] = [];
        Array.isArray(data[item]) &&
          data[item].forEach((i: any) => {
            const key = dayjs(i.timestamp).format('YYYY-MM-DD\nHH:mm:ss');
            const value = i.value;
            xAxisData.push(key);
            seriesData.push(value);
          });
        xAxisDataArray.push(xAxisData);
        seriesDataArray.push(seriesData);
      });

    // 只显示目录名
    dateKeys.map((item: string, index: number) => {
      newKey[index] = item.split('.')[2];
    });
    const chartData = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: [
        {
          name: '时间',
          type: 'category',
          data: xAxisDataArray[0],
          axisLine: {
            lineStyle: {
              color: '#007aff',
            },
          },
        },
      ],
      color: ['#007aff', '#EE6666', '#d14a61', '#675bba'],
      legend: {
        show: true,
        data: newKey.map((key) => {
          return key;
        }),
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      grid: {
        bottom: 30,
      },
      // dataZoom: [
      //   {
      //     type: 'inside',
      //   },
      //   {
      //     type: 'slider',
      //   },
      // ],
      yAxis: [
        {
          minInterval: 1,
          name: '单位：%',
          type: 'value',
          nameTextStyle: {
            color: '#007aff',
            align: 'left',
          },
          axisLine: {
            lineStyle: {
              color: '#007aff',
            },
          },
          axisLabel: {
            color: '#007aff',
          },
        },
        // {
        //   minInterval: 1,
        //   type: 'value',
        //   nameTextStyle: {
        //     color: '#EE6666',
        //     align: 'left',
        //   },
        //   axisLine: {
        //     lineStyle: {
        //       color: '#EE6666',
        //     },
        //   },
        //   axisLabel: {
        //     color: '#EE6666',
        //   },
        // },
      ],
      series: seriesDataArray.map((data: any, index: number) => {
        return {
          name: newKey[index],
          data: seriesDataArray[index],
          type: 'line',
          smooth: true,
        };
      }),
    };
    return chartData;
  };

  const fetchData = async (
    param: QueryMetricsParam = initQueryMetricsParam
  ) => {
    const res = await queryMetrics(param);
    if (res.code === 200) {
      if (res.data) {
        const {
          cpu,
          memory,
          network_inflow_rate,
          network_outflow_rate,
        } = res.data;
        setCpuData(createLineChartData(cpu, '%'));
        setMemoryData(createLineChartData(memory, '%'));
        seNetworkInData(createLineChartData(network_inflow_rate, 'Bytes/s'));
        seNetworkOutData(createLineChartData(network_outflow_rate, 'Bytes/s'));
      }
    }

    const diskRes = await queryDiskMetrics(param);
    if (diskRes.code === 200) {
      // 获取对象key
      setDiskData(createDoubleLineChartData(diskRes.data));
    }
  };

  const cycleGetData = () => {
    const dataVal = [
      dayjs().subtract(timeRange[timeIndex].count, timeRange[timeIndex].unit),
      dayjs(),
    ];
    fetchData({
      ...initQueryMetricsParam,
      startTime: dataVal[0].valueOf(),
      endTime: dataVal[1].valueOf(),
    });
    console.log(
      timeIndex,
      dayjs(dataVal[0].valueOf()).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(dataVal[1].valueOf()).format('YYYY-MM-DD HH:mm:ss')
    );
  };
  // setTimeout(cycleGetData, 1000 * 60);

  useEffect(() => {
    cycleGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="monitor-info">
      <Select
        placeholder="请选择应用类型"
        style={{ width: 200, marginRight: 20 }}
        defaultValue={0}
        onChange={changeTimeRange}
      >
        {timeRange.map((obj, index) => {
          return (
            <Option value={index} key={index}>
              {obj.desc}
            </Option>
          );
        })}
        <Option value="custom" key="custom">
          自定义时间
        </Option>
      </Select>
      {dateRangeShow && (
        <ConfigProvider locale={locale} prefixCls="IOT">
          <RangePicker
            style={{ width: '320px' }}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            placeholder={['开始时间', '结束时间']}
            value={dateValue}
            defaultValue={[undefined, moment()]}
            disabledDate={disabledDate}
            onChange={handleRangeChange}
            onCalendarChange={(val) => setDates(val)}
            onOpenChange={onOpenChange}
            suffixIcon={<span className="icon-calendar" />}
          />
        </ConfigProvider>
      )}
      <div className="chart-list">
        <div className="chart-box">
          <p className="chart-title">
            <span>
              CPU使用率
              {/* <span className="chart-title-tip">仅展示过去24小时数据</span> */}
            </span>
          </p>
          <div className="chart">
            <ReactEchartsCore
              echarts={echarts}
              option={cpuData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <div className="chart-box">
          <p className="chart-title">
            <span>
              内存使用率
              {/* <span className="chart-title-tip">仅展示过去24小时数据</span> */}
            </span>
          </p>
          <div className="chart">
            <ReactEchartsCore
              echarts={echarts}
              option={memoryData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
      <div className="chart-list">
        <div className="chart-box">
          <p className="chart-title">
            <span>
              网络流入速率
              {/* <span className="chart-title-tip">仅展示过去24小时数据</span> */}
            </span>
          </p>
          <div className="chart">
            <ReactEchartsCore
              echarts={echarts}
              option={networkInData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <div className="chart-box">
          <p className="chart-title">
            <span>
              网络流出速率
              {/* <span className="chart-title-tip">仅展示过去24小时数据</span> */}
            </span>
          </p>
          <div className="chart">
            <ReactEchartsCore
              echarts={echarts}
              option={networkOutData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
      <div className="chart-list">
        <div className="chart-box">
          <p className="chart-title">
            <span>
              磁盘使用率
              {/* <span className="chart-title-tip">仅展示过去24小时数据</span> */}
            </span>
          </p>
          <div className="chart">
            <ReactEchartsCore
              echarts={echarts}
              option={diskData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
