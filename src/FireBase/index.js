const { database, firebase } = require('./config')



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
                data: {
                    ipfs_hash: data.ipfs_hash
                }

            }, { merge: true })
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
                [`${_email}_${_jobs.length + 1}`]: data
            },
                { merge: true })
                .then(resp => {

                    let _temp = Object.values(d.data())
                    let check = false
                    _temp.map((_data => {
                        if (_data.category == data.category) {
                            check = true
                            return
                        }
                    }))

                    if (check) {
                        database.collection('Alljobs').doc(data['category']).get().then(job => {
                            let alljobs = Object.keys(job.data())

                            database.collection('Alljobs').doc(data['category']).set({
                                [`${_email}_${alljobs.length + 1}`]: data
                            }, { merge: true });
                        })
                            .catch(err => console.log(err))
                    }
                    else {
                        database.collection('Alljobs').doc(data['category']).set({
                            [`${_email}_1`]: data
                        }, { merge: true });
                    }



                    return success(true)
                })
                .catch(err => { return error(err.message) })
        }

        else {


            let _email = data['email'];

            database.collection(collectionName).doc(data['email']).set({
                [_email + '_1']: data
            },
                { merge: true })
                .then(resp => {
                    database.collection('Alljobs').doc(data['category']).set({
                        [_email + '_1']: data
                    });

                    return success(true)
                })
                .catch(err => { return error(err.message) })

        }

    });

};


// Get all jobs firebase

exports.firebase_getAll_jobs = async (success, error) => {

    let alljobs = await getDocuments()

    if (alljobs)
        return success(alljobs)
    else
        return error('No jobs available !')


};



// Get all jobs firebase

exports.firebase_get_job = async (category, success, error) => {

    let jobsArray = []

    database.collection('Alljobs').doc(category).get().then(job => {

        let keys = Object.keys(job.data())
        let values = Object.values(job.data())


        values.map((val, ind) => {


            if (val.status == 'newly arrived') {
                let _job = {
                    ...val,
                    job_id: keys[ind]
                }

                jobsArray.push(_job)
            }

        })

        //   console.log(jobsArray)
        return success(jobsArray)

    })
        .catch(err => {
            return error('No jobs for this category')
        })

};


const getDocuments = async () => {

    let jobsArray = []

    let alljobs = await database.collection('Alljobs').get().then(snapshot => {
        snapshot.docs.forEach(doc => {

            let keys = Object.keys(doc.data())
            let values = Object.values(doc.data())


            values.map((val, ind) => {

                if (val.status == 'newly arrived') {
                    let _job = {
                        ...val,
                        job_id: keys[ind]
                    }

                    jobsArray.push(_job)
                }

            })


        })

        return jobsArray


    })



    return alljobs
}



