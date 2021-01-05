const _ = require('lodash');
const got = require('got');
const router = require('express').Router();

const BASE_URL = 'https://data.sfgov.org/resource/';

const RESOURCE_MAP = {
  hospitalizations: 'nxjg-bhem.json',
  cases: 'tvq9-ec9w.json',
  tests: 'nfpa-mg4g.json',
};

const hospitalCategories = ['ICU', 'Med/Surg'];

const COVID_POSITIVE = 'COVID+';

function resourceUrl(resource) {
  return `${BASE_URL}${RESOURCE_MAP[resource]}`;
}

// Days for the rolling average.
const ROLLING_WINDOW = 7;

router.get('/hospitalizations', async (req, res) => {
  const allHospitalizations = await got(resourceUrl('hospitalizations')).json();
  const byDate = {};
  allHospitalizations.forEach(({ reportdate, patientcount, dphcategory, covidstatus }) => {
    const date = new Date(reportdate).toLocaleDateString();
    if (!byDate[date]) byDate[date] = {};
    if (!byDate[date][dphcategory]) {
      byDate[date][dphcategory] = { total: 0, suspected: 0 };
    }
    const increase = parseInt(patientcount, 10);
    if (covidstatus === COVID_POSITIVE) byDate[date][dphcategory].total += increase;
    byDate[date].reported = new Date(reportdate);
    if (covidstatus !== COVID_POSITIVE) byDate[date][dphcategory].suspected += increase;
  });

  const results = _.sortBy(
    _.map(byDate, (value) => value),
    ({ reported }) => reported
  );

  const previous = { ICU: 0, 'Med/Surg': 0 };
  results.forEach((value) => {
    hospitalCategories.map((key) => {
      previous[key] = value[key].total;
    });
  });

  res.json(results);
});

const transmissionCategories = ['Community', 'From Contact', 'Unknown'];
const caseCategories = [...transmissionCategories, 'Death'];

router.get('/cases', async (req, res) => {
  const allCases = await got(resourceUrl('cases')).json();
  const byDate = {};

  allCases.forEach(
    ({ specimen_collection_date, case_count, transmission_category, case_disposition }) => {
      const date = new Date(specimen_collection_date).toLocaleDateString();
      const key = case_disposition === 'Death' ? case_disposition : transmission_category;
      if (!byDate[date]) {
        byDate[date] = {};
        caseCategories.forEach((category) => {
          byDate[date][category] = { increase: 0, cumulative: 0 };
        });
      }
      byDate[date][key].increase += parseInt(case_count, 10);
      byDate[date].reported = new Date(date);
    }
  );

  const results = _.sortBy(Object.values(byDate), ({ reported }) => new Date(reported));
  let rollingSum = 0;
  results.map((value, ix) => {
    const previous = ix > 0 && results[ix - 1];

    caseCategories.map((key) => {
      const { increase } = value[key];
      if (!previous) {
        value[key].cumulative = increase;
        return;
      }

      value[key].cumulative = previous[key].cumulative + increase;
    });

    value.total = _.sumBy(transmissionCategories, (category) => value[category].cumulative);
    value.increase = _.sumBy(transmissionCategories, (category) => value[category].increase);

    rollingSum += value.increase;
    if (ix >= ROLLING_WINDOW) {
      rollingSum -= _.sumBy(
        transmissionCategories,
        (category) => results[ix - ROLLING_WINDOW][category].increase
      );
    }
    value.rollingAverage = rollingSum / ROLLING_WINDOW;
  });

  res.json(results);
});

router.get('/tests', async (req, res) => {
  const allTests = await got(resourceUrl('tests')).json();
  const rollingSum = { total: 0, positiveRate: 0 };
  const results = allTests.map(({ tests, pct, specimen_collection_date }, ix) => {
    rollingSum.total += parseInt(tests, 10);
    const positiveRate = parseFloat(pct, 10) * 100;
    rollingSum.positiveRate += positiveRate;
    if (ix >= ROLLING_WINDOW) {
      rollingSum.total -= parseInt(allTests[ix - ROLLING_WINDOW].tests, 10);
      rollingSum.positiveRate -= parseFloat(allTests[ix - ROLLING_WINDOW].pct, 10) * 100;
    }
    return {
      total: parseInt(tests, 10),
      positiveRate,
      reported: new Date(specimen_collection_date),
      rollingAverageTotal: rollingSum.total / ROLLING_WINDOW,
      rollingAveragePositiveRate: rollingSum.positiveRate / ROLLING_WINDOW,
    };
  });

  res.json(results);
});

module.exports = router;
