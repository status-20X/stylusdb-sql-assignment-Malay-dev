function parseQuery(query) {
  query = query.trim();
  const groupBySplit = query.split(/\sGROUP BY\s/i);
  const queryWithoutGroupBy = groupBySplit[0]; // Everything before GROUP BY clause
  let groupByFields =
    groupBySplit.length > 1
      ? groupBySplit[1]
          .trim()
          .split(",")
          .map((field) => field.trim())
      : null;
  const whereSplit = queryWithoutGroupBy.split(/\sWHERE\s/i);
  const queryWithoutWhere = whereSplit[0]; // Everything before WHERE clause
  const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;
  const joinSplit = queryWithoutWhere.split(/\s(INNER|LEFT|RIGHT) JOIN\s/i);
  const selectPart = joinSplit[0].trim(); // Everything before JOIN clause
  const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
  const selectMatch = selectPart.match(selectRegex);
  if (!selectMatch) {
    throw new Error("Invalid SELECT format");
  }

  const [, fields, table] = selectMatch;
  const { joinType, joinTable, joinCondition } =
    parseJoinClause(queryWithoutWhere);
  let whereClauses = [];
  if (whereClause) {
    whereClauses = parseWhereClause(whereClause);
  }
  const aggregateFunctionRegex =
    /(\bCOUNT\b|\bAVG\b|\bSUM\b|\bMIN\b|\bMAX\b)\s*\(\s*(\*|\w+)\s*\)/i;
  const hasAggregateWithoutGroupBy =
    aggregateFunctionRegex.test(query) && !groupByFields;

  return {
    fields: fields.split(",").map((field) => field.trim()),
    table: table.trim(),
    whereClauses,
    joinType,
    joinTable,
    joinCondition,
    groupByFields,
    hasAggregateWithoutGroupBy,
  };
}

function parseWhereClause(whereString) {
  const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
  return whereString.split(/ AND | OR /i).map((conditionString) => {
    const match = conditionString.match(conditionRegex);
    if (match) {
      const [, field, operator, value] = match;
      return { field: field.trim(), operator, value: value.trim() };
    }
    throw new Error("Invalid WHERE clause format");
  });
}

function parseJoinClause(query) {
  const joinRegex =
    /\s(INNER|LEFT|RIGHT) JOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
  const joinMatch = query.match(joinRegex);

  if (joinMatch) {
    return {
      joinType: joinMatch[1].trim(),
      joinTable: joinMatch[2].trim(),
      joinCondition: {
        left: joinMatch[3].trim(),
        right: joinMatch[4].trim(),
      },
    };
  }

  return {
    joinType: null,
    joinTable: null,
    joinCondition: null,
  };
}

module.exports = { parseQuery, parseJoinClause };