exports.firebase_apply_job = async (data, success, error) => {

    let jobsArray = []

    database.collection('Alljobs').doc(data.category).get().then(job => {

        let keys = Object.keys(job.data())
        let values = Object.values(job.data())


        values.map((val, ind) => {


            if (keys[ind] == data.job_id) {
                let _jobData = {
                    budget: val.budget,
                    category: val.category,
                    description: val.description,
                    duration: val.duration,
                    email: val.email,
                    job_id: data.job_id,
                    status: 'pending',
                    
                }

                database.collection('AppliedJobs').doc(data['freelancer_email']).get().then(d => {

                    if (d.exists) {

                        let _jobs = Object.keys(d.data())
                        let _check = false
                        for (let i = 0; i < _jobs.length; i++) {
                            if (_jobs[i] == data.job_id) {
                                _check = true
                                break
                            }
                        }

                        if (_check) {
                            return error('You have already applied for this job')

                        }
                        else {
                            database.collection('AppliedJobs').doc(data['freelancer_email']).set({
                                [data['job_id']]: _jobData
                            }, { merge: true });

                            let _employerNotfiData = {
                                ..._jobData,
                                message: `${data['freelancer_email']} wants to apply for this job.`,
                                freelancer_email: data.freelancer_email
                            }

                            database.collection('EmployerNotifs').doc(data['employer_email']).get().then(d => {

                                if (d.exists) {

                                   

                                    let _jobs = Object.keys(d.data()) 
                                    let _dataKey = ''

                                    if( _jobs.length > 0)
                                      _dataKey = `Notif_${parseInt(_jobs[_jobs.length - 1].split('_')[1]) + 1}`
                                      else
                                      _dataKey = 'Notif_1'

                                    _employerNotfiData = {
                                        ..._employerNotfiData,
                                        notif_id: _dataKey
                                    }


                                    database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                        [_dataKey]: _employerNotfiData
                                    },
                                        { merge: true })
                                        .then(resp => {
                                            return success("Successfully applied for job, waiting for approval")
                                        })

                                }

                                else {

                                    _employerNotfiData = {
                                        ..._employerNotfiData,
                                        notif_id: 'Notif_1'
                                    }


                                    database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                        [`Notif_${1}`]: _employerNotfiData
                                    },
                                        { merge: true })
                                        .then(resp => {
                                            return success("Successfully applied for job, waiting for approval")
                                        })

                                }

                            });
                        }
                    }
                    else {
                        database.collection('AppliedJobs').doc(data['freelancer_email']).set({
                            [data['job_id']]: _jobData
                        }, { merge: true });

                        let _employerNotfiData = {
                            ..._jobData,
                            message: `${data['freelancer_email']} wants to apply for this job.`,
                            freelancer_email: data.freelancer_email
                        }

                        database.collection('EmployerNotifs').doc(data['employer_email']).get().then(d => {

                            if (d.exists) {
                                // console.log(d.data())

                                let _jobs = Object.keys(d.data())

                                let _dataKey = ''

                                if( _jobs.length > 0)
                                  _dataKey = `Notif_${parseInt(_jobs[_jobs.length - 1].split('_')[1]) + 1}`
                                  else
                                  _dataKey = 'Notif_1'

                                _employerNotfiData = {
                                    ..._employerNotfiData,
                                    notif_id: _dataKey
                                }


                                database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                    [_dataKey]: _employerNotfiData
                                },
                                    { merge: true })
                                    .then(resp => {
                                        return success("Successfully applied for job, waiting for approval")
                                    })

                            }

                            else {

                                _employerNotfiData = {
                                    ..._employerNotfiData,
                                    notif_id: `Notif_${1}`
                                }

                                database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                    [`Notif_${1}`]: _employerNotfiData
                                },
                                    { merge: true })
                                    .then(resp => {
                                        return success("Successfully applied for job, waiting for approval")
                                    })

                            }

                        });
                    }

                })
 
            }

        })

    })
        .catch(err => {
            return error('This job has been removed')
        })

};


exports.firebase_get_applied_job = async (data, success, error) => {

    database.collection('AppliedJobs').doc(data).get().then(job => {

        let values = Object.values(job.data())

        return success(values)
    })
        .catch(err => {
            return error('Some error occurred')
        })

};


exports.firebase_get_notifications = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data).get().then(job => {
        // console.log(data,job.data())
        if( job.data() ){
            let values = Object.values(job.data())

            return success(values)
        }
        else{
            return error('No notifications')
        }

    })
        .catch(err => {
            console.log(err)
            return error('Some error occurred')
        })

};


