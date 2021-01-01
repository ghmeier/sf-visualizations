import React from 'react';
import PropTypes from 'prop-types';
import {
  ReferenceLine,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Text,
  ResponsiveContainer,
} from 'recharts';

const icuColor = '#0000cc';
const acuteColor = '#00cc66';
const defaultColor = '#003366';

function format(num) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function toHospitaleData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    icuTotal: item.ICU.total,
    acuteTotal: item['Med/Surg'].total,
    total: item.ICU.total + item['Med/Surg'].total,
    suspected: item.ICU.suspected + item['Med/Surg'].suspected,
  }));
}

function toCaseData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    deaths: item.Death.cumulative,
    total: item.total,
    rollingAverage: item.rollingAverage,
  }));
}

function toTestData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    total: item.total,
    positiveRate: item.positiveRate,
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

VerticalLabel.propTypes = { text: PropTypes.string.isRequired };

function Chart({ title, data, yAxisLabel, children }) {
  return (
    <div className='center pa2' style={{ height: '300px' }}>
      <h2 className='f5 f4-ns fw6 black-70'>{title}</h2>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='2 2' />
          <XAxis dataKey='name' />
          <YAxis label={<VerticalLabel text={yAxisLabel} />} tickFormatter={format} />
          <Tooltip formatter={format} />
          <Legend />
          {children}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  yAxisLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

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

    fetch('/api/tests')
      .then((response) => response.json())
      .then((data) => this.setState({ tests: toTestData(data) }));
  }

  lastData() {
    if (!this.state.cases) return {};

    const length = this.state.cases.length;
    return this.state.cases[length - 1];
  }

  render() {
    const date = new Date(this.lastData().name);
    date.setDate(date.getDate() - 5);

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
          <Line type='monotone' name='Total Confirmed' dataKey='total' stroke={defaultColor} />
          <Line
            type='monotone'
            name='Unconfirmed'
            dataKey='suspected'
            strokeDasharray='3 3'
            stroke={defaultColor}
          />
        </Chart>

        <Chart
          yAxisLabel='New Cases'
          title='7-day rolling average number of new cases'
          data={this.state.cases}>
          <ReferenceLine x={date.toLocaleDateString()} stroke='red' strokeDasharray='3 3' />
          <Line type='monotone' name='Total' dataKey='rollingAverage' stroke={defaultColor} />
        </Chart>

        <Chart yAxisLabel='Daily Tests' title='Daily Test Numbers' data={this.state.tests}>
          <ReferenceLine x={date.toLocaleDateString()} stroke='red' strokeDasharray='3 3' />
          <Line type='monotone' name='Total' dataKey='total' stroke={acuteColor} />
          <Line
            type='monotone'
            name='7-day Average'
            dataKey='rollingAverage'
            stroke={defaultColor}
          />
        </Chart>

        <Chart yAxisLabel='Test Positivity' title='Daily Test Positivity' data={this.state.tests}>
          <ReferenceLine x={date.toLocaleDateString()} stroke='red' strokeDasharray='3 3' />
          <Line type='monotone' name='% Positive' dataKey='positiveRate' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='Number of Cases'
          title='Total Cases in San Francisco Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='total' stroke={defaultColor} />
        </Chart>

        <Chart
          yAxisLabel='Number of Deaths'
          title='Total San Francisco Deaths Over Time'
          data={this.state.cases}>
          <Line type='monotone' name='Total' dataKey='deaths' stroke={defaultColor} />
        </Chart>
      </div>
    );
  }
}
