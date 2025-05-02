import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import MessageThread from "../MessageThread";

interface Project {
  ProjectID: number;
  ProjectName: string;
  StartDate: string;
  EndDate: string;
  Budget: number;
  Status: string;
  ContractorName: string;
  ContractorID: number;
  ClientName: string;
}

function ClientDashboard() {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const clientName =
    (location.state as { clientName: string })?.clientName ??
    `Client ${clientId}`;

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string>("");
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(
    null
  );
  const [messageThread, setMessageThread] = useState<number | null>(null); // Track message thread visibility
  const [receiverId, setReceiverId] = useState<number | null>(null);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  console.log("Client ID:", clientId); // Log the clientId

  useEffect(() => {
    if (clientId) {
      axios
        .get(`http://localhost:8081/client-projects/${clientId}`)
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
    } else {
      setError("No client ID found.");
    }
  }, [clientId]);

  const toggleMessageThread = (contractorId: number, projectId: number) => {
    setReceiverId(contractorId);
    setMessageThread(messageThread === projectId ? null : projectId); // Toggle message thread visibility
  };

  return (
    <div>
      <h1>Projects for {clientName}</h1>
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
              toggleMessageThread(project.ContractorID, project.ProjectID)
            }
          >
            {messageThread === project.ProjectID
              ? "Close Message"
              : "Message Contractor"}
          </button>

          {expandedProjectId === project.ProjectID && (
            <table style={{ width: "100%", borderSpacing: "0.5rem" }}>
              <tbody>
                <tr>
                  <td>
                    <strong>Contractor:</strong>
                  </td>
                  <td>{project.ContractorName}</td>
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
            clientId && (
              <MessageThread
                senderId={parseInt(clientId)}
                senderType="client"
                receiverId={receiverId}
                receiverType="contractor" // Set receiverType automatically to "contractor"
              />
            )}
        </div>
      ))}
    </div>
  );
}

export default ClientDashboard;
