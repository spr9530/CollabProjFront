export const triggerEvent = async ({channel, event, message}) => {
    await fetch('https://collab-project-indol.vercel.app/pusher/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel,
        event: event,
        message: message
      })
    });
  };