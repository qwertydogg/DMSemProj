import { useEffect, useState } from "react";
import axios from "axios";

interface Message {
  MessageID: number;
  SenderID: number;
  ReceiverID: number;
  ReceiverType: string;
  SenderType: string;
  MessageText: string;
  Timestamp: string;
}

function MessageThread({
  senderId,
  senderType,
  receiverId,
  receiverType, // New receiverType prop
}: {
  senderId: number;
  senderType: "client" | "contractor";
  receiverId: number;
  receiverType: "client" | "contractor"; // New receiverType prop
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for messages
  const [sending, setSending] = useState(false); // Sending state for message

  // Fetch messages when component mounts or when sender/receiver change
  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `http://localhost:8081/messages/${senderType}/${senderId}/${receiverType}/${receiverId}`
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error loading messages:", err))
      .finally(() => setLoading(false));
  }, [senderId, senderType, receiverId, receiverType]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent sending empty messages

    setSending(true);
    axios
      .post("http://localhost:8081/messages", {
        senderId,
        receiverId,
        senderType,
        receiverType, // Include receiverType when sending
        messageText: newMessage,
      })
      .then(() => {
        setNewMessage(""); // Clear message input
        // Optimistically update the messages (optional)
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            MessageID: Date.now(), // Temporary ID until new message is returned
            SenderID: senderId,
            ReceiverID: receiverId,
            SenderType: senderType,
            ReceiverType: receiverType, // Include receiverType in the message
            MessageText: newMessage,
            Timestamp: new Date().toISOString(),
          },
        ]);
        return axios.get(
          `http://localhost:8081/messages/${senderType}/${senderId}/${receiverType}/${receiverId}`
        );
      })
      .then((res) => setMessages(res.data)) // Refresh messages after sending
      .catch((err) => console.error("Error sending message:", err))
      .finally(() => setSending(false));
  };

  return (
    <div>
      <h2>Message Thread</h2>
      {loading && <p>Loading messages...</p>} {/* Loading state */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "1rem",
        }}
      >
        {messages.map((msg) => (
          <div key={msg.MessageID} style={{ marginBottom: "1rem" }}>
            <strong>{msg.SenderType === senderType ? "You" : "Them"}:</strong>
            <p>{msg.MessageText}</p>
            <small>{new Date(msg.Timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{ width: "100%", marginTop: "1rem" }}
        disabled={sending} // Disable textarea while sending
      />
      <button onClick={sendMessage} disabled={sending}>
        {sending ? "Sending..." : "Send"} {/* Show sending status */}
      </button>
    </div>
  );
}

export default MessageThread;
