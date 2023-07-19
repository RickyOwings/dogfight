export default (timeMS: number)=> new Promise((resolve)=>{
    setTimeout(()=>{resolve(0)}, timeMS)
})
