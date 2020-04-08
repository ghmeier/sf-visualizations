const _ = require('lodash');
const got = require('got');
const router = require('express').Router();

const BASE_URL = 'https://data.sfgov.org/resource/';

const RESOURCE_MAP = {
  hospitalizations: 'nxjg-bhem.json',
};

const categories = ['ICU', 'Med/Surg'];

function resourceUrl(resource) {
  return `${BASE_URL}${RESOURCE_MAP[resource]}`;
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
    _.map(byDate, (value, key) => ({ ...value, reported: key })),
    ({ reported }) => new Date(reported)
  );

  const previous = { ICU: 0, 'Med/Surg': 0, total: 0 };
  results.forEach((value) => {
    categories.map((key) => {
      const currentPatientTotal = value[key].total;
      const previousPatientTotal = previous[key];
      const patienCountChange = currentPatientTotal - previousPatientTotal;
      const percentChange =
        previousPatientTotal === 0
          ? 0
          : Math.floor((patienCountChange / previousPatientTotal) * 100);

      value[key].percentChange = percentChange;
      previous[key] = value[key].total;
    });
  });

  res.json(results);
});

module.exports = router;
