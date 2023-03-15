const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

let convertSnakeCaseToCamelCase = (newObject) => {
  return {
    playerId: newObject.player_id,
    playerName: newObject.player_name,
    jerseyNumber: newObject.jersey_number,
    role: newObject.role,
  };
};

const initializeCricketDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error ${e.message}`);
    process.exit(1);
  }
};

initializeCricketDBAndServer();

//Get Players List
app.get("/players/", async (request, response) => {
  const getPlayersList = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;`;
  const playersList = await db.all(getPlayersList);
  const result = playersList.map((newObject) => {
    return convertSnakeCaseToCamelCase(newObject);
  });
  console.log(result);
  response.send(result);
});

// Add a Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  await db.run(addPlayer);
  response.send("Player Added to Team");
});

//GET A Player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  const result = convertSnakeCaseToCamelCase(player);
  response.send(result);
});

// Update Player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = getPlayerDetails;
  const updateDetails = `
        UPDATE cricket_team
        SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE player_id = ${playerId}`;

  await db.run(updateDetails);
  response.send("Player Details Updated");
});

// Delete a Player From Table
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
    cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
