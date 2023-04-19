const generateMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}