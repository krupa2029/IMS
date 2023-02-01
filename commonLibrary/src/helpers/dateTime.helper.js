const moment = require("moment");

module.exports = {
  getDateUTC: (date = "", format = "") => {
    const dateFormat = format !== "" ? format : "DD-MM-YYYY hh:mm:ss";
    if (date && date !== "") {
      return moment(date).utc().format(dateFormat);
    } else {
      return moment().utc().format(dateFormat);
    }
  },
};
