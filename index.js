const express = require('express');
const app = express();
const { addFile } = require('./src/IPFS')
const { check_signup_fields } = require('./src/FieldsAuthentication')
const { firebase_signup } = require('./src/FireBase')
const { EncryptPassword } =  require('./src/Encryption')
const dotenv = require('dotenv');
dotenv.config();

//  Json middleware
app.use(express.json())


app.get('/', (req, res) => {
    return res.send('Welcome To Dwork Backend')
})


app.post('/signup', async (req, res) => {
    const data = req.body

    check_signup_fields( data.content, async success => {

        console.log(EncryptPassword(data['content']['password']))

        if (success) {
            const fileHash = await addFile(data)

            let info = {
                email: data['content']['email'],
                password: await EncryptPassword(data['content']['password']),
                ipfs_hash: fileHash
            }

            firebase_signup( data.content['account_type'], info, succ => {
                res.json({ message: 'Registered successfully' })
            }, err => {
                res.json({ message: err})
            })
            
        }

    }, error => {
        res.json({ message: error })
    })


})



app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`))