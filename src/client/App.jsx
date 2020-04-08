import React, { Fragment } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Text } from 'recharts';

const icuColor = '#0000cc';
const acuteColor = '#00cc66';

function toRelativeData(list) {
  return list.map((item) => ({
    name: new Date(item.reported).toLocaleDateString(),
    icuChange: item.ICU.percentChange,
    acuteChange: item['Med/Surg'].percentChange,
    icuTotal: item.ICU.total,
    acuteTotal: item['Med/Surg'].total,
    total: item.ICU.total + item['Med/Surg'].total,
  }));
}

function VerticalLabel({ text }) {
  return (
    <Text x={-10} y={0} dx={50} dy={150} offset={0} angle={-90}>{text}</Text>
  );
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    fetch('/api/hospitalizations')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          relative: toRelativeData(data),
          absolute: toRelativeData(data),
        });
      });
  }

  render() {
    return (
      <div className='flexbox'>
        <h2 className='pl5-l'>% Change in San Francisco Hospital bed use over time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.relative}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[-30, 100]} label={<VerticalLabel text='% Change in Beds' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='ICU' dataKey='icuChange' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteChange' stroke={acuteColor} />
        </LineChart>

        <h2 className='pl5-l'>Total San Francisco Hospital bed use over time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.absolute}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[0, 100]} label={<VerticalLabel text='Beds in Use' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='ICU' dataKey='icuTotal' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteTotal' stroke={acuteColor} />
          <Line type='monotone' name='Total' dataKey='total' stroke='#003366' />
        </LineChart>
      </div>
    );
  }
}
