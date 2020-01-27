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