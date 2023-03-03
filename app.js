const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
let db = null;
const convertObjectIntoDistrict = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
const convertObjectIntoState = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const InitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB error:${e}`);
    process.exit(1);
  }
};

app.get("/states/", async (request, response) => {
  const getQuery = `SELECT * FROM 
    state;`;
  const stateDetails = await db.all(getQuery);
  response.send(
    stateDetails.map((eachObject) => convertObjectIntoState(eachObject))
  );
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT * FROM state 
    WHERE state_id=${stateId};`;
  const stateDetail = await db.get(getQuery);
  response.send(convertObjectIntoState(stateDetail));
});
app.post("/districts/", async (request, response) => {
  const districtDetail = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetail;
  const postQuery = `INSERT INTO district 
    (district_name,state_id,cases,cured,active,deaths) 
    VALUES("${districtName}",${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(postQuery);
  response.send("District Successfully Added");
});
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT * FROM district 
    WHERE district_id=${districtId};`;
  const districtDetail = await db.get(getQuery);
  response.send(convertObjectIntoDistrict(districtDetail));
});
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district 
    WHERE district_id=${districtId};`;
  await db.run(deleteQuery);
  response.send("District Removed");
});
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const putQuery = `UPDATE district 
    SET district_name="${districtName}",
    state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths};`;
  await db.run(putQuery);
  response.send("District Details Updated");
});
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) 
    FROM district 
    WHERE state_id=${stateId};`;
  const stats = await db.get(getQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
SELECT  state_id FROM district
 WHERE district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
SELECT state_name AS stateName FROM state
 WHERE state_id = ${getDistrictIdQueryResponse.state_id};`;
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

InitializeDBAndServer();
module.exports = app;