exports.firebase_declineJob = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data.employer_email).get().then(job => {

        let values = Object.values(job.data())

        values.map((val, index) => {
            if (val.notif_id == data.notif_id) {
                let notif_id = data.notif_id

                database.collection('EmployerNotifs').doc(data['employer_email']).update({
                    [notif_id]: firebase.firestore.FieldValue.delete()
                })

                database.collection('AppliedJobs').doc(data['freelancer_email']).get().then(job => {

                    let appliedJobs = Object.values(job.data()) 
                    let updatedJob = {}

                    appliedJobs.map((_job, ind) => {
                        if (_job.job_id == data.job_id) {
                           updatedJob = {
                                budget: _job.budget,
                                category: _job.category,
                                description: _job.description,
                                duration: _job.duration,
                                email: _job.email,
                                job_id: _job.job_id,
                                status: 'declined'
                            }

                            database.collection('AppliedJobs').doc(data['freelancer_email']).set({
                                [data['job_id']]: updatedJob
                            }, { merge: true })
                            .then(resp => {
                                return success(true) 
                            })
                            .catch( err => {
                                return error('Some error occurred') 
                            })
                           
                        
                        }

                      
                    })
            })
        }
        })
 
    })
        .catch(err => { 
            return error('Some error occurred')
        })

};


 

 exports.firebase_acceptJob = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data.employer_email).get().then(job => {

        let values = Object.values(job.data())

        values.map((val, index) => {
            if (val.notif_id != data.notif_id) {
                if( val.job_id == data.job_id ){
                    let notif_id = val.notif_id

                    database.collection('EmployerNotifs').doc(data['employer_email']).update({
                        [notif_id]: firebase.firestore.FieldValue.delete()
                    })
    
                    database.collection('AppliedJobs').doc(val['freelancer_email']).get().then(job => {
    
                        let appliedJobs = Object.values(job.data()) 
                        let updatedJob = {}
    
                        appliedJobs.map((_job, ind) => {
                            if (_job.job_id == data.job_id) {
                               updatedJob = {
                                    budget: _job.budget,
                                    category: _job.category,
                                    description: _job.description,
                                    duration: _job.duration,
                                    email: _job.email,
                                    job_id: _job.job_id,
                                    status: 'declined'
                                }
    
                                database.collection('AppliedJobs').doc(val['freelancer_email']).set({
                                    [data['job_id']]: updatedJob
                                }, { merge: true })
                                .then(resp => { 
                                })
                                .catch( err => {
                                    return error('Some error occurred') 
                                })
                               
                            
                            }
    
                          
                        })
                })
                }
               
        }
        })


        values.map((val, index) => {
            if (val.notif_id == data.notif_id) {
                if( val.job_id == data.job_id ){
                    let notif_id = `${val.notif_id}.status`

                    database.collection('EmployerNotifs').doc(data['employer_email']).update({
                        [notif_id]: 'accepted'
                    })
    
                    database.collection('AppliedJobs').doc(val['freelancer_email']).get().then(job => {
    
                        let appliedJobs = Object.values(job.data()) 
                        let updatedJob = {}
    
                        appliedJobs.map((_job, ind) => {
                            if (_job.job_id == data.job_id) {
                               updatedJob = {
                                    budget: _job.budget,
                                    category: _job.category,
                                    description: _job.description,
                                    duration: _job.duration,
                                    email: _job.email,
                                    job_id: _job.job_id,
                                    status: 'accepted'
                                }
    
                                database.collection('AppliedJobs').doc(val['freelancer_email']).set({
                                    [data['job_id']]: updatedJob
                                }, { merge: true })
                                .then(resp => { 
                                    database.collection('Alljobs').doc(_job['category']).get().then(_alljobs=>{
                                        let ALLJobs = Object.values(_alljobs.data()) 
                                        let _keys = Object.keys(_alljobs.data()) 
                                        let newJob = {}

                                        ALLJobs.map(( job, i ) => {
                                            if( _keys[i] == data.job_id){
                                                newJob = {
                                                    account_type: job.account_type,
                                                    budget: job.budget,
                                                    category: job.category,
                                                    description: job.description,
                                                    duration: job.duration,
                                                    email: job.email,
                                                    status: 'accepted'
                                                } 
                                                database.collection('Alljobs').doc(job['category']).set({
                                                    [data['job_id']]: newJob
                                                }, { merge: true })
                                                .then(res => {
                                                    return success(true) 
                                                })
                                            }
                                           
                                        })
                                    })
                                   
                                })
                                .catch( err => {
                                    return error('Some error occurred') 
                                })
                               
                            
                            }
    
                          
                        })
                })
                }
               
        }
        })
 
    })
        .catch(err => { 
            return error('Some error occurred')
        })

};


exports.firebase_startJob = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data.email).get().then(job => {

        let values = Object.values(job.data())
        let keys = Object.keys(job.data())

        values.map((val, index) => {
            if (val.job_id == data.job_id && val.freelancer_email == data.freelancer_email) {
               
                    let notif_id = `${keys[index]}.status`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: 'started'
                    })

                    notif_id = `${keys[index]}.message`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: `${data.freelancer_email} has started this job.`
                    })
    
                    database.collection('AppliedJobs').doc(val['freelancer_email']).get().then(job => {
    
                        let appliedJobs = Object.values(job.data()) 
                        let updatedJob = {}
    
                        appliedJobs.map((_job, ind) => {
                            if (_job.job_id == data.job_id) {
                               updatedJob = {
                                    budget: _job.budget,
                                    category: _job.category,
                                    description: _job.description,
                                    duration: _job.duration,
                                    email: _job.email,
                                    job_id: _job.job_id,
                                    status: 'started'
                                }
    
                                database.collection('AppliedJobs').doc(val['freelancer_email']).set({
                                    [data['job_id']]: updatedJob
                                }, { merge: true })
                                .then(resp => { 
                                    return success( true )
                                })
                                .catch( err => {
                                    return error('Some error occurred') 
                                })
                               
                            
                            }
    
                          
                        })
                })
                
               
        }
        })

 
    })
        .catch(err => { 
            return error('Some error occurred')
        })

};


