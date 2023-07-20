export default () => new Promise(async (resolve)=>{
    window.addEventListener('keydown', ()=>{resolve(0)});
});
