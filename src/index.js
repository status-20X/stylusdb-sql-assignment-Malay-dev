const parseQuery = require("./queryParser.js");
const readCSV = require("./csvReader.js");

async function executeSELECTQuery(query) {
  const { fields, table } = parseQuery(query);
  const data = await readCSV(`${table}.csv`);

  // Filter the fields based on the query
  return data.map((row) => {
    const filteredRow = {};
    fields.forEach((field) => {
      filteredRow[field] = row[field];
    });
    return filteredRow;
  });
}

module.exports = executeSELECTQuery;
