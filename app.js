const express = require('express')
const logger = require('morgan')
const errorhandler = require('errorhandler')
const mongodb = require('mongodb')
const bodyParser = require('body-parser')
const path = require('path')

const routes = require('./routes')

const url = 'mongodb://localhost:27017/edx-course-db'
let app = express();
app.use(logger('dev'))
app.use(bodyParser.json())

mongodb.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        console.log(`Error: ${error}`)
        process.exit(1)
    }

    //connected
    console.log(`Connected to mongoDB`)
    const collection = client.db('edx-course-db').collection('accounts')

    app.get('/accounts', (req, res, next) => {
        collection.find({})
            .sort({ _id: -1 })
            .toArray((error, accounts) => {
                if (error) return next(error)
                res.send(accounts)
            })
    })

    app.post('/accounts', (req, res, next) => {
        collection.insertOne(req.body, (error, results) => {
            if (error) return next(error)
            res.send(`inserted document with ID of ${results.insertedId}`)
        })
    })
    app.put('/accounts/:id', (req, res, next) => {
        collection.findOneAndUpdate({ _id: mongodb.ObjectId(req.params.id) },
            { $set: { "name": req.body.name } },
            //{ returnNewDocument: true },
            (error, result) => {
                if (error) return next(error)
                
                //This is sending back the original, PREedit document - what's going wrong here?
                res.send(result)
                console.log(result)
            })
    })

    app.delete('/accounts/:id', (req, res, next) => {
        collection.deleteOne({ _id: mongodb.ObjectId(req.params.id) },
        (error, result) =>{
            if (error) return next(error)
            res.send(`Delete ${result.deletedCount} document(s)`)
        })
    })
    app.use(errorhandler())
    app.listen(3000)
})