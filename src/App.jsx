import "./App.css";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [userInput, setUserInput] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const [gptbody, setgptBody] = useState({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "Hello, I need help",
      },
      {
        role: "assistant",
        content: "Ofcourse,how can I help you today ",
      },
    ],
    stream: false,
  });

  useEffect(() => {
    const userCount = localStorage.getItem("user");
    if (!userCount) localStorage.setItem("user", 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userCount = parseInt(localStorage.getItem("user", 10));

    if (userCount >= 5) {
      setDisableInput(true);
      return;
    }

    localStorage.setItem("user", userCount + 1);

    // Add message to array of messages
    // when the user submits the form, we should add the submitted string to the messages array. Before adding it to the messages array, we need to transform it into an object. The role will always be user, and the userInput needs to be added under "content"
    const updatedMessages = [
      ...gptbody.messages,
      { role: "user", content: userInput },
    ];

    setgptBody((prev) => ({
      //Flag raised
      ...prev,
      messages: updatedMessages,
    }));

    console.log("GPT BODY INSIDE SUBMIT HANDLER: ", gptbody);

    //reset the user input
    setUserInput("");

    //send array of messages to gpt API

    try {
      const res = await fetch("http://localhost:5050/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          mode: "development",
          provider: "open-ai",
        },
        body: JSON.stringify({ ...gptbody, messages: updatedMessages }),
      });
      const data = await res.json();
      console.log(data);

      setgptBody((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: data.message.content },
        ],
      }));
    } catch (error) {
      console.log("Whoops!", error);
    }
    // add the received answer to the array of messages
  };

  return (
    <>
      <h1>ChatBot Correction</h1>
      {gptbody.messages.map((message, index) => (
        <div key={index} style={{ padding: "5px" }}>
          <p
            style={{
              color: message.role === "assistant" ? "red" : "blueviolet",
            }}
          >
            {message.role}
          </p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={disableInput}
        />
      </form>
    </>
  );
}

export default App;
