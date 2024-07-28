import React from 'react';

const ParticipantList = ({ peerIds }) => {
    return (
        <div className="participant-list">
            {peerIds.map((peer, index) => (
                <div key={index} className="participant">
                    {peer.peerId}
                </div>
            ))}
        </div>
    );
};

export default ParticipantList;
