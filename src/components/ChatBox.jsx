import React from 'react'

function ChatBox() {
    return (
        <div className={`w-full md:w-4/12 h-full border-2 border-black rounded-md p-2 absolute right-1 ${chat}`}>
            <div className='w-full flex flex-col bg-primaryBackground p-2 rounded-md h-[95vh] relative'>

                <div className='absolute cursor-pointer' onClick={() => setChat('hidden')}><IoCloseCircle className='text-white text-2xl' /></div>
                <div className='w-full min-h-[84%] flex flex-col gap-2'>
                    {
                        messages && messages.map((message) => (
                            message.sender === 'local' ?
                                <div className='relative text-white w-full gap-2 flex justify-end'>
                                    <div className='bg-green-600 rounded-lg w-8/12 p-1'>
                                        {message.message}
                                    </div>
                                </div>
                                :
                                <div className='relative text-white w-full gap-2 flex justify-start'>
                                    <div className='bg-purple-600 rounded-lg w-8/12 p-1'>
                                        {message.message}
                                    </div>
                                </div>
                        ))
                    }
                </div>
                <div className='w-full h-2/12 '>
                    <div className='bg-gray-800 rounded-md p-2 w-full flex gap-2'>
                        <textarea
                            placeholder="Type something..."
                            value={localMssg}
                            onChange={(e) => setLocalMssg(e.target.value)}
                            className="bg-transparent text-white outline-none w-10/12 resize-none h-10 max-h-40 p-2 border border-gray-300 rounded-md scrollbar-none"
                        />
                        <div className='text-purple-600 bg-primaryBackground w-fit flex items-center justify-center rounded-full p-2' onClick={() => sendMessage(localMssg)}>
                            <FaPaperPlane className='-ml-1' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBox