import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Text } from 'recharts';

const icuColor = '#0000cc';
const acuteColor = '#00cc66';

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
    communityChange: item.Community.percentChange,
    deathsChange: item.Deaths.percentChange,
    unknownChange: item.Unknown.percentChange,
    fromContactChange: item['From Contact'].percentChange,
    communityIncrease: item.Community.increase,
    deathsIncrease: item.Deaths.increase,
    unknownIncrease: item.Unknown.increase,
    fromContactIncrease: item['From Contact'].increase,
    communityCumulative: item.Community.cumulative,
    deathsCumulative: item.Deaths.cumulative,
    unknownCumulative: item.Unknown.cumulative,
    fromContactCumulative: item['From Contact'].cumulative,
    total: item.total,
    change: item.change,
  }));
}

function VerticalLabel({ text }) {
  return (
    <Text x={-10} y={0} dx={50} dy={150} offset={0} angle={-90}>
      {text}
    </Text>
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
      <div className='flexbox'>
        <h2 className='pl5-l'>Total San Francisco Hospital bed use over time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.hospitalizations}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis label={<VerticalLabel text='Beds in Use' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='ICU' dataKey='icuTotal' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteTotal' stroke={acuteColor} />
          <Line type='monotone' name='Total' dataKey='total' stroke='#003366' />
        </LineChart>

        <h2 className='pl5-l'>% Change in San Francisco Hospital bed use over time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.hospitalizations}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[-30, 100]} label={<VerticalLabel text='% Change in Beds' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='ICU' dataKey='icuChange' stroke={icuColor} />
          <Line type='monotone' name='Acute Care' dataKey='acuteChange' stroke={acuteColor} />
        </LineChart>

        <h2 className='pl5-l'>Total San Francisco Cases over time by Transmission Type</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.cases}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis label={<VerticalLabel text='Number of Cases' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='Total' dataKey='total' stroke='#003366' />
          <Line type='monotone' name='Community' dataKey='communityCumulative' stroke={icuColor} />
          <Line type='monotone' name='Unknown' dataKey='unknownCumulative' stroke={acuteColor} />
          <Line type='monotone' name='Direct Contact' dataKey='fromContactCumulative' stroke='#003366' />
        </LineChart>

        <h2 className='pl5-l'>Change in San Francisco Cases Over Time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.cases}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[0, 200]} label={<VerticalLabel text='% Change in Cases' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='Total' dataKey='change' stroke='#003366' />
          <Line type='monotone' name='Community' dataKey='communityChange' stroke={icuColor} />
          <Line type='monotone' name='Unknown' dataKey='unknownChange' stroke={acuteColor} />
          <Line type='monotone' name='Direct Contact' dataKey='fromContactChange' stroke='#003366' />
        </LineChart>

        <h2 className='pl5-l'>Total San Francisco Deaths Over Time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.cases}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis label={<VerticalLabel text='Number of Deaths' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='Total' dataKey='deathsCumulative' stroke='#003366' />
        </LineChart>

        <h2 className='pl5-l'>Change in San Francisco Deaths Over Time</h2>
        <LineChart
          width={730}
          height={300}
          data={this.state.cases}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis domain={[0, 200]} label={<VerticalLabel text='% Change in Deaths' />} />
          <Tooltip />
          <Legend />
          <Line type='monotone' name='Total' dataKey='deathsChange' stroke='#003366' />
        </LineChart>
      </div>
    );
  }
}
