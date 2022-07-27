import express from 'express';
import Task from '../models/task';
import auth from '../middleware/auth';
const Router = new express.Router()

Router.post('/task', auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })  

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send()
    }
})

Router.get('/task', auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    
    if(req.query.sortBy){  
        const parts = req.query.sortBy.split(':')   
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

Router.get('/task/:id', auth, async (req,res) => {
    const id = req.params.id

    try {
        const task = await Task.findOne({ _id: id , owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {   
        res.status(500).send()
    }
})

Router.patch('/task/:id', auth,  async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const validUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!validUpdate){
        return res.status(400).send({ error : "Invalid Update!"})
    }

    try {
        const task = await Task.findOne({ _id : req.params.id , owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

Router.delete('/task/:id', auth, async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id , owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = Router
