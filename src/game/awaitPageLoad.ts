const assetDir: string = './src/game/assets/'

export default () => new Promise(async (resolve)=>{
    await fetch (assetDir + 'sounds/shoot.ogg')
    window.addEventListener("load", ()=>{
        resolve(1);
    })
});
