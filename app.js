const express = require("express");
const app = express();
let db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());

const initializationDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("SERVER IS RUNNING ON http://3000/");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
    process.exit(1);
  }
};
initializationDB();

// GET ALL STATES
app.get("/states/", async (request, response) => {
  const getAllStateQuery = `
    SELECT
    *
    FROM
    state
    ORDER BY 
    state_id ASC;`;
  const getStates = await db.all(getAllStateQuery);
  response.send(
    getStates.map((eachState) => ({
      stateId: eachState.state_id,
      stateName: eachState.state_name,
      population: eachState.population,
    }))
  );
});

//getStateByStateId

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT
    *
    FROM
    state
    WHERE
    state_id = ${stateId};`;
  const getState = await db.get(getStateQuery);
  response.send({
    stateId: getState.state_id,
    stateName: getState.state_name,
    population: getState.population,
  });
});

//Post district

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const postDistrictQuery = `
INSERT INTO
 district (district_name, state_id, cases, cured, active, deaths)
 VALUES
 ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const addDistrict = await db.run(postDistrictQuery);
  response.send("District Successfully Added");
});

//getDistrict
app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
    SELECT 
    *
    FROM
    district
    WHERE
    district_id = ${districtId};`;
  const districtDetails = await db.get(getDistrict);
  response.send({
    districtId: districtDetails.district_id,
    districtName: districtDetails.district_name,
    stateId: districtDetails.state_id,
    cases: districtDetails.cases,
    cured: districtDetails.cured,
    active: districtDetails.active,
    deaths: districtDetails.deaths,
  });
});

//delete

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `
  DELETE FROM
  district 
  WHERE
  district_id = ${districtId};`;
  const deleteDistrict = await db.run(deleteQuery);
  response.send("District Removed");
});

//put

app.put("/districts/:district_Id/", async (request, response) => {
  const { district_Id } = request.params;
  const updateDetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = updateDetails;
  const updateQuery = `
  UPDATE
  district
  SET
  district_name = '${districtName}',
  state_id = ${stateId},
  cases = ${cases},
  cured = ${cured},
  active = ${active},
  deaths = ${deaths}
  WHERE
  district_id = ${district_Id};`;
  await db.run(updateQuery);
  response.send("District Details Updated");
});
// GET GET

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
     SELECT
     SUM(cases) AS totalCases,
     SUM(cured) AS totalCured,
     SUM(active) AS totalActive,
     SUM(deaths) AS totalDeaths
     FROM
     district
     WHERE
     state_id = ${stateId};`;
  const statistics = await db.all(getStatsQuery);
  response.send(statistics);
});

//STATENAME AND DISTRICT

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
    SELECT
    state_name
    FROM
    district INNER JOIN state on state.state_id = district.state_id
    WHERE
    district.district_id = ${districtId};`;
  const stateName = await db.get(getStateNameQuery);
  response.send({
    stateName: stateName.state_name,
  });
});

module.exports = app;
