import { useEffect, useState } from "react";
import ListGroup from "./components/ListGroup";
interface Client {
  ClientID: number;
  Name: string;
  Email: string;
  Contact: string;
  Address: string;
}

function App() {
  const [clients, setClients] = useState<Client[]>([]); // Use the updated Client interface
  useEffect(() => {
    fetch("http://localhost:8081/clients")
      .then((res) => res.json())
      .then((data) => setClients(data)) // Store the fetched data
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <ListGroup
        items={["New York", "San Francisco", "Tokyo", "London", "Paris"]}
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
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.ClientID}>
              <td>{client.ClientID}</td>
              <td>{client.Name}</td>
              <td>{client.Email}</td>
              <td>{client.Contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
