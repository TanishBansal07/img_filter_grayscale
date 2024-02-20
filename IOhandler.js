/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
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
const grayScale = (pathIn, pathOut) => {
  
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
