const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatDate(date: Date) {
    const dateString = date.getDate().toString();

    let dateSuffix = "th";

    if (date.getDate() < 10 || date.getDate() > 20) {
        if (dateString.endsWith("1")) dateSuffix = "st";
        if (dateString.endsWith("2")) dateSuffix = "nd";
        if (dateString.endsWith("3")) dateSuffix = "rd";
    }

    return `${dateString}${dateSuffix} ${
        months[date.getMonth()]
    } ${date.getFullYear()}`;
}

export function getTime(time: number) {
    return `${Math.floor(time / 60)}:${padZero(Math.floor(time % 60))}`;
}

function padZero(z: number) {
    return z.toString().length == 1 ? `0${z}` : z;
}
