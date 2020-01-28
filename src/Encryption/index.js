const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.EncryptPassword = async ( password ) => {
 let resolved_hash = await bcrypt.hash(password, saltRounds)
return resolved_hash
}


exports.DecryptPassword = async ( password, hashPassword ) => {

    const matched = await bcrypt.compare(password, hashPassword);
    return matched
}