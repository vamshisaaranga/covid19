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
 district(district_name, state_id, cases, cured, active, deaths)
 VALUES
 ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const addDistrict = await db.run(postDistrictQuery);
  response.send("District Successfully Added");
});
