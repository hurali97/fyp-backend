const express = require('express');
const app = express();
const { addFile, getUserdata } = require('./src/IPFS')
const { check_signup_fields, check_signin_fields, check_profile_fields, check_get_profile_fields } = require('./src/FieldsAuthentication')
const { firebase_signup, firebase_signin, firebase_update_ipfsHash, firebase_getProfile } = require('./src/FireBase')
const { EncryptPassword, DecryptPassword } = require('./src/Encryption')

const dotenv = require('dotenv');
dotenv.config();

//  Json middleware
app.use(express.json())


app.get('/', (req, res) => {
    return res.send('Welcome To Dwork Backend')
})


// ************* Signup route ************* 

app.post('/signup', async (req, res) => {
    const data = req.body

    check_signup_fields(data.content, async success => {

        if (success) {
            const fileHash = await addFile(data)

            let info = {
                email: data['content']['email'],
                password: await EncryptPassword(data['content']['password']),
                ipfs_hash: fileHash
            }

            firebase_signup(data.content['account_type'], info, succ => {
                res.json({ message: 'Registered successfully' })
            }, err => {
                res.json({ message: err })
            })

        }

    }, error => {
        res.json({ message: error })
    })


})


// ************* Signin route ************* 

app.post('/signin', async (req, res) => {
    const data = req.body

    check_signin_fields(data, async success => {

        if (success) {

            firebase_signin(data['account_type'], data, async succ => {

                let userMatched = await DecryptPassword(data.password, succ.password)
                if (userMatched) {
                    getUserdata(succ.ipfs_hash, userdata => {
                        res.json({ message: 'Logged in successfully', userdata })
                    }, failed => {
                        res.json({ message: failed })
                    })

                }
                else {
                    res.json({ message: 'Password do not match' })
                }
            }, err => {
                res.json({ message: err })
            })

        }

    }, error => {
        res.json({ message: error })
    })


})


// ************* Edit Profile route ************* 
// Email and account type can never change

app.post('/editProfile', async (req, res) => {
    const data = req.body

    check_profile_fields(data.content, async success => {

        if (success) {
            const fileHash = await addFile(data)

            let info = {
                email: data['content']['email'],
                ipfs_hash: fileHash
            }

            firebase_update_ipfsHash(data.content['account_type'], info, succ => {
                res.json({ message: 'Profile updated successfully' })
            }, err => {
                res.json({ message: err })
            })

        }

    }, error => {
        res.json({ message: error })
    })

})



// ************* Get Profile route ************* 

app.get('/Profile', async (req, res) => {
    const data = req.body

    check_get_profile_fields(data, async success => {

        if (success) {
            firebase_getProfile(data['account_type'], data, async succ => {

                    getUserdata(succ.ipfs_hash, userdata => {
                        res.json({ userdata })
                    }, failed => {
                        res.json({ message: failed })
                    })

            
            }, err => {
                res.json({ message: err })
            })

        }

    }, error => {
        res.json({ message: error })
    })

})





app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`))