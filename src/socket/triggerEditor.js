export const triggerEditEvent = async ({channel, event, message, socketId}) => {
  console.log9
    await fetch('https://collab-project-indol.vercel.app/pusher/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel,
        event: event,
        message: message,
        socketId,
      })
    });
  };