const express = require('express');
const app = express();

const cors = require('cors')

const { addFile, getUserdata } = require('./src/IPFS')

const { check_signup_fields, check_signin_fields, check_createJob_fields,check_get_job_fields,check_applyJob_fields,
    check_profile_fields, check_get_profile_fields } = require('./src/FieldsAuthentication')

const { _signup, _signin, _update_ipfsHash, _getAll_jobs,_get_job,
    _getProfile, _create_job, _apply_job,_get_applied_job,_declineJob
    ,_get_notifications, _acceptJob,_startJob,_completeJob
    ,_markCompleteJob } = require('./src/Helper')

const { EncryptPassword, DecryptPassword } = require('./src/Encryption')

 
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

            _signup(data.content['account_type'], info, succ => {
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

            _signin(data['account_type'], data, async succ => {

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

            _update_ipfsHash(data.content['account_type'], info, succ => {
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
            _getProfile(data['account_type'], data, async succ => {

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

            _create_job('EmployerJobs', data, succ => {
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

    _getAll_jobs( succ => {
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
            _get_job(data['category'],async succ => {
               
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

            _apply_job(data, succ => {
                res.json({ message: succ, status: 'success' })
            }, err => { 
                res.json({ message: err, status: 'error' })
            })

        }

    }, error => {
        res.json({ message: error, status: 'error' })
    })
})


app.post('/appliedJobs', async (req, res) => {

    const data = req.body
 
            _get_applied_job(data['freelancer_email'],async succ => {
                res.json({ message: succ, status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            })
  
})

app.post('/notifications', async (req, res) => {

    const data = req.body
            _get_notifications(data['employer_email'],async succ => {
                res.json({ message: succ, status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            })
  
})


app.post('/declineJob', async (req, res) => {

    const data = req.body
 
            _declineJob(data,async succ => {
                res.json({  status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            }) 
})

app.post('/acceptJob', async (req, res) => {

    const data = req.body
 
            _acceptJob(data,async succ => {
                res.json({  status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            }) 
})

app.post('/startJob', async (req, res) => {

    const data = req.body
 
            _startJob(data,async succ => {
                res.json({  status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            }) 
})

app.post('/completeJob', async (req, res) => {

    const data = req.body
 
            _completeJob(data,async succ => {
                res.json({  status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            }) 
})

app.post('/markCompleteJob', async (req, res) => {

    const data = req.body
 
            _markCompleteJob(data,async succ => {
                res.json({  status: 'success' })
            }, err => {
                 
                res.json({ message: err, status: 'error' })
            }) 
})

app.listen(process.env.PORT || 5000, () => console.log(`App listening on port ${process.env.PORT}!`))