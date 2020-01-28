const ipfsAPI = require('ipfs-api');
const fetch = require('node-fetch');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

 const addFile = async ( data ) => {
    let { path, content } = data
    content = JSON.stringify( content );
    const file = { path: path, content: Buffer.from( content ) }
    const filesAdded = await ipfs.add( file )
    return filesAdded[0].hash
}

const getUserdata = async ( fileHash, success, error ) => {
    fetch(`https://gateway.ipfs.io/ipfs/${fileHash}`)
    .then(response => response.json())
    .then(data => {
      return success(data)
    })
    .catch(err => {
        return error('No such document found')
    })
}

module.exports = {
    addFile,
    getUserdata
}