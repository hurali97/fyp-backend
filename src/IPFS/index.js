const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

 const addFile = async ( data ) => {
    let { path, content } = data
    content = JSON.stringify( content );
    const file = { path: path, content: Buffer.from( content ) }
    const filesAdded = await ipfs.add( file )
    return filesAdded[0].hash
}

module.exports = {
    addFile: addFile
}