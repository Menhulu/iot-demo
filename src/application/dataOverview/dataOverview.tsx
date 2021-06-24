/* eslint-disable react-hooks/exhaustive-deps */
import { Col, Row } from 'antd';
import Header from 'components/Header';
import dayjs from 'dayjs';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import echarts, { EChartOption } from 'echarts/lib/echarts';
import React, { useEffect, useState } from 'react';
import { REGION } from 'utils/constants';
import { triggerEvent } from 'utils/tools';
import { RouteConfigComponentProps } from '../../router/react-router-config';
import './dataOverview.less';
import { getDataAnalysisList } from './services/index';
// import Chart from './components/chart/index';
import { DataAnalysisList } from './types/index';

// 数字转换
const numberFormat = (value: number) => {
  const param: { value: number; unit: string } = { value: 0, unit: '' };
  const k = 10000;
  const sizes = ['', '万', '亿', '万亿'];
  let i;
  if (value < k) {
    param.value = value;
    param.unit = '';
  } else {
    i = Math.floor(Math.log(value) / Math.log(k));
    param.value = parseFloat((value / Math.pow(k, i)).toFixed(2));
    param.unit = sizes[i];
  }
  return param;
};

const DataOverview = (props: RouteConfigComponentProps): React.ReactElement => {
  // 国际化 End <<<
  type SeriesData = { value: number; name: string }[];

  const initDataAnalysisList = {
    totalProductCount: 0,
    directConProductCount: 0,
    edgeProductCount: 0,
    unDirectConProductCount: 0,
    totalDeviceCount: 0,
    directConDeviceCount: 0,
    edgeDeviceCount: 0,
    unDirectConDeviceCount: 0,
    totalOnlineDeviceCount: 0,
    directConOnlineDeviceCount: 0,
    edgeOnlineDeviceCount: 0,
    unDirectConOnlineDeviceCount: 0,
    edgeNodeDeviceCount: 0,
    edgeNodeOnlineDeviceCount: 0,
    edgeNodeProductCount: 0,
    hourEventCountList: [],
  };

  const chartEmpty = {
    title: {
      text: '',
      show: true,
      textStyle: {
        color: '#007aff',
        fontSize: 20,
      },
      left: 'center',
      top: 'center',
    },
  };

  // 物类型数图表
  const [productChartData, setProductChartData] = useState<any>(chartEmpty);
  // 设备数图表
  const [deviceChartData, setDeviceChartData] = useState<any>(chartEmpty);
  // 设备在线数图表
  const [deviceOnlineChartData, setDeviceOnlineChartData] =
    useState<any>(chartEmpty);
  // 事件图表
  const [eventChartData, setEventChartData] = useState<any>(chartEmpty);

  const [dataAnalysisList, setDataAnalysisList] =
    useState<DataAnalysisList>(initDataAnalysisList);

  //  图表数据实例
  const productChart: echarts.ECharts | null = null;

  // 生成饼状图数据
  const createPieChartData = (
    totalCount: number,
    seriesName: string,
    seriesData: SeriesData
  ) => {
    const chartData = {
      title: {
        text: `${
          numberFormat(totalCount).value + numberFormat(totalCount).unit
        }`,
        left: '25%',
        top: 'middle',
        padding: 0,
        textAlign: 'center',
        textStyle: {
          color: '#007aff',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '8%',
        top: 'middle',
        align: 'left',
        itemGap: 9,
        icon: 'pin',
        formatter(name: string) {
          const val =
            seriesData.length > 0
              ? seriesData.filter((item) => name === item.name)[0].value
              : '0';
          return `${name}：${val}${seriesName === '物类型数' ? '个' : '台'}`;
        },
        textStyle: {
          fontSize: 14,
        },
        data: ['直连设备', '连接代理设备', '非直连设备', '边缘节点'],
      },
      series: [
        {
          name: seriesName,
          type: 'pie',
          minAngle: 30,
          radius: ['35%', '65%'],
          center: ['25%', '50%'],
          avoidLabelOverlap: true,
          label: {
            normal: {
              show: true,
              // formatter: `{c}${seriesName === '物类型数' ? '个' : '台'}`,
              formatter: (params: any) =>
                numberFormat(parseInt(params.value, 10)).value +
                numberFormat(parseInt(params.value, 10)).unit +
                (seriesName === '物类型数' ? '个' : '台'),
              position: 'inside',
              // color: '#000',
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          color: ['#007aff', '#007affba', '#007aff75', '#87CEFA'],
          data: seriesData,
        },
      ],
    };
    return chartData;
  };

  // 生成一天内整点时钟数
  const createIntegerClock = () => {
    let t = 0;
    const integerClock: string[] = [];
    while (t < 24) {
      integerClock.push(`${t}:00`);
      t++;
    }
    return integerClock;
  };

  // 生成折线图数据
  const createLineChartData = (data: Array<Record<string, number>>) => {
    const xAxisData: string[] = [];
    const seriesData: number[] = [];
    data.forEach((item: Record<string, number>) => {
      const key = Object.keys(item)[0];
      const value = item[key];
      xAxisData.push(key);
      seriesData.push(value);
    });
    const chartData: EChartOption<EChartOption.SeriesLine> = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#007aff',
          },
        },
        axisLabel: {
          color: '#007aff',
          // 使用函数模板，函数参数分别为刻度数值（类目），刻度的索引
          formatter: function (value: string, index: number) {
            // 格式化成月/日，只在第一个刻度显示年份

            return value.substring(11, 16);
          },
        },
        data: xAxisData,
      },
      yAxis: {
        minInterval: 1,
        name: '单位：个',
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
      grid: {
        containLabel: true,
        left: 20,
        right: 30,
        bottom: 20,
      },

      series: [
        {
          data: seriesData,
          // data: [0, 0, 0, 0, 0],
          type: 'line',
          smooth: true,
        },
      ],
    };
    return chartData;
  };

  // 获取图表数据
  const fetchData = () => {
    setProductChartData(chartEmpty);
    getDataAnalysisList()
      .then((res) => {
        if (res) {
          setDataAnalysisList(res);
          const productSeriesData: SeriesData = [
            { value: res.directConProductCount, name: '直连设备' },
            { value: res.edgeProductCount, name: '连接代理设备' },
            { value: res.unDirectConProductCount, name: '非直连设备' },
          ];
          const deviceSeriesData: SeriesData = [
            { value: res.directConDeviceCount, name: '直连设备' },
            { value: res.edgeDeviceCount, name: '连接代理设备' },
            { value: res.unDirectConDeviceCount, name: '非直连设备' },
          ];
          const deviceOnlineSeriesData: SeriesData = [
            { value: res.directConOnlineDeviceCount, name: '直连设备' },
            { value: res.edgeOnlineDeviceCount, name: '连接代理设备' },
            { value: res.unDirectConOnlineDeviceCount, name: '非直连设备' },
          ];
          if (!['jichang'].includes(REGION as string)) {
            productSeriesData.push({
              value: res.edgeNodeProductCount,
              name: '边缘节点',
            });
            deviceSeriesData.push({
              value: res.edgeNodeDeviceCount,
              name: '边缘节点',
            });
            deviceOnlineSeriesData.push({
              value: res.edgeNodeOnlineDeviceCount,
              name: '边缘节点',
            });
          }
          const eventSeriesData: number[] = res.hourEventCountList;
          const eventxAxisData: Array<Record<string, number>> =
            res.hourEventCountMap;

          // 设置物类型型型数图表数据
          setProductChartData(
            createPieChartData(
              res.totalProductCount,
              '物类型数',
              productSeriesData
            )
          );
          // 设置设备数图表数据
          setDeviceChartData(
            createPieChartData(res.totalDeviceCount, '设备数', deviceSeriesData)
          );
          // 设置设备在线数图表数据
          setDeviceOnlineChartData(
            createPieChartData(
              res.totalOnlineDeviceCount,
              '设备在线数',
              deviceOnlineSeriesData
            )
          );
          // 设置事件数图表数据
          setEventChartData(createLineChartData(eventxAxisData));
        } else {
          // 图表数据置空
          setChartEmpty(setProductChartData);
          setChartEmpty(setDeviceChartData);
          setChartEmpty(setDeviceOnlineChartData);
          setChartEmpty(setEventChartData);
        }
      })
      ['catch']((err) => {
        console.log(err);
        // 图表数据置空
        setChartEmpty(setProductChartData);
        setChartEmpty(setDeviceChartData);
        setChartEmpty(setDeviceOnlineChartData);
        setChartEmpty(setEventChartData);
      });
  };

  // 置空图表数据
  function setChartEmpty(
    callback: React.Dispatch<React.SetStateAction<any>>
  ): void {
    chartEmpty.title.text = '暂无数据';
    const opts = JSON.parse(JSON.stringify(chartEmpty));
    callback(opts);
  }

  // 获取图表实例，添加自定义图表事件
  useEffect((): void => {
    console.log('chart', productChart);
  }, [productChart]);

  useEffect((): void => {
    fetchData();
    setTimeout(() => {
      triggerEvent(window, 'resize');
    }, 100);
  }, []);

  return (
    <div className="data-overview">
      <Header mClassName="data-overview-header" title="数据概览">
        <span className="ml-20 deadline">
          数据截至：
          {dayjs()
            .subtract(1, 'day')
            .endOf('day')
            .format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </Header>
      <div className="data-overview-content">
        <Row style={{ height: '40%' }} gutter={10}>
          <Col span={8} style={{ height: '100%' }}>
            <div className="chart-box">
              <div className="chart-title">
                物类型数
                <div className="total-count">
                  <span className="total-count-num">
                    {numberFormat(dataAnalysisList.totalProductCount).value ||
                      '0'}
                  </span>
                  <span className="total-count-unit">
                    {numberFormat(dataAnalysisList.totalProductCount).unit}个
                  </span>
                </div>
              </div>
              <div className="chart">
                {/* <Chart
                  chartKey="productChart"
                  className="productChart"
                  option={productChartData}
                  onRender={(e): void => {
                    productChart = e;
                  }}
                  style={{ width: '100%', height: '100%' }}
                /> */}
                <ReactEchartsCore
                  echarts={echarts}
                  option={productChartData}
                  className="productChart"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <div className="chart-box">
              <div className="chart-title">
                设备数
                <div className="total-count">
                  <span className="total-count-num">
                    {numberFormat(dataAnalysisList.totalDeviceCount).value ||
                      '0'}
                  </span>
                  <span className="total-count-unit">
                    {numberFormat(dataAnalysisList.totalDeviceCount).unit}台
                  </span>
                </div>
              </div>
              <div className="chart">
                {/* <Chart
                  chartKey="deviceChart"
                  className="deviceChart"
                  option={deviceChartData}
                  // onRender={(e): void => {
                  //   productChart = e;
                  // }}
                  style={{ width: '100%', height: '100%' }}
                /> */}
                <ReactEchartsCore
                  echarts={echarts}
                  option={deviceChartData}
                  className="deviceChart"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <div className="chart-box">
              <div className="chart-title">
                设备在线数
                <div className="total-count">
                  <span className="total-count-num">
                    {numberFormat(dataAnalysisList.totalOnlineDeviceCount)
                      .value || '0'}
                  </span>
                  <span className="total-count-unit">
                    {numberFormat(dataAnalysisList.totalOnlineDeviceCount).unit}
                    台
                  </span>
                </div>
              </div>
              <div className="chart">
                {/* <Chart
                  chartKey="deviceOnlineChart"
                  className="deviceOnlineChart"
                  option={deviceOnlineChartData}
                  // onRender={(e): void => {
                  //   productChart = e;
                  // }}
                  style={{ width: '100%', height: '100%' }}
                /> */}
                <ReactEchartsCore
                  echarts={echarts}
                  option={deviceOnlineChartData}
                  className="deviceOnlineChart"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </Col>
        </Row>
        <div className="chart-box event-chart-box">
          <p className="chart-title">
            <span>
              上报事件
              <span className="chart-title-tip">仅展示过去24小时数据</span>
            </span>
          </p>
          <div className="chart">
            {/* <Chart
              chartKey="eventChart"
              className="eventChart"
              option={eventChartData}
              // onRender={(e): void => {
              //   productChart = e;
              // }}
              style={{ width: '100%', height: '100%' }}
            /> */}
            <ReactEchartsCore
              echarts={echarts}
              option={eventChartData}
              className="eventChart"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </div>
      {/* <div onClick={updateChart}> 异步更新图表数据 </div> */}
    </div>
  );
};

export default DataOverview;