exports.firebase_completeJob = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data.email).get().then(job => {

        let values = Object.values(job.data())
        let keys = Object.keys(job.data())

        values.map((val, index) => {
            if (val.job_id == data.job_id && val.freelancer_email == data.freelancer_email) {
               
                    let notif_id = `${keys[index]}.status`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: 'completed'
                    })

                    notif_id = `${keys[index]}.message`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: `${data.freelancer_email} has marked this job complete.`
                    })
    
                    database.collection('AppliedJobs').doc(val['freelancer_email']).get().then(job => {
    
                        let appliedJobs = Object.values(job.data()) 
                        let updatedJob = {}
    
                        appliedJobs.map((_job, ind) => {
                            if (_job.job_id == data.job_id) {
                               updatedJob = {
                                    budget: _job.budget,
                                    category: _job.category,
                                    description: _job.description,
                                    duration: _job.duration,
                                    email: _job.email,
                                    job_id: _job.job_id,
                                    status: 'completed'
                                }
    
                                database.collection('AppliedJobs').doc(val['freelancer_email']).set({
                                    [data['job_id']]: updatedJob
                                }, { merge: true })
                                .then(resp => { 
                                    return success( true )
                                })
                                .catch( err => {
                                    return error('Some error occurred') 
                                })
                               
                            
                            }
    
                          
                        })
                })
                
               
        }
        })

 
    })
        .catch(err => { 
            return error('Some error occurred')
        })

};


exports.firebase_markCompleteJob = async (data, success, error) => {

    database.collection('EmployerNotifs').doc(data.email).get().then(job => {

        let values = Object.values(job.data())
        let keys = Object.keys(job.data())

        values.map((val, index) => {
            if (val.job_id == data.job_id && val.freelancer_email == data.freelancer_email) {
               
                    let notif_id = `${keys[index]}.status`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: 'done'
                    })

                    notif_id = `${keys[index]}.message`

                    database.collection('EmployerNotifs').doc(data['email']).update({
                        [notif_id]: `This job has been completed.`
                    })
    
                    database.collection('AppliedJobs').doc(val['freelancer_email']).get().then(job => {
    
                        let appliedJobs = Object.values(job.data()) 
                        let updatedJob = {}
    
                        appliedJobs.map((_job, ind) => {
                            if (_job.job_id == data.job_id) {
                               updatedJob = {
                                    budget: _job.budget,
                                    category: _job.category,
                                    description: _job.description,
                                    duration: _job.duration,
                                    email: _job.email,
                                    job_id: _job.job_id,
                                    status: 'done'
                                }
    
                                database.collection('AppliedJobs').doc(val['freelancer_email']).set({
                                    [data['job_id']]: updatedJob
                                }, { merge: true })
                                .then(resp => { 
                                    database.collection('Alljobs').doc(_job['category']).get().then(_alljobs=>{
                                        let ALLJobs = Object.values(_alljobs.data()) 
                                        let _keys = Object.keys(_alljobs.data()) 
                                        let newJob = {}

                                        ALLJobs.map(( job, i ) => {
                                            if( _keys[i] == data.job_id){
                                                newJob = {
                                                    account_type: job.account_type,
                                                    budget: job.budget,
                                                    category: job.category,
                                                    description: job.description,
                                                    duration: job.duration,
                                                    email: job.email,
                                                    status: 'done'
                                                } 
                                                database.collection('Alljobs').doc(job['category']).set({
                                                    [data['job_id']]: newJob
                                                }, { merge: true })
                                                .then(res => {
                                                    return success(true) 
                                                })
                                            }
                                           
                                        })
                                    })
                                    // return success( true )
                                })
                                .catch( err => {
                                    return error('Some error occurred') 
                                })
                               
                            
                            }
    
                          
                        })
                })
                
               
        }
        })

 
    })
        .catch(err => { 
            return error('Some error occurred')
        })

};