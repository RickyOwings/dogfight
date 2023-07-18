export default (timeMS) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(0);
  }, timeMS);
});
