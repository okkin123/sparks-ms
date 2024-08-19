const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function reloadEnv() {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
}

module.exports = {
    TRN: (req, res)=>{
        reloadEnv()
        res.send({trn: process.env.TRN})
    },
    setTRN:(req, res)=>{
       
        try{
            // Define the variable you want to update and its new value
            const variableName = 'TRN';
            const newValue = req.body.trn;

            // Define the .env file path
            const envFilePath = path.join(__dirname, '..', '.env');

            // Read the .env file
            let envContent = fs.readFileSync(envFilePath, 'utf-8');

            // Create a regular expression to find the variable
            const regex = new RegExp(`^${variableName}=.*$`, 'm');

            // Update the variable if it exists, otherwise add it
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${variableName}=${newValue}`);
            } else {
                envContent += `\n${variableName}=${newValue}`;
            }

            // Write the updated content back to the .env file
            fs.writeFileSync(envFilePath, envContent);

            res.send({
                status: "SUCCESS",
                message: "TRN value has been updated!"
            })
        }catch (error){
            res.send({
                status: "ERROR",
                message: error
            })
        }

    },
    bank_account: (req, res)=>
    {
        reloadEnv()
        res.send({
            benificiary: process.env.BENIFICIARY,
            name: process.env.BANK_NAME,
            address: process.env.BANK_ADDRESS,
            account_number: process.env.ACCOUNT_NUMBER,
            iban: process.env.IBAN,
            swift_code: process.env.SWIFT_CODE,
            routing_code: process.env.ROUTING_CODE
        });
    }
}
