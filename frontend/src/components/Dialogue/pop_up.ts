import { useState, useEffect } from "react";
import { Dialogue } from "./types"; 

interface DialoguePopupProps {
    dialogue: Dialogue;
    onClose: () => void;
}
/*
// Not sure how to switch between character dialogues, so it is just on a timer to run through every message
// tailwindcss being finicky and doesn't want to work, so unsure if code works
export function DialoguePopup({ dialogue, onClose }: DialoguePopupProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const { character, history, color } = dialogue;
    const currentMessage = history[messageIndex];

    useEffect(() => {
        // Automatically move to the next message every 2 seconds
        if (messageIndex < history.length - 1) {
            const timer = setTimeout(() => {
                setMessageIndex(messageIndex + 1);
            }, 2000);                             // Wait 2 seconds before moving to the next message
            return () => clearTimeout(timer);     // Clean up the timer if the component unmounts
        } else {
            // Close the text box after the last message
            const closeTimer = setTimeout(
              () => {
                onClose();
            }, 1000);                                    // Wait 1 second after the last message before closing; not sure how to wait for player response
            return () => clearTimeout(closeTimer);
        }
    }, [messageIndex, history.length, onClose]);

    return (
        <div className="flex justify-center items-start mt-4">
            <div 
                className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md" 
                style={{ borderColor: color, borderWidth: 2 }}
            >
                <h2 className="font-bold" style={{ color }}>{character.name}</h2>
                <p className="mt-2">{currentMessage.content}</p>
            </div>
        </div>
    );
}
*/
