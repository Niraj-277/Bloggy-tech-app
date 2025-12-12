const bcrypt=require("bcryptjs")
const pwd="niraj"
let hashedPwd;
async function genHashPwd(pwd){
    const salt=await bcrypt.genSalt(10);
    console.log("salt",salt);
    hashedPwd=await bcrypt.hash(pwd,salt);
    console.log("original ",pwd);
    console.log("hashed pwd", hashedPwd)
}



async function comparePwd(pwd){
    const result = await bcrypt.compare(pwd,hashedPwd);
    console.log("result",result);
}


async function run(){
    const pwd="niraj";
    await genHashPwd(pwd);
    await comparePwd(pwd);
}

run();