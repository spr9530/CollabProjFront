import React, { useEffect, useState, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import { IoCloseCircle } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import { addNewVersion, updateEditor } from '../roomSlice/RoomApi';
import { triggerEditEvent } from '../socket/triggerEditor';

function CodeEditor({ pusher, data, version, versionHistory }) {
    const { id1, id2, id3 } = useParams();
    const [text, setText] = useState('');
    const [isLocalChange, setIsLocalChange] = useState(false);
    const [vHistoryVisible, setVHistoryVisible] = useState(false);
    const [oldVerVisible, setOldVerVisible] = useState(false);
    const [oldVerData, setOldVerData] = useState(null);
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        if (data) {
            setText(data);
        }
    }, [data, id3]);

    useEffect(() => {
        if (pusher && pusher.connection && pusher.connection.state === 'connected') {
            setSocketId(pusher.connection.socket_id);
        }
    }, [pusher]);

    useEffect(() => {
        if (!socketId) return;

        const editorChannel = pusher.subscribe(id3);
        editorChannel.bind('codeUpdated', (data) => {
            if (data.socketId !== socketId) {
                setText(data.message);
            }
        });

        return () => {
            editorChannel.unbind_all();
            editorChannel.unsubscribe();
        };
    }, [id3, pusher, socketId]);

    const debouncedEmit = useCallback((code) => {
        console.log(socketId)
        if (socketId) {
            triggerEditEvent({ channel: id3, event: 'codeUpdated', message: code, socketId });
        }
    }, [socketId, id3]);

    const debouncedUpdate = useCallback(async (info) => {
        await updateEditor(info);
    }, []);

    const handleChange = (newValue) => {
        setIsLocalChange(true);
        setText(newValue);
    };

    useEffect(() => {
        if (isLocalChange) {
            debouncedEmit(text);
            debouncedUpdate({ id3, roomData: text });
            setIsLocalChange(false);
        }
    }, [text, isLocalChange, debouncedEmit, debouncedUpdate]);

    const handleSave = async () => {
        const response = await addNewVersion({ id: id3, version, data: text });
        version = response; // Consider how to handle versioning logic correctly
    };

    const showOldVersion = (data) => {
        setOldVerVisible(true);
        setOldVerData(data);
        setVHistoryVisible(false);
    };

    return (
        <>
            {oldVerVisible && <HistoryCode setVisible={setOldVerVisible} data={oldVerData} />}
            <div className='h-full w-full bg-primaryBackground'>
                <div className='h-full w-full rounded-lg p-4 relative overflow-y-scroll scrollbar-none'>
                    <div className='flex gap-3 justify-center pb-3'>
                        <button className='bg-green-400 text-white p-1 px-5 rounded-md z-30'>Copy</button>
                        <h2 className='text-white text-center text-xl relative z-30'>Code Editor</h2>
                        <button className='bg-orange-400 text-white p-1 px-5 rounded-md z-30' onClick={handleSave}>New Version</button>
                        <div className='w-4/12 bg-secondaryBackground relative text-white '>
                            <div className='flex justify-between items-center p-2'>
                                <div className='cursor-pointer' onClick={() => setVHistoryVisible(!vHistoryVisible)}>
                                    Version History
                                </div>
                                <div>
                                    {vHistoryVisible ?
                                        <button onClick={() => setVHistoryVisible(false)}><IoCloseCircle /></button> :
                                        <button onClick={() => setVHistoryVisible(true)}><FaChevronDown /></button>
                                    }
                                </div>
                            </div>
                            <div className={`w-full flex flex-col absolute top-8 z-50 bg-secondaryBackground gap-2 p-2 ${vHistoryVisible ? 'visible' : 'hidden'} max-h-[70vh] overflow-scroll scrollbar-none`}>
                                {versionHistory.length > 0 && versionHistory.map((curr, index) => (
                                    <div key={index} className='w-full bg-primaryBackground rounded-md text-white p-3 cursor-pointer' onClick={() => showOldVersion(curr.data)}>
                                        <div>Version {curr.version}</div>
                                        <div>Date {curr.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <AceEditor
                            mode='javascript'
                            value={text}
                            theme='monokai'
                            onChange={handleChange}
                            editorProps={{ $blockScrolling: true }}
                            placeholder="Write Your Code"
                            name="UNIQUE_ID_OF_DIV"
                            style={{
                                width: '100%',
                                color: 'white',
                                minHeight: '100%',
                                paddingRight: '15px',
                                marginRight: '-15px',
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default CodeEditor;

function HistoryCode({ setVisible, data }) {
    return (
        <div className='w-screen h-screen absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-50'>
            <div className='w-[90vw] h-[90vh] bg-secondaryBackground p-6 overflow-scroll scrollbar-none rounded-md'>
                <button className='fixed text-white font-bold text-2xl z-50' onClick={() => setVisible(false)}><IoCloseCircle /></button>
                <div className='h-full w-full p-2 mt-6'>
                    <AceEditor
                        mode='javascript'
                        value={data || ''}
                        theme='monokai'
                        editorProps={{ $blockScrolling: true }}
                        placeholder="Write Your Code"
                        name="UNIQUE_ID_OF_DIV"
                        style={{
                            width: '100%',
                            color: 'white',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
