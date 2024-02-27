/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:Tanish Bansal
 * Author: Tanish Bansal
 *
 */

const unzipper = require("unzipper")
const fs = require("fs")
const PNG = require("pngjs").PNG

const stream = require("stream")
const {Transform} = require("stream")

const { type } = require("os")
const { existsSync, mkdirSync } = require("fs")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pathIn)
      .pipe(unzipper.Parse())
      .on("entry", entry => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        if (type == "File" && !fileName.includes("MACOS") && fileName.endsWith(".png")) {
          // filters out the macos folder so we dont have to deal it with later
          // filters out all files that are not png
          if(!existsSync(pathOut)){
            console.log(pathOut)
            fs.mkdir(pathOut, (err) =>{
              if(err){
                console.log(err)
              }
            })

          }
          entry.pipe(fs.createWriteStream((path.join(pathOut,fileName))));
          
        } else {
          entry.autodrain();
        }
      })
      .on("error", error => {
        console.error("Error while unzipping:", error);
        reject(error);
      })
      .on("close", () => {
        console.log("Extraction complete");
        resolve();
      });
  });
};


/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir,(err,files) => {
      console.log(dir)
      if(err){
        reject(err)
      }
      else{
        resolve(files.map((file) => path.join(dir,file)))
      }
    })
  })
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = async (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .mkdir(pathOut, { recursive: true })
      .catch((error) => {
        console.error("Error while creating directory:", error);
        reject(error);
      });
    fs.createReadStream(pathIn)
      .pipe(new PNG())
      .on("parsed", function () {
        let a = pathIn.split("\\")
        // Used this to acces the name of the file form the path
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const avg = Math.round(
              (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3
            );
            this.data[idx] = avg;
            this.data[idx + 1] = avg;
            this.data[idx + 2] = avg;
            
          }
        }
        
        this.pack()
          .pipe(fs.createWriteStream(path.join(pathOut, `${a[a.length -1]}`)))
          
          .on("finish", () => {
            console.log(`Grayscale conversion completed for ${pathIn}`);
            
            resolve();
          })
          .on("error", (error) => {
            console.error(
              `Error writing grayscale image for ${pathIn}: ${error}`
            );
            reject(error);
          });
      })
      .on("error", (error) => {
        console.error(`Error parsing PNG file ${pathIn}: ${error}`);
        reject(error);
      });
  });
};
/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const sepia = async (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.promises
      .mkdir(pathOut, { recursive: true })
      .catch((error) => {
        console.error("Error while creating directory:", error);
        reject(error);
      });
    fs.createReadStream(pathIn)
      .pipe(new PNG())
      .on("parsed", function () {
        let a = pathIn.split("\\")
        // Used this to acces the name of the file form the path
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const avg = Math.round(
              (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3
            );
            const R = this.data[idx];
            const G = this.data[idx + 1];
            const B = this.data[idx + 2];
            const sepiaR = Math.min(
              255,
              Math.round(R * 0.393 + G * 0.769 + B * 0.189)
            );
            const sepiaG = Math.min(
              255,
              Math.round(R * 0.349 + G * 0.686 + B * 0.168)
            );
            const sepiaB = Math.min(
              255,
              Math.round(R * 0.272 + G * 0.534 + B * 0.131)
            );
            this.data[idx] = sepiaR;
            this.data[idx + 1] = sepiaG;
            this.data[idx + 2] = sepiaB;
          }
        }
        
        this.pack()
          .pipe(fs.createWriteStream(path.join(pathOut, `${a[a.length -1]}`)))
          
          .on("finish", () => {
            console.log(`Sepia conversion completed for ${pathIn}`);
            
            resolve();
          })
          .on("error", (error) => {
            console.error(
              `Error writing sepia image for ${pathIn}: ${error}`
            );
            reject(error);
          });
      })
      .on("error", (error) => {
        console.error(`Error parsing PNG file ${pathIn}: ${error}`);
        reject(error);
      });
  });
};
const menuShow = () => {
  console.log(`
        Please choose from the available options below:
        1) readDir
        2) grayScale
        3) sepia
        4) Both in seperate folders
    `);
};

const userInput = (question) =>
  new Promise((resolve,reject) => {
    rl.question(question, resolve);
  });

const userPrompt = async () => {
  try {
    let userPick = "";
    let valid_pick = false;
    const valid_text = ["readdir", "grayscale", "sepia","Both in seperate folders", "1", "2", "3","4"];
    while (!valid_pick) {
      const filter = await userInput(
        "Enter the number of the desired function: "
      );
      if (valid_text.includes(filter.toLowerCase())) {
        valid_pick = true;
        userPick = filter;
      } else {
        console.log("Invalid input.");
      }
    }
    console.log(`Option ${userPick} has been selected.`);
    return userPick;
  } catch (err) {
    console.log("Error prompt: ", err);
  }
};
const stopPrompt = () => {
  rl.close();
};
module.exports = {
  unzip,
  readDir,
  grayScale,
  sepia,
  menuShow,
  userPrompt,
  userInput,
  stopPrompt
};

