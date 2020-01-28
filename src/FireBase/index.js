const { database } = require('./config')



// signup info saved to firebase 

exports.firebase_signup = (collectionName, data, success, error) => {


    database.collection(collectionName).doc(data['email']).get().then(d => {

        if (d.exists) {
            return error('Email already registered')
        }

        else {
            database.collection(collectionName).doc(data['email']).set({
                data
            },
                { merge: true })
                .then(resp => {
                    return success(true)
                })
                .catch(err => { return error(err.message) })
        }

    });

};


// signin from firebase

exports.firebase_signin = (collectionName, data, success, error) => {


    database.collection(collectionName).doc(data['email']).get().then(d => {

        if (d.exists) {
        // console.log(d.data().data)
        return success(d.data().data)
        }

        else {
            return error('No such user found')
           
        }

    });

};


// update ipfs hash on firebase

exports.firebase_update_ipfsHash = (collectionName, data, success, error) => {


    database.collection(collectionName).doc(data['email']).get().then(d => {

        if (d.exists) {
            database.collection(collectionName).doc(data['email']).set({
                data:{
                    ipfs_hash: data.ipfs_hash
                }
              
            },{ merge: true})
                .then(resp => {
                    return success(true)
                })
                .catch(err => { return error(err.message) })
        }

        else {
            return error('No such user found')
           
        }

    });

};