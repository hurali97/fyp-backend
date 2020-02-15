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

exports.firebase_getAll_jobs = async ( success, error) => {

    let alljobs = await getDocuments( )
    
    if( alljobs )
        return success( alljobs )
    else
        return error('No jobs available !')
  

};



// Get all jobs firebase

exports.firebase_get_job = async ( category, success, error) => {
    
    let jobsArray = []

    database.collection('Alljobs').doc(category).get().then(job => {
      
      let keys = Object.keys(job.data())
      let values = Object.values(job.data())


      values.map((val, ind) => {

         
          if( val.status == 'newly arrived')
          {
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


const getDocuments = async ( ) => {

    let jobsArray = []

    let alljobs = await database.collection('Alljobs').get().then(snapshot => {
        snapshot.docs.forEach(doc => {

            let keys = Object.keys(doc.data())
            let values = Object.values(doc.data())


            values.map((val, ind) => {
 
                if( val.status == 'newly arrived')
                {
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



exports.firebase_apply_job = async (  data, success, error) => {
    
    let jobsArray = [] 

    database.collection('Alljobs').doc(data.category).get().then(job => {
      
      let keys = Object.keys(job.data())
      let values = Object.values(job.data())


      values.map((val, ind) => {

         
          if( keys[ind] == data.job_id )
          { 
             let _jobData = {
                 budget: val.budget,
                 caegory: val.category,
                 description: val.description,
                 duration: val.duration,
                 email: val.email,
                 job_id: data.job_id,
                 status: 'pending' 
             }

             database.collection('AppliedJobs').doc(data['freelancer_email']).get().then(d => {

                if (d.exists) { 
        
                    let _jobs = Object.keys(d.data()) 
                    let _check = false
                    for( let i = 0; i< _jobs.length; i++){
                        if( _jobs[i] == data.job_id ) {
                            _check = true
                            break
                        } 
                    } 

                    if( _check ){
                       return  error('You have already applied for this job')

                    }
                    else{
                        database.collection('AppliedJobs').doc(data['freelancer_email']).set({
                            [data['job_id']]: _jobData
                        }, { merge: true });
            
                        let _employerNotfiData = {
                           ..._jobData,
                           message: `${data['freelancer_email']} wants to apply for this job.`
                        }
             
                        database.collection('EmployerNotifs').doc(data['employer_email']).get().then(d => {
            
                            if (d.exists) { 
                    
                                let _jobs = Object.keys(d.data()) 
                               
                                let _dataKey = `Notif_${parseInt(_jobs[_jobs.length-1].split('_')[1])+1}`
             
                    
                                database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                    [_dataKey]: _employerNotfiData
                                },
                                    { merge: true })
                                    .then(resp=>{
                                        return success("Successfully applied for job, waiting for approval")
                                    })
                    
                            }
                    
                            else {
                     
                                database.collection('EmployerNotifs').doc(data['employer_email']).set({
                                    [`Notif_${1}`]: _employerNotfiData
                                },
                                    { merge: true })
                                    .then(resp=>{
                                        return success("Successfully applied for job, waiting for approval")
                                    })
                    
                            }
                    
                        });
                    }
                } 
        
            }) 


           
             

            
          }

      })
 
    })
        .catch(err => {
            return error('This job has been removed')
        })

};


exports.firebase_get_applied_job = async (  data, success, error) => {
    
    let jobsArray = [] 

    database.collection('AppliedJobs').doc(data.freelancer_email).get().then(job => {
      
      let keys = Object.keys(job.data())
      let values = Object.values(job.data())

console.log(values)
      values.map((val, ind) => {
 
      })
 
    })
        .catch(err => {
            return error('This job has been removed')
        })

};