
const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const check_signup_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['first_name'])
      return error('First name is required')

   if (!body['last_name'])
      return error('Last name is required')

   if (!body['username'])
      return error('Username is required')

   if (!body['email'])
      return error('Email is required')

   if (!emailFormat.test(body['email']))
      return error('Please enter a valid email address')

   if (!body['account_type'])
      return error('Account type is required')

   if (!body['password'])
      return error('Password is required')

   if (body['password'].length < 8)
      return error('Password length should be 8 or greater')

   return success(true)
}


const check_signin_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['email'])
      return error('Email is required')

   if (!emailFormat.test(body['email']))
      return error('Please enter a valid email address')


   if (!body['password'])
      return error('Password is required')

   if (body['password'].length < 8)
      return error('Password length should be 8 or greater')

   if (!body['account_type'])
      return error('Account type is required')

   return success(true)
}


const check_profile_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['first_name'])
      return error('First name is required')

   if (!body['last_name'])
      return error('Last name is required')

   if (!body['username'])
      return error('Username is required')

   if (!body['email'])
      return error('Email is required')

   if (!emailFormat.test(body['email']))
      return error('Please enter a valid email address')

   if (!body['account_type'])
      return error('Account type is required')

   return success(true)
}


const check_get_profile_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['email'])
      return error('Email is required')

   if (!emailFormat.test(body['email']))
      return error('Please enter a valid email address')

   if (!body['account_type'])
      return error('Account type is required')


   return success(true)
}


const check_createJob_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['email'])
      return error('Email is required')

   if (!emailFormat.test(body['email']))
      return error('Please enter a valid email address')

   if (!body['account_type'])
      return error('Account type is required')

   if (body['account_type'] == 'freelancer')
      return error('Freelancer cannot create jobs')

   if (!body['category'])
      return error('Category is required')

   if (!body['budget'])
      return error('Budget is required')

   if (!body['description'])
      return error('Description is required')

   if (!body['duration'])
      return error('Duration is required')

   return success(true)
}


const check_get_job_fields = (body, success, error) => {

   if (!body)
      return error('Please fill all the fields')

   if (!body['category'])
      return error('Category is required')
 

   return success(true)
}

module.exports = {
   check_signup_fields,
   check_signin_fields,
   check_profile_fields,
   check_get_profile_fields,
   check_createJob_fields,
   check_get_job_fields
}