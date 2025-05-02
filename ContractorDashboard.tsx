import { useState, useEffect } from "react";
import axios from "axios";
import MessageThread from "../MessageThread";

interface Project {
  ProjectID: number;
  ProjectName: string;
  ClientID: number;
  ContractorID: number;
  StartDate: string;
  EndDate: string;
  Budget: number;
  Status: string;
  ClientName: string;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const ContractorDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string>("");
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    null
  );
  const [messageThread, setMessageThread] = useState<number | null>(null); // Track message thread visibility
  const [receiverId, setReceiverId] = useState<number | null>(null);

  const [newProjectFormVisible, setNewProjectFormVisible] = useState(false);
  const [newProject, setNewProject] = useState({
    ProjectName: "",
    ClientName: "",
    StartDate: "",
    EndDate: "",
    Budget: 0,
    Status: "",
  });
  const [clientID, setClientID] = useState<number | null>(null);

  // Replace with actual contractor ID from login/session
  const contractorId = 1;

  useEffect(() => {
    axios
      .get(`http://localhost:8081/contractor-projects/${contractorId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          setError("No projects found.");
        }
      })
      .catch((error) => {
        setError("Error fetching projects: " + error.message);
        console.error("Error fetching projects:", error);
      });
  }, []);

  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitNewProject = () => {
    // Check if client already exists by client name
    axios
      .get(`http://localhost:8081/clients/check-name`, {
        params: { clientName: newProject.ClientName },
      })
      .then((response) => {
        if (response.data.clientId) {
          // If client exists, use existing ClientID
          setClientID(response.data.clientId);
          createProject(response.data.clientId);
        } else {
          // If client does not exist, fetch next available ClientID
          axios
            .get(`http://localhost:8081/clients/next-id`)
            .then((nextIdResponse) => {
              const nextClientId = nextIdResponse.data.nextClientId;
              setClientID(nextClientId);
              createProject(nextClientId);
            })
            .catch((error) => {
              setError(
                "Error fetching next available client ID: " + error.message
              );
              console.error("Error fetching next available client ID:", error);
            });
        }
      })
      .catch((error) => {
        setError("Error checking client name: " + error.message);
        console.error("Error checking client name:", error);
      });
  };

  const createProject = (clientId: number) => {
    axios
      .post("http://localhost:8081/projects", {
        ...newProject,
        ClientID: clientId,
        ContractorID: contractorId,
      })
      .then((response) => {
        setProjects((prev) => [...prev, response.data]);
        setNewProjectFormVisible(false); // Close the form after successful submission
      })
      .catch((error) => {
        setError("Error adding project: " + error.message);
        console.error("Error adding project:", error);
      });
  };

  const toggleMessageThread = (clientId: number, projectId: number) => {
    setReceiverId(clientId);
    setMessageThread(messageThread === projectId ? null : projectId); // Toggle message thread visibility
  };

  return (
    <div>
      <h1>Projects for Contractor Mark Weiss</h1>

      <button onClick={() => setNewProjectFormVisible(true)}>
        Create New Project
      </button>

      {newProjectFormVisible && (
        <div
          style={{ margin: "20px", border: "1px solid #ccc", padding: "1rem" }}
        >
          <h3>New Project</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label>Project Name</label>
              <input
                type="text"
                name="ProjectName"
                value={newProject.ProjectName}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <div>
              <label>Client Name</label>
              <input
                type="text"
                name="ClientName"
                value={newProject.ClientName}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="StartDate"
                value={newProject.StartDate}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="EndDate"
                value={newProject.EndDate}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <div>
              <label>Budget</label>
              <input
                type="number"
                name="Budget"
                value={newProject.Budget}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <div>
              <label>Status</label>
              <input
                type="text"
                name="Status"
                value={newProject.Status}
                onChange={handleNewProjectChange}
                required
              />
            </div>
            <button type="button" onClick={handleSubmitNewProject}>
              Submit
            </button>
            <button
              type="button"
              onClick={() => setNewProjectFormVisible(false)}
              style={{ marginLeft: "1rem" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {error && <p>{error}</p>}
      {!error && projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project.ProjectID} style={{ marginBottom: "1rem" }}>
          <button
            onClick={() =>
              setExpandedProjectId(
                expandedProjectId === project.ProjectID
                  ? null
                  : project.ProjectID
              )
            }
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              fontSize: "1.1rem",
              textDecoration: "underline",
              padding: "0.5rem 0",
            }}
          >
            {project.ProjectName}
          </button>
          <button
            onClick={() =>
              toggleMessageThread(project.ClientID, project.ProjectID)
            }
          >
            {messageThread === project.ProjectID
              ? "Close Message"
              : "Message Client"}
          </button>

          {expandedProjectId === project.ProjectID && (
            <table style={{ width: "100%", borderSpacing: "0.5rem" }}>
              <tbody>
                <tr>
                  <td>
                    <strong>Client Name:</strong>
                  </td>
                  <td>{project.ClientName || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Start Date:</strong>
                  </td>
                  <td>{formatDate(project.StartDate)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>End Date:</strong>
                  </td>
                  <td>{formatDate(project.EndDate)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Budget:</strong>
                  </td>
                  <td>${project.Budget.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Status:</strong>
                  </td>
                  <td>{project.Status}</td>
                </tr>
              </tbody>
            </table>
          )}

          {messageThread === project.ProjectID &&
            receiverId !== null &&
            contractorId && (
              <MessageThread
                senderId={contractorId}
                senderType="contractor"
                receiverType="client"
                receiverId={receiverId}
              />
            )}
        </div>
      ))}
    </div>
  );
};

export default ContractorDashboard;
