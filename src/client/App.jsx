import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Text } from 'recharts';

const icuColor = '#0000cc';
const acuteColor = '#00cc66';
const defaultColor = '#003366';

function toHospitaleData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    icuChange: item.ICU.percentChange,
    acuteChange: item['Med/Surg'].percentChange,
    icuTotal: item.ICU.total,
    acuteTotal: item['Med/Surg'].total,
    total: item.ICU.total + item['Med/Surg'].total,
  }));
}

function toCaseData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    deathsPercentChange: item.Deaths.percentChange,
    deaths: item.Deaths.cumulative,
    total: item.total,
    percentChange: item.percentChange,
    rollingAverage: item.rollingAverage,
  }));
}

function VerticalLabel({ text }) {
  return (
    <Text x={-10} y={0} dx={50} dy={150} offset={0} angle={-90} className='f6 f5-ns fw4 black-70'>
      {text}
    </Text>
  );
}

function Chart({ title, data, yAxisLabel, children }) {
  return (
    <div className='mw5 mw7-ns center pa2'>
      <h2 className='f5 f4-ns fw6 black-70'>{title}</h2>
      <LineChart
        width={730}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis label={<VerticalLabel text={yAxisLabel} />} />
        <Tooltip />
        <Legend />
        {children}
      </LineChart>
    </div>
  );
}

VerticalLabel.propTypes = { text: PropTypes.string.isRequired };

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    fetch('/api/hospitalizations')
      .then((response) => response.json())
      .then((data) => this.setState({ hospitalizations: toHospitaleData(data) }));
    fetch('/api/cases')
      .then((response) => response.json())
      .then((data) => this.setState({ cases: toCaseData(data) }));
  }

  render() {
    return (
      <div className='pa4 bg-light-gray'>
        <div className='center'>
          <h1 className='f3 f2-m f1-l'>Visualizing SF COVID-19 Cases</h1>
        </div>
        <Chart
          yAxisLabel='Beds in Use'
          title='Total San Francisco Hospital bed use over time'
          data={this.state.hospitalizations}>
          <Line type='monotone' name='ICU' dataKey='icuTotal' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteTotal' stroke={acuteColor} />
          <Line type='monotone' name='Total' dataKey='total' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='% Change in Beds'
          title='Change in San Francisco Hospital bed use over time'
          data={this.state.hospitalizations}>
          <Line type='monotone' name='ICU' dataKey='icuChange' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteChange' stroke={acuteColor} />
        </Chart>

        <Chart
          yAxisLabel='Number of Cases'
          title='Total Cases in San Francisco Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='total' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='New Cases'
          title='3-day rolling average number of new cases'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='rollingAverage' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='% change'
          title='Change in San Francisco Cases Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='percentChange' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='Number of Deaths'
          title='Total San Francisco Deaths Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='deaths' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='% change'
          title='Change in San Francisco Deaths Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='deathsPercentChange' stroke={defaultColor} />
        </Chart>
      </div>
    );
  }
}
