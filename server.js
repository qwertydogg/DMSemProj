const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require("bcrypt");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const saltRounds = 10;

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '38Vc49md',
    database: 'contractormanagement'
});

// signup route
app.post("/signup", (req, res) => {
    const { category, name, email, password, contact, address } = req.body;

    if (!category || !name || !email || !password || !contact || !address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const table = category === "contractor" ? "contractors" : "clients";

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: "Password encryption failed" });
        }

        const sql = `INSERT INTO ${table} (Name, Email, Password, Contact, Address) VALUES (?, ?, ?, ?, ?)`;

        db.query(sql, [name, email, hashedPassword, contact, address], (err, result) => {
            if (err) {
                console.error("Error during signup:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: "Signup failed" });
            }

            return res.json({ success: true, userId: result.insertId });
        });
    });
});

// login route
app.post('/login', (req, res) => {
    const { category, email, password } = req.body;

    let table = category === 'contractor' ? 'contractors' : 'clients';

    const sql = `SELECT * FROM ${table} WHERE Email = ?`;

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Error fetching data from database:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (data.length > 0) {
            const user = data[0];

            bcrypt.compare(password, user.Password, (err, result) => {
                if (err) {
                    console.error("Error comparing password:", err);
                    return res.status(500).json({ error: "Error comparing password" });
                }

                if (result) {
                    if (category === 'client') {
                        return res.json({
                            success: true,
                            user: {
                                id: user.ClientID,
                                name: user.Name,
                                email: user.Email,
                                clientId: user.ClientID,
                                clientName: user.Name
                            }
                        });
                    }

                    return res.json({
                        success: true,
                        user: {
                            id: user.ContractorID,
                            name: user.Name,
                            email: user.Email,
                            contractorId: user.ContractorID
                        }
                    });
                } else {
                    return res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    });
});

app.get('/messages/:userType/:userId/:otherType/:otherId', (req, res) => {
    const { userType, userId, otherType, otherId } = req.params;
  
    let query = '';
    let values = [];
  
    if (userType === 'client' && otherType === 'contractor') {
      query = `
        SELECT * FROM messages
        WHERE 
          (SenderType = 'client' AND SenderID = ? AND ReceiverType = 'contractor' AND ReceiverID = ?)
          OR
          (SenderType = 'contractor' AND SenderID = ? AND ReceiverType = 'client' AND ReceiverClientID = ?)
        ORDER BY Timestamp ASC
      `;
      values = [userId, otherId, otherId, userId];
  
    } else if (userType === 'contractor' && otherType === 'client') {
      query = `
        SELECT * FROM messages
        WHERE 
          (SenderType = 'contractor' AND SenderID = ? AND ReceiverType = 'client' AND ReceiverClientID = ?)
          OR
          (SenderType = 'client' AND SenderID = ? AND ReceiverType = 'contractor' AND ReceiverID = ?)
        ORDER BY Timestamp ASC
      `;
      values = [userId, otherId, otherId, userId];
  
    } else {
      return res.status(400).json({ error: 'Invalid user/other type combination' });
    }
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Database error fetching messages:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
  
app.post('/messages', (req, res) => {
    const { senderId, receiverId, senderType, receiverType, messageText } = req.body;

    if (!senderId || !receiverId || !senderType || !receiverType || !messageText) {
        console.log('Missing required fields');
        return res.status(400).json({ error: "Missing required fields" });
    }

    const validTypes = ['client', 'contractor'];
    if (!validTypes.includes(senderType) || !validTypes.includes(receiverType)) {
        console.log('Invalid senderType or receiverType');
        return res.status(400).json({ error: "Invalid senderType or receiverType" });
    }

    // Checks if sender exists
    const senderTable = senderType === 'contractor' ? 'contractors' : 'clients';
    const receiverTable = receiverType === 'contractor' ? 'contractors' : 'clients';
    const senderIdField = senderType === 'contractor' ? 'ContractorID' : 'ClientID';
    const receiverIdField = receiverType === 'contractor' ? 'ContractorID' : 'ClientID';

    db.query(`SELECT * FROM ${senderTable} WHERE ${senderIdField} = ?`, [senderId], (err, senderResult) => {
        if (err) {
            console.error("Error checking senderId:", err);
            return res.status(500).json({ error: "Server error" });
        }

        if (senderResult.length === 0) {
            console.log(`Sender ID ${senderId} does not exist in ${senderTable}`);
            return res.status(400).json({ error: "Sender ID not found" });
        }

        // Checks if receiver exists
        db.query(`SELECT * FROM ${receiverTable} WHERE ${receiverIdField} = ?`, [receiverId], (err, receiverResult) => {
            if (err) {
                console.error("Error checking receiverId:", err);
                return res.status(500).json({ error: "Server error" });
            }

            if (receiverResult.length === 0) {
                console.log(`Receiver ID ${receiverId} does not exist in ${receiverTable}`);
                return res.status(400).json({ error: "Receiver ID not found" });
            }

            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // Determine which receiver field to use (ReceiverID for contractors, ReceiverClientID for clients)
            const receiverField = receiverType === 'contractor' ? 'ReceiverID' : 'ReceiverClientID';
            const receiverValue = receiverType === 'contractor' ? receiverId : receiverId;

            // Insert the message into the database
            const query = `
                INSERT INTO messages (SenderID, ${receiverField}, SenderType, ReceiverType, MessageText, Timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [senderId, receiverValue, senderType, receiverType, messageText, timestamp], (err, result) => {
                if (err) {
                    console.error("Error inserting message:", err);
                    return res.status(500).json({ error: "Error inserting message into database" });
                }

                console.log("Message inserted:", result);
                res.status(200).json({ message: "Message sent successfully" });
            });
        });
    });
});


// list of clients
app.get("/clients", (req, res) => {
    const sql = "SELECT * FROM clients";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching clients:", err);
            return res.status(500).json({ error: "Failed to fetch clients" });
        }
        res.json(result);
    });
});

app.post("/projects", (req, res) => {
    const {
      ProjectName,
      ClientID,
      ContractorID,
      StartDate,
      EndDate,
      Budget,
      Status,
    } = req.body;

    const sql = 
      `INSERT INTO projects 
      (Name, ClientID, ContractorID, StartDate, EndDate, Budget, Status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [ProjectName, ClientID, ContractorID, StartDate, EndDate, Budget, Status],
      (err, result) => {
        if (err) {
          console.error("Error inserting project:", err);
          return res.status(500).json({ error: "Database insert failed" });
        }

        const newProject = {
          ProjectID: result.insertId,
          ProjectName,
          ClientID,
          ContractorID,
          StartDate,
          EndDate,
          Budget,
          Status,
        };

        res.json(newProject);
      }
    );
});
  
// Gets next available ClientID
app.get("/clients/next-id", (req, res) => {
    const sql = "SELECT MAX(ClientID) AS maxId FROM clients";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching next ClientID:", err);
            return res.status(500).json({ error: "Failed to get next ClientID" });
        }
        const nextId = (result[0].maxId || 0) + 1;
        res.json({ nextClientId: nextId });
    });
});

// Projects for a client
app.get("/client-projects/:clientId", (req, res) => {
    const clientId = req.params.clientId;
    const sql = 
        `SELECT p.ProjectID, p.Name AS ProjectName, p.StartDate, p.EndDate, p.Budget, p.Status,
               c.Name AS ContractorName, c.ContractorID, cl.Name AS ClientName
        FROM projects p
        JOIN contractors c ON p.ContractorID = c.ContractorID
        JOIN clients cl ON p.ClientID = cl.ClientID
        WHERE p.ClientID = ?`;

    db.query(sql, [clientId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: "Failed to fetch projects", details: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "No projects found for this client" });
        }

        res.json(result);
    });
});

// Get a specific client by ID
app.get("/clients/:id", (req, res) => {
    const clientId = req.params.id;

    const sql = "SELECT * FROM clients WHERE ClientID = ?";

    db.query(sql, [clientId], (err, result) => {
        if (err) {
            console.error("Error fetching client by ID:", err);
            return res.status(500).json({ error: "Failed to fetch client" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Client not found" });
        }

        res.json(result[0]);
    });
});

// Projects for a contractor
app.get("/contractor-projects/:contractorId", (req, res) => {
    const contractorId = req.params.contractorId;

    const sql = 
        `SELECT 
            p.ProjectID,
            p.Name AS ProjectName,
            p.StartDate,
            p.EndDate,
            p.Budget,
            p.Status,
            c.Name AS ClientName,
            c.ClientID
        FROM projects p
        JOIN clients c ON p.ClientID = c.ClientID
        WHERE p.ContractorID = ?`;

    db.query(sql, [contractorId], (err, result) => {
        if (err) {
            console.error("Error fetching contractor projects:", err);
            return res.status(500).json({ error: "Failed to fetch contractor projects" });
        }

        res.json(result);
    });
});

// Start server
app.listen(8081, () => {
    console.log("Server is running on port 8081");
});
