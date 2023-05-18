import { Router } from 'express';
import User from "../database/models/users.js";
const router = Router();

router.get('/', (req,res) => {
    res.send({title: 'Users'})
});

router.get('/add-users', async (req,res) => {
    try {
        await User.insertMany([
            {
                email: "bob@bob.com",
                password: "bob",
                isAdmin: false
            },
            {
                email: "admin",
                password: "admin",
                isAdmin: true
            }
        ])
        res.send("all good")
    } catch (error){
        console.log("err", error)
    }
})

router.get("/users", async (req,res)=>{
    const user = await User.find();

    if (user) {
        res.json(user)
    } else{
        res.send("Something went wrong")
    }


})

export default router;
