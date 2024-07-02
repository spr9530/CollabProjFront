import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs';
import { useDispatch } from 'react-redux';

function WhiteBoard({socket}) {

    const canvas = useRef(null)
    const [tool, setTool] = useState('pencil')
    const [elements, setElements] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false)
    const [history, setHistory] = useState([])
    const [future, setFuture] = useState([]);


    useEffect(()=>{
        socket.on('whiteBoard', (data)=>{
            setElements(data)
        })
    }, [elements])

    function debounce(func, delay) {
        let timerId;
        return function(...args) {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    const debounceEmit = useCallback(debounce((elements)=>{
        socket.emit('whiteBoard', elements);
    }, 300), [socket]);



    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent

        
        let newElement;
        if (tool === 'pencil') {
            newElement = {
                type: 'pencil',
                offsetX,
                offsetY,
                path: [[offsetX, offsetY]],
                stroke: 'white',
            };
        } else if (tool === 'line') {
            newElement = {
                type: 'line',
                offsetX,
                offsetY,
                height: offsetY,
                width: offsetX,
                stroke: 'white',
            };
        } else if (tool === 'rectangle') {
            newElement = {
                type: 'rectangle',
                offsetX,
                offsetY,
                height: 0,
                width: 0,
                stroke: 'white',
            };
        } else if (tool === 'circle') {
            newElement = {
                type: 'circle',
                offsetX,
                offsetY,
                endX: 0,
                endY: 0,
                stroke: 'white',
            };
        } else if (tool === 'text') {
            const text = prompt('Enter text:'); // Prompt for text input
            if (text !== null) { // If user didn't cancel
                newElement = {
                    type: 'text',
                    text,
                    x: offsetX,
                    y: offsetY,
                    fill: 'white',
                    font: '16px Arial', // Default font style
                }
            }
            return; // Return early
        }



        // Add the new element to the elements state
        setElements(prevElements => [...prevElements, newElement]);

        setIsDrawing(true);
    }

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent
        if (isDrawing) {
            if (tool === 'pencil') {
                const { path } = elements[elements.length - 1]
                const newPath = [...path, [offsetX, offsetY]]
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                path: newPath,
                            }
                        }
                        else {
                            return ele;
                        }
                    })
                )
            }
            else if (tool === 'line') {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                height: offsetY,
                                width: offsetX,
                            }
                        }
                        else {
                            return ele;
                        }
                    })
                )
            }

            else if (tool === 'rectangle') {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                height: offsetY - ele.offsetY,
                                width: offsetX - ele.offsetX,
                            }
                        }
                        else {
                            return ele;
                        }
                    })
                )
            }

            else if (tool === 'circle') {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                endX: offsetY - ele.offsetY,
                                endY: offsetX - ele.offsetX,
                            }
                        }
                        else {
                            return ele;
                        }
                    })
                )
            }
            else if (tool === 'text') {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === elements.length - 1) {
                            return {
                                ...ele,
                                endX: offsetY - ele.offsetY,
                                endY: offsetX - ele.offsetX,
                            }
                        }
                        else {
                            return ele;
                        }
                    })
                )
            }
        }
    }

    const handleMouseUp = (e) => {
        setIsDrawing(false)
    }

    const handleChange = (e) => {
        setTool(e.target.id)
    }

    useEffect(() => {
        const canvasElement = canvas.current

        const canvasContext = canvasElement.getContext('2d');

        canvasElement.width = window.innerHeight * 2;
        canvasElement.height = window.innerHeight * 2;


        canvasContext.fillStyle = '#1e293b';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }, [])

    const dispatch = useDispatch()
    useEffect(() => {
        const roughCanvas = rough.canvas(canvas.current);
        const canvasBoard = canvas.current;
        const ctx = canvasBoard.getContext('2d');

        ctx.clearRect(0, 0, canvasBoard.width, canvasBoard.height);

        elements.forEach((ele) => {
            if (ele.type === 'pencil') {
                roughCanvas.linearPath(ele.path, { roughness: 0, stroke: 'white' });
            }
            else if (ele.type === 'line') {
                roughCanvas.line(ele.offsetX, ele.offsetY, ele.width, ele.height, { roughness: 0, stroke: 'white' });
            }
            else if (ele.type === 'rectangle') {
                roughCanvas.rectangle(ele.offsetX, ele.offsetY, ele.width, ele.height, { roughness: 0, stroke: 'white' });
            }
            else if (ele.type === 'circle') {
                roughCanvas.circle(ele.offsetX, ele.offsetY, ele.endY, { roughness: 0, stroke: 'white' });
            }
        });

        debounceEmit(elements)
    }, [elements]);

    const handleTouchStart = (e) => {
        const { pageX, pageY } = e.touches[0];
        handleMouseDown({ nativeEvent: { offsetX: pageX, offsetY: pageY } });
    };

    const handleTouchMove = (e) => {
        const { pageX, pageY } = e.touches[0];
        handleMouseMove({ nativeEvent: { offsetX: pageX, offsetY: pageY } });
    };

    const handleTouchEnd = (e) => {
        handleMouseUp();
    };

    const handleUndo = () => {
        if (elements.length > 0) {
            const lastElement = elements[elements.length - 1];
            setHistory([...history, lastElement]);
            setElements(elements.slice(0, -1));
        }
    };

    const handleRedo = () => {
        if (history.length > 0) {
            const lastAction = history[history.length - 1];
            setElements([...elements, lastAction]);
            setFuture(future.slice(0, -1));
            setHistory(history.slice(0, -1));
        }
    };

    const handleClear = () => {
        const canvasBoard = canvas.current;
        const ctx = canvasBoard.getContext('2d');
        ctx.fillRect = '#1e293b'
        ctx.clearRect(0, 0, canvasBoard.width, canvasBoard.height);
        setElements([])
    }

    return (
        <div
            className='h-full w-full bg-white'
        >
            <div
                className='h-full w-full bg-slate-800 rounded-lg p-4 relative'
            >
                <div className='flex gap-3 justify-center'>
                    <button className='bg-red-400 text-white p-2 rounded-md z-30' onClick={handleClear}>Clear</button>
                    <h2 className='text-white text-center text-xl relative z-30'>Black Board</h2>
                    <button className='bg-slate-400 text-white p-2 rounded-md z-30' onClick={handleUndo}>Undo</button>
                    <button className='bg-slate-400 text-white p-2 rounded-md z-30' onClick={handleRedo}>Redo</button>

                </div>
                <div className='flex flex-col w-20 bg-slate-500 rounded-md relative z-40'>
                    <div className='p-2 w-full'>
                        <input type="radio" id='pencil' checked={tool === 'pencil'} onChange={(e) => console.log('ok')} onClick={(e) => handleChange(e)} name='tool' />
                        <label className='text-white text-sm flex' htmlFor="pencil">Pencil</label>
                    </div>
                    <div className='p-2 w-full'>
                        <input type="radio" id='line' checked={tool === 'line'} onChange={(e) => console.log('ok')} onClick={(e) => handleChange(e)} name='tool' />
                        <label className='text-white text-sm flex' htmlFor="line">Line</label>
                    </div>
                    <div className='p-2 w-full'>
                        <input type="radio" id='rectangle' checked={tool === 'rectangle'} onChange={(e) => console.log('ok')} onClick={(e) => handleChange(e)} name='tool' />
                        <label className='text-white text-sm flex' htmlFor="rectangle">Rectangle</label>
                    </div>
                    <div className='p-2 w-full'>
                        <input type="radio" id='circle' checked={tool === 'circle'} onChange={(e) => console.log('ok')} onClick={(e) => handleChange(e)} name='tool' />
                        <label className='text-white text-sm flex' htmlFor="circle">Circle</label>
                    </div>
                    <div className='p-2 w-full'>
                        <input type="radio" id='text' checked={tool === 'text'} onChange={(e) => console.log('ok')} onClick={(e) => handleChange(e)} name='tool' />
                        <label className='text-white text-sm flex' htmlFor="text">Text</label>
                    </div>
                </div>

                <div

                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className={`flex w-full h-full justify-center items-center absolute top-0 left-0 overflow-hidden ${tool === 'text' ? 'cursor-text' : 'cursor-default'} `}>
                    <canvas
                        ref={canvas}
                    />
                </div>

            </div>

        </div>
    )
}

export default WhiteBoard