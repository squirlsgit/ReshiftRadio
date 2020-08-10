const fs = require('fs');


function filePath(filename, userID) {
  if (userID) return `file-storage/${userID}/${filename}`;
  else return 'file-storage/' + filename;
}

/**
 * 
 * 
 * @param {any} data JSON data.
 * @param {any} filename name of file
 * @param {any} userID id of user
 */
exports.writeJson = (data, filename, userID) => {
  
  fs.writeFileSync(filePath(filename, userID), JSON.stringify(data));
  
}
exprots.saveAttachment = (attachment, filename, userID) => {

  fs.writeFileSync(filePath(filename, userID), data);

}
