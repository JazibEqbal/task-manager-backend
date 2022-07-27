import express from 'express';
import User from '../models/user';
const Router = new express.Router();
import auth from '../middleware/auth';
import multer from 'multer';
import sharp from'sharp';
import {sendWelcomeMail, sendCancelMail} from '../email/account';

Router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user , token})
    }catch(e){
        res.status(400).send()
    }
})

Router.post('/user/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token})    
    }catch(e){
        res.status(401).send()
    }
})

Router.get('/user/me', auth,  async (req,res) => {
    res.send(req.user)
})

Router.post('/user/logout', auth , async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

Router.post('/user/logoutAll' , auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

Router.patch('/user/me', auth , async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name' ,'email' ,'age' ,'password']

    const validUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!validUpdate){
        return res.status(400).send({ error : 'Invalid Upadte!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(401).send(e)
    }
})

Router.delete('/user/me', auth, async (req,res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({ 
    limits:{
        fileSize: 1000000,
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload the image file.'))
        }

        cb(undefined,true)
    }
})

Router.post('/user/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250 , height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next) => {
    res.status(500).send({ error: error.message })
})

Router.delete('/user/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined  
    await req.user.save()
    res.send()
}, (error,req,res, next) => {
    res.status(500).send({ error: error.message })
})

Router.get('/user/:id/avatar' , async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(500).send("false")
    }
})

module.exports = Router
