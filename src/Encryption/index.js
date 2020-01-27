const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.EncryptPassword = async ( password ) => {
 let resolved_hash = await bcrypt.hash(password, saltRounds)
// console.log(resolved_hash)
return resolved_hash
}