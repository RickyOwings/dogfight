export default () => new Promise(async (resolve) => {
  window.addEventListener("load", () => {
    resolve(1);
  });
});
