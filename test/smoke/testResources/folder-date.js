
var currentDate = new Date();

var minute;
if(currentDate.getMinutes()<10){
    minute = '0' + currentDate.getMinutes().toString()
} else {
    minute = currentDate.getMinutes().toString()
}

var hour;
if(currentDate.getHours()<10){
    hour = '0' + currentDate.getHours().toString()
} else {
    hour = currentDate.getHours().toString()
}

var day;
if(currentDate.getDate()<10){
    day = '0' + currentDate.getDate().toString()
} else {
    day = currentDate.getDate().toString()
}

var month;
if(currentDate.getMonth()<9){
    month = '0' +(currentDate.getMonth()+1).toString();
} else {
    month = (currentDate.getMonth()+1).toString()
}

var year = (currentDate.getYear() + 1900).toString();

var folderDate = year + '-' + month + '-' + day + '/' + hour + '-' + minute + '/';

module.exports = folderDate;
