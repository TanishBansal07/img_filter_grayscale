const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date:
 * Author:
 *
 */
const IOhandler = require("./IOhandler");
const { menuShow } = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathSepia = path.join(__dirname, "sepia");
let userPick = "";

IOhandler.menuShow();
IOhandler.userPrompt()
  .then((data) => (userPick = data))
  .then(() => IOhandler.stopPrompt())
  .then(() => IOhandler.unzip(zipFilePath, pathUnzipped))
  .then(() => {
    if (
      userPick.toLowerCase() === "1" ||
      userPick.toLowerCase() === "readdir"
    ) {
      IOhandler.readDir(pathUnzipped).then((data) => console.log(data));
    } else if (
      userPick.toLowerCase() === "2" ||
      userPick.toLowerCase() === "grayscale"
    ) {
      IOhandler.readDir(pathUnzipped).then((data) => data.forEach(element => {
        IOhandler.grayScale(element, pathProcessed)
      }));
    } else if (
      userPick.toLowerCase() === "3" ||
      userPick.toLowerCase() === "sepia"
    ) {
        IOhandler.readDir(pathUnzipped).then((data) => data.forEach(element => {
            IOhandler.sepia(element, pathSepia)
          }));
    } else if(      
        userPick.toLowerCase() === "4" ||
        userPick.toLowerCase() === "Both in seperate folders"){
            IOhandler.readDir(pathUnzipped).then((data) => data.forEach(element => {
                IOhandler.grayScale(element, pathProcessed)
              }))
              IOhandler.readDir(pathUnzipped).then((data) => data.forEach(element => {
                IOhandler.sepia(element, pathSepia)
              }))
        }
     else {
      console.log("That was not a valid option.");
    }
  })
  .catch((err) => console.log("Error occurred: ", err));