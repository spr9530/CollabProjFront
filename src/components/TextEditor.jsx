import React, { useState, useRef, useCallback, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import io from 'socket.io-client';
import { updateEditor } from '../roomSlice/RoomApi';
import { useParams } from 'react-router-dom';

// const socket = io('http://localhost:5000');

function TextEditor({ data }) {
    const { id1, id3 } = useParams();
    const [content, setContent] = useState(data || ''); // Initialize content with data prop or empty string
    const [isLocalChange, setIsLocalChange] = useState(false);
    const editorRef = useRef(null);

    // Handle local editor changes
    const handleChange = (newValue) => {
        setIsLocalChange(true);
        setContent(newValue);
    };

    // Emit content to server on local changes
    const debouncedEmit = useCallback(
        debounce((content) => {
            socket.emit('textEditor', { roomId: id1, editorId: id3, content });
        }, 300),
        [id1, id3]
    );

    // Debounce function for API update
    const debouncedUpdate = useCallback(
        debounce(async (info) => {
            await updateEditor(info);
        }, 500),
        []
    );

    // Effect to set initial content and establish socket connection
    useEffect(() => {
        setContent(data || '');
        socket.emit('connectEditor', id3);
        return () => {
            socket.disconnect();
        };
    }, [id3, data]);

    // Effect to handle incoming textEditor events from socket
    useEffect(() => {
        const handleTextEditor = ({ roomId, editorId, content }) => {
            if (roomId === id1 && editorId === id3) {
                setIsLocalChange(false);
                setContent(content);
            }
        };

        socket.on('textEditor', handleTextEditor);

        return () => {
            socket.off('textEditor', handleTextEditor);
        };
    }, [id1, id3]);

    // Debounced effects to handle content changes
    useEffect(() => {
        if (isLocalChange) {
            debouncedEmit(content);
            debouncedUpdate({ id3, roomData: content });
        }
    }, [content, debouncedEmit, debouncedUpdate]);

    return (
        <div className='h-screen w-screen bg-secondaryBackground'>
            <div className='h-full w-full p-4 relative overflow-y-scroll scrollbar-none'>
                <div className='flex w-full h-full overflow-scroll scrollbar-none'>
                    <JoditEditor
                        ref={editorRef}
                        value={content}
                        tabIndex={1}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default TextEditor;

// Debounce function utility
const debounce = (func, delay) => {
    let timerId;
    return function (...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};
