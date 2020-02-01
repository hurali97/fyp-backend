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


// GetProfile from firebase

exports.firebase_getProfile = (collectionName, data, success, error) => {


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


// Create jobs firebase

exports.firebase_create_job = (collectionName, data, success, error) => {


    database.collection(collectionName).doc(data['email']).get().then(d => {

        if (d.exists) {
        //    console.log(Object.keys(d.data()))

           let _jobs = Object.keys(d.data())

           let _email = data['email'];

           database.collection(collectionName).doc(data['email']).set({
               [`${_email}_${_jobs.length+1}`]: data
           },
               { merge: true })
               .then(resp => {
                database.collection('Alljobs').doc(data['category']).get().then(job => {
                    let alljobs = Object.keys(job.data())
                    database.collection('Alljobs').doc(data['category']).set({
                        [`${_email}_${alljobs.length+1}`]: data
                    }, { merge: true });
                })
                   return success(true)
               })
               .catch(err => { return error(err.message) })
        }

        else {
 

            let _email = data['email'];

            database.collection(collectionName).doc(data['email']).set({
                [_email+'_1']: data
            },
                { merge: true })
                .then(resp => {
                    database.collection('Alljobs').doc(data['category']).set({
                        [_email+'_1']: data
                    });
                    
                    return success(true)
                })
                .catch(err => { return error(err.message) })
           
        }

    });

};


// Create jobs firebase

exports.firebase_getAll_jobs = async(collectionName, success, error) => {

  getDocuments()
 
};



const  getDocuments = async () => {
    const snapshot = await database.collection('AllJobs').get()
    return snapshot.docs.map(doc =>{
        return console.log(doc.data())
    });
}
