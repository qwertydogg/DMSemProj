const mysql = require("mysql");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "38Vc49md",
  database: "contractormanagement",
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }

  console.log("Connected to DB.");

  // Select contractors with short or unhashed passwords (e.g., length < 30)
  const selectQuery = "SELECT ContractorID, Password FROM contractors WHERE LENGTH(Password) < 30";

  db.query(selectQuery, async (err, results) => {
    if (err) {
      console.error("Failed to fetch contractors:", err);
      db.end();
      return;
    }

    for (const contractor of results) {
      const { ContractorID, Password } = contractor;

      // Skip if password is NULL or empty
      if (!Password) continue;

      try {
        const hashed = await bcrypt.hash(Password, saltRounds);

        const updateQuery = "UPDATE contractors SET Password = ? WHERE ContractorID = ?";
        db.query(updateQuery, [hashed, ContractorID], (err) => {
          if (err) {
            console.error(`Failed to update ContractorID ${ContractorID}:`, err);
          } else {
            console.log(`ContractorID ${ContractorID} password hashed.`);
          }
        });
      } catch (hashErr) {
        console.error(`Hash error for ContractorID ${ContractorID}:`, hashErr);
      }
    }

    db.end();
  });
});
