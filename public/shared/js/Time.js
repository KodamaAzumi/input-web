class Time {
  createDateStr(timestamp = Date.now()) {
    const now = new Date(timestamp);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月をゼロ埋め
    const day = now.getDate().toString().padStart(2, '0'); // 日をゼロ埋め
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  createTimeStr(timestamp = Date.now()) {
    const now = new Date(timestamp);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    return timeString;
  }
}
