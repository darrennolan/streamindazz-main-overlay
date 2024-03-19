const twitchFollowerMessage = {
    type:'MESSAGE',
    data:{
        topic:'activity-feed-alerts-v2.28625148',
        message:'{"type":"activity_feed_alerts_create","data":{"__typename":"ActivityFeedFollowAlert","id":"FOLLOW:d9fd6878-1b01-4a36-bd0c-7ad4e360e5d1","status":"OFFLINE","createdAt":"2024-03-14T23:36:52.580509973Z","updatedAt":null,"follower":{"__typename":"User","id":"1047343066","displayName":"streamindazztester","login":"streamindazztester"}}}',
    },

    /*
    {
        "type": "activity_feed_alerts_create",
        "data": {
            "__typename": "ActivityFeedFollowAlert",
            "id": "FOLLOW:d9fd6878-1b01-4a36-bd0c-7ad4e360e5d1",
            "status": "OFFLINE",
            "createdAt": "2024-03-14T23:36:52.580509973Z",
            "updatedAt": null,
            "follower": {
                "__typename": "User",
                "id": "1047343066",
                "displayName": "streamindazztester",
                "login": "streamindazztester"
            }
        }
    }
    */
};



export {
    twitchFollowerMessage,
};
