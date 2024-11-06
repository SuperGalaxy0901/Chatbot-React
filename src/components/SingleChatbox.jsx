import { Avatar, Box, Typography, IconButton } from "@mui/material";
import TypingIndicator from "./TypingIndicator";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useState } from "react";
import axios from "axios";

const arrowSize = "10px";
const arrowStyles = {
    position: "absolute",
    width: "0",
    height: "3px",
    borderTop: `${arrowSize} solid transparent`,
    borderBottom: `${arrowSize} solid transparent`,
    top: "15px",
};

const SingleChatBox = ({
    name,
    role,
    content,
    isTyping = false,
    isError = false,
}) => {
    const [audio, setAudio] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Function to fetch and save the audio file using Axios
    const fetchAndPlayAudio = async () => {
        setIsLoading(true);
        try {
            await axios.post(
                import.meta.env.VITE_API_URL + "/chat/generate-speech",
                {
                    text: content,
                    voice: role === "assistant" ? "alloy" : "nova", // this is static for now
                },
                { responseType: 'blob' }
            ).then(response => {
                const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
                const newAudio = new Audio(url);
                newAudio.play();
                setAudio(newAudio);
            }).catch(error => console.error("Error generating audio:", error));
        } catch (error) {
            console.error("Error fetching audio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayAudio = () => {
        if (audio) {
            audio.play();
        } else {
            fetchAndPlayAudio();
        }
    };

    return (
        <Box
            display="flex"
            gap={3}
            justifyContent={role === "user" ? "flex-end" : "flex-start"}
        >
            <Box
                width={["35px", "35px", "50px"]}
                height={["35px", "35px", "50px"]}
                borderRadius="50%"
                overflow="hidden"
                order={role === "user" ? 2 : 1}
            >
                {role === "assistant" ? (
                    <Avatar
                        sx={{ width: 58, height: 58 }}
                        alt="Avatar Image"
                    />
                ) : (
                    <Avatar sx={{ width: 46, height: 46 }} alt="Avatar Image" />
                )}
            </Box>
            <Box
                minWidth={["40%", "40%", "30%"]}
                maxWidth={["70%", "70%", "60%"]}
                order={role === "user" ? 1 : 2}
            >
                <Box display="flex" flexDirection="column" gap={2}>
                    {
                        <Box
                            bgcolor="#7E839C40"
                            borderRadius="10px"
                            p={2}
                            position="relative"
                        >
                            <Box
                                sx={
                                    role === "user"
                                        ? {
                                              ...arrowStyles,
                                              right: "-14px",
                                              borderLeft: `15px solid #7E839C40`,
                                          }
                                        : {
                                              ...arrowStyles,
                                              left: "-14px",
                                              borderRight: `15px solid #7E839C40`,
                                          }
                                }
                            />
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: ["20px", "20px", "24px"],
                                    color: "#FFF",
                                }}
                            >
                                {role === "user" ? "You" : name}
                            </Typography>
                            {isTyping && <TypingIndicator />}
                            {!isTyping && (
                                <Typography
                                    sx={{
                                        fontSize: ["18px", "18px", "22px"],
                                        whiteSpace: "pre-line",
                                        color: "#FFF",
                                    }}
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            )}
                            {/* Speaker Icon Button */}
                        </Box>
                    }
                </Box>
            </Box>
        </Box>
    );
};

export default SingleChatBox;
