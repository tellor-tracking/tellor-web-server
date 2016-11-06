const sleep = time => new Promise(res => setTimeout(res, time));

module.exports = {
    sleep
};