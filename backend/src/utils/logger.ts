const logger = (...messages: unknown[]): void => {
  // if (!process.env.NODE_ENV?.startsWith('test')) {
  // }
    const date = new Date();
    console.log(
      `[${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}] - ${messages}`
    );
};

export default logger;
