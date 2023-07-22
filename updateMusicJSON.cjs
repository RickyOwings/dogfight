// Updates the json file in music folder containing name of music files
const fs = require('fs');
fs.readdir('./public/assets/sounds/', (err, files)=>{ 
    if (err) console.log(err);
    console.log("Reading files in sounds directory and updating the json")
    fs.writeFile('./public/assets/sounds/sounds.json', JSON.stringify(files), err => {
        if (err) console.log(err);
    })
});
