const _ = require('lodash');
const got = require('got');
const router = require('express').Router();

const BASE_URL = 'https://data.sfgov.org/resource/';

const RESOURCE_MAP = {
  hospitalizations: 'nxjg-bhem.json',
  cases: 'tvq9-ec9w.json',
};

const hospitalCategories = ['ICU', 'Med/Surg'];

function resourceUrl(resource) {
  return `${BASE_URL}${RESOURCE_MAP[resource]}`;
}

function percentChange(previous, current) {
  return previous === 0 ? 0 : ((current / previous) * 100 - 100).toFixed(2);
}

router.get('/hospitalizations', async (req, res) => {
  const allHospitalizations = await got(resourceUrl('hospitalizations')).json();
  const byDate = {};
  allHospitalizations.forEach(({ reportdate, patientcount, dphcategory }) => {
    const date = new Date(reportdate).toLocaleDateString();
    if (!byDate[date]) byDate[date] = {};
    if (!byDate[date][dphcategory]) byDate[date][dphcategory] = { total: 0, percentChange: 0 };
    byDate[date][dphcategory].total += parseInt(patientcount, 10);
    byDate[date].reported = new Date(reportdate);
  });

  const results = _.sortBy(
    _.map(byDate, (value) => value),
    ({ reported }) => reported
  );

  const previous = { ICU: 0, 'Med/Surg': 0 };
  results.forEach((value) => {
    hospitalCategories.map((key) => {
      value[key].percentChange = percentChange(previous[key], value[key].total);
      previous[key] = value[key].total;
    });
  });

  res.json(results);
});

const transmissionCategories = ['Community', 'From Contact', 'Unknown'];
const caseCategories = [...transmissionCategories, 'Deaths'];

router.get('/cases', async (req, res) => {
  const allCases = await got(resourceUrl('cases')).json();
  const byDate = {};
  allCases.forEach(({ date, case_count, transmission_category, case_disposition }) => {
    date = new Date(date).toLocaleDateString();
    const key = case_disposition === 'Deaths' ? case_disposition : transmission_category;
    if (!byDate[date]) {
      byDate[date] = {};
      caseCategories.forEach((category) => {
        byDate[date][category] = { increase: 0, cumulative: 0, percentChange: 0 };
      });
    }
    byDate[date][key].increase += parseInt(case_count, 10);
    byDate[date].reported = new Date(date);
  });

  const results = _.sortBy(Object.values(byDate), ({ reported }) => new Date(reported));

  const previous = { Community: 0, 'From Contact': 0, Unknown: 0, Deaths: 0, total: 0 };
  results.forEach((value) => {
    caseCategories.map((key) => {
      const { increase } = value[key];
      value[key].cumulative = previous[key] + increase;
      value[key].percentChange = percentChange(previous[key], value[key].cumulative);

      previous[key] = value[key].cumulative;
    });

    value.total = _.sumBy(transmissionCategories, (category) => value[category].cumulative);
    if (previous.total !== 0) value.percentChange = percentChange(previous.total, value.total);
    previous.total = value.total;
  });

  res.json(results);
});

module.exports = router;
