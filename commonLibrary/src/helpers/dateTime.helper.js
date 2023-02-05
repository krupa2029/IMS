const moment = require("moment");

module.exports = {
  getDateUTC: (date = "", format = "") => {
    const dateFormat = format !== "" ? format : undefined;
    if (date && date !== "") {
      const formattedDateString = moment(date).utc().format(dateFormat);
      const formattedDate = new Date(formattedDateString);
      return formattedDate;
    } else {
      const currentDate = moment().utc();
      const formattedDateString = currentDate.format(dateFormat);
      const formattedDate = new Date(formattedDateString);
      return formattedDate;
    }
  },

  addDayInDate: (date, daysToAdd = 0) => {
    if(date) {
       const formattedDateString = moment(date).add(daysToAdd, 'day');
       const formattedDate = new Date(formattedDateString);
      return formattedDate;
    }
    return date;
  },

  isDate: (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0, 10) === dateString;
  }
  
};
