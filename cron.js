var cron = require('node-cron');
const UniversalFunctions = require("./Utils/UniversalFunction");

const orderStatusChange = cron.schedule('* * * * *', async () => {
    try {
        await UniversalFunctions.orderStatusChange();
    } catch (err) {
        console.log(err);
    }
});

module.exports = {
    orderStatusChange
};