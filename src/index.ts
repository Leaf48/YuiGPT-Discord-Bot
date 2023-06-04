require("dotenv").config()
require("dotenv").config({path: ".env.development", override: true})




console.log("Hello Wirld!")
console.log(process.env.token)