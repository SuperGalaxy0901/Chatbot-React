import { Box, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import { v4 as uuidv4 } from "uuid";
import SingleChatBox from "../components/SingleChatbox";

const name = "Jack Bear"; // this is static name for now

const Chat = () => {
    const { tenant_id } = useParams();  // Extract tenant_id and session_id from URL
    const [text, setText] = useState("");
    const [isFecthing, setIsFetching] = useState(false);
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null); // State for session ID
    const chatContainerRef = useRef(null);

    // This useEffect will only run once when the component is mounted
    useEffect(() => {
        // Generate a new UUID and set it as session ID
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
    }, []);

    const sendChatRequest = (messages) => {
        // Clear the text input and set fetching state
        setText("");
        setIsFetching(true);

        // Add initial typing status
        const newMessage = {
            role: "assistant",
            content: "",
            isTyping: true,
            isError: false,
        };
        setMessages([
            ...messages,
            newMessage,
        ]);

        // Fetch with readable stream
        fetch(import.meta.env.VITE_API_URL + "/research/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: text,
                session_id: sessionId,
                tenant_id: tenant_id,
                target_audience: "",
                specific_information: "",
                tone: ""
            })
        })
            .then(async (response) => {
                if (!response.ok) {
                    const result = await response.json();
                    alert(result.detail);
                    setMessages([
                        ...messages,
                        newMessage,
                        {
                            role: "assistant",
                            content: result.detail,
                            isTyping: false,
                            isError: false,
                        },
                    ]);
                    setIsFetching(false);
                    throw new Error("Network response was not ok");
                }

                const reader = response.body.getReader();
                let responseMsg = '';

                return new ReadableStream({
                    start(controller) {
                        function push() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    setIsFetching(false);
                                    controller.close();
                                    setMessages((prevMessages) => [
                                        ...prevMessages.slice(0, -1),
                                        {
                                            role: "assistant",
                                            content: responseMsg,
                                            isTyping: false,
                                            isError: false,
                                        },
                                    ]);
                                    return;
                                }

                                try {
                                    const decoder = new TextDecoder();
                                    const valueAsString = decoder.decode(value);
                                    console.log(valueAsString)
                                    responseMsg += valueAsString;

                                    setMessages((prevMessages) => [
                                        ...prevMessages.slice(0, -1),
                                        {
                                            role: "assistant",
                                            content: responseMsg,
                                            isTyping: false,
                                            isError: false,
                                        },
                                    ]);

                                    controller.enqueue(value);
                                } catch (e) {
                                    console.error(e);
                                }

                                push();
                            });
                        }

                        push();
                    },
                });
            })
            .then((stream) => new Response(stream))
            .then((response) => response.text())
            .catch((error) => {
                setMessages([
                    ...messages,
                    newMessage,
                    {
                        role: "assistant",
                        content: "Sorry, but something went wrong. Please try again.",
                        isTyping: false,
                        isError: true,
                    },
                ]);
                console.error(error);

                // Reset the fetching state in case of error
                setIsFetching(false);
            });
    };

    // event for text input value change
    const handleChangeText = (e) => {
        const value = e.target.value;
        if (value.length <= 512) {
            setText(e.target.value);
        }
    };

    // key up event for text input
    const handleEnterPress = (event) => {
        // Check if the Enter key was pressed
        if (event.key === "Enter" && !event.shiftKey) {
            handleSendText();
            event.preventDefault();
        }
    };

    // send button click event
    const handleSendText = () => {
        sendChatRequest([
            ...messages,
            {
                role: "user",
                content: text,
            },
        ]);
    };

    // Effect to scroll to the bottom of the chat container
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            <Box
                maxHeight="90vh"
                sx={{
                    overflowY: ["visible", "visible", "auto"],
                    "&::-webkit-scrollbar": {
                        width: "3px",
                        background: "#2949AB40",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgb(41, 73, 171)",
                    },
                }}
                ref={chatContainerRef}
            >
                <Box
                    px={[1, 1, 2]}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    bgcolor="rgb(21, 28, 44)"
                    pt={4}
                    pb={14}
                >
                    {messages.map((item, index) => {
                        return (
                            <SingleChatBox
                                key={index}
                                {...item}
                                name={name}
                            />
                        );
                    })}
                </Box>
            </Box>

            <Box
                bgcolor="#190821"
                display="flex"
                py={2}
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{
                    position: "fixed",
                    bottom: 0,
                    width: "100%",
                }}
            >
                <Box ml={2} width="100%">
                    <TextField
                        size="small"
                        sx={{
                            background: "#7E839C40",
                            border: "none",
                            borderRadius: "25px",
                            width: "100%",
                            "& fieldset": { border: "none" },
                            "& .MuiInputBase-input": {
                                color: "#FFF",
                                fontWeight: 600
                            }
                        }}
                        multiline={true}
                        disabled={isFecthing}
                        value={text}
                        onKeyDown={handleEnterPress}
                        onChange={handleChangeText}
                    />
                </Box>
                <Box display="flex" justifyContent="flex-end" mx={3}>
                    <Box sx={{ cursor: "pointer" }} onClick={handleSendText}>
                        <SendIcon sx={{ color: "white", fontSize: "35px" }} />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Chat;
