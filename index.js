const express = require('express');
const app = express();

const cors = require('cors')

const { addFile, getUserdata } = require('./src/IPFS')

const { check_signup_fields, check_signin_fields, check_createJob_fields,check_get_job_fields,check_applyJob_fields,
    check_profile_fields, check_get_profile_fields } = require('./src/FieldsAuthentication')

const { firebase_signup, firebase_signin, firebase_update_ipfsHash, firebase_getAll_jobs,firebase_get_job,
    firebase_getProfile, firebase_create_job, firebase_apply_job,firebase_get_applied_job } = require('./src/FireBase')

const { EncryptPassword, DecryptPassword } = require('./src/Encryption')

const dotenv = require('dotenv');
dotenv.config();

// cors

app.use(cors())

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
                res.json({ message: 'Registered successfully', status: 'success' })
            }, err => {
                res.json({ message: err , status: 'error' })
            })

        }

    }, error => {
        res.json({ message: error, status: 'error'  })
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
                        res.json({ message: 'Logged in successfully', userdata, status: 'success' })
                    }, failed => {
                        res.json({ message: failed, status: 'error' })
                    })

                }
                else {
                    res.json({ message: 'Password do not match', status: 'error'  })
                }
            }, err => {
                res.json({ message: err , status: 'error' })
            })

        }

    }, error => {
        res.json({ message: error, status: 'error'  })
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
                res.json({ message: 'Profile updated successfully', status: 'success'  })
            }, err => {
                res.json({ message: err, status: 'error'  })
            })

        }

    }, error => {
        res.json({ message: error , status: 'error' })
    })

})



// ************* Get Profile route ************* 

app.post('/Profile', async (req, res) => {
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


// ************* Create Job route ************* 


app.post('/createJob', async (req, res) => {
    const data = req.body

    check_createJob_fields(data, async success => {

        if (success) {

            firebase_create_job('EmployerJobs', data, succ => {
                res.json({ message: 'Job created successfully', status: 'success' })
            }, err => {
                res.json({ message: err, status: 'error' })
            })

        }

    }, error => {
        res.json({ message: error, status: 'error' })
    })

})



// ************* Get All Job route ************* 

app.get('/allJobs', async (req, res) => {

    firebase_getAll_jobs( succ => {
        res.json({ alljobs: succ })
    }, err => {
        res.json({ message: err })
    })
})



// ************* Get Category wise Job route ************* 

app.get('/job', async (req, res) => {

    const data = req.body

    check_get_job_fields(data, async success => {

        if (success) {
            firebase_get_job(data['category'],async succ => {
               
                res.json({ jobs: succ })
            }, err => {
                res.json({ message: err })
            })

        }

    }, error => {
        res.json({ message: error })
    })

})


app.post('/apply', async ( req, res ) => {

    const data = req.body

    check_applyJob_fields(data, async success => {

        if (success) {

            firebase_apply_job(data, succ => {
                res.json({ message: succ, status: 'success' })
            }, err => {
                console.log(err)
                res.json({ message: err, status: 'error' })
            })

        }

    }, error => {
        res.json({ message: error, status: 'error' })
    })
})


app.get('/appliedJobs', async (req, res) => {

    const data = req.body
 
            firebase_get_applied_job(data['freelancer_email'],async succ => {
                res.json({ message: succ, status: 'success' })
            }, err => {
                console.log(err)
                res.json({ message: err, status: 'error' })
            })
  
})


app.listen(process.env.PORT || 5000, () => console.log(`App listening on port ${process.env.PORT}!`))