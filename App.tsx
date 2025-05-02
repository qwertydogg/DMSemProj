import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ListGroup from "./components/ListGroup";
import Login from "./login";
import ClientDashboard from "./pages/ClientDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import Signup from "./pages/Signup";
import "./App.css";
import MessageThread from "./MessageThread";

interface Client {
  ClientID: number;
  Name: string;
  Email: string;
  Contact: string;
  Address: string;
}

function App() {
  const [clients, setClients] = useState<Client[]>([]);

  // Fetch the client data when the component mounts
  useEffect(() => {
    fetch("http://localhost:8081/clients")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch clients.");
        return res.json();
      })
      .then((data) => setClients(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/clients"
          element={
            <div>
              <ListGroup
                items={[
                  "New York",
                  "San Francisco",
                  "Tokyo",
                  "London",
                  "Paris",
                ]}
                heading="Cities"
                onSelectItem={(item) => console.log(item)}
              />
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>{" "}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.ClientID}>
                      <td>{client.ClientID}</td>
                      <td>{client.Name}</td>
                      <td>{client.Email}</td>
                      <td>{client.Contact}</td>
                      <td>
                        <Link
                          to={`/client-dashboard/${client.ClientID}`} // Link to client dashboard page
                          state={{ clientName: client.Name }} // Pass client name through state
                        >
                          View Dashboard
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
        <Route
          path="/client-dashboard/:clientId" // Dynamic route for client dashboard
          element={<ClientDashboard />}
        />
        <Route
          path="/contractor-dashboard/:contractorId"
          element={<ContractorDashboard />}
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
