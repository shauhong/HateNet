const capitalize = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day}-${month}-${year}`;
}

const formatNumber = (number) => {
    const symbol = ["", "K", "M"]
    const tier = Math.log10(Math.abs(number)) / 3 | 0;
    if (tier === 0) {
        return number;
    }
    const suffix = symbol[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = number / scale;
    return scaled.toFixed(1) + suffix;
}

const formatTime = (time) => {
    const months = {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec',
    }
    const date = parseTime(time);
    const year = date.getFullYear();
    const month = months[date.getMonth() + 1];
    return `${month} ${year}`;
}

const getEndOfMonth = () => {
    const today = new Date()
    const date = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return date.getDate()
}

const getEndOfTargetMonth = (year, month) => {
    const date = new Date(year, month + 1, 0);
    return date.getDate();
}

const parseDate = (date) => {
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    const minute = ('0' + date.getMinutes()).slice(-2);
    const datestring = `${year}-${month}-${day}T${hour}:${minute}`;
    return datestring
}

const parseTime = (time) => {
    const date = new Date();
    date.setTime(time);
    return date;
}

export { capitalize, formatNumber, formatDate, formatTime, parseTime, parseDate, getEndOfMonth, getEndOfTargetMonth };