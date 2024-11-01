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
    company_address: (req, res)=>{
            reloadEnv()
            res.send({company_address: process.env.COMPANY_ADDRESS})
    },
    setCompanyAddress: (req, res)=>{
    
        try{
            // Define the variable you want to update and its new value
            const variableName = 'COMPANY_ADDRESS';
            const newValue = req.body.company_address;

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
                message: "Company Address has been updated!"
            })
        }catch (error){
            res.send({
                status: "ERROR",
                message: error.message
            })
        }

    },
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
                message: "TRN has been updated!"
            })
        }catch (error){
            res.send({
                status: "ERROR",
                message: error.message
            })
        }

    },
    vat_pricing: (req, res)=>{
        reloadEnv()
        res.send({vat_pricing: JSON.parse(process.env.VAT_PRICING)})
    },
    setVatPricing: (req, res)=>{
        let message;

        switch(req.body.mode){
            case 'EDIT': 
                message = "updated";
                break;
            case 'DELETE': 
                message = "deleted";
                break;
            default: 
                message = "added"
        }

        try{
            // Define the variable you want to update and its new value
            const variableName = 'VAT_PRICING';
            const newValue = req.body.vat_pricing;

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
                message: "Vat Pricing has been "+message+"!"
            })
        }catch (error){
            res.send({
                status: "ERROR",
                message: error.message
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
    },
    setBankAccount: (req, res) => {
        try{
            // Define the variable you want to update and its new value
            const variableNames = {
                benificiary: "BENIFICIARY",
                name: "BANK_NAME",
                address: "BANK_ADDRESS",
                account_number: "ACCOUNT_NUMBER",
                iban: "IBAN",
                swift_code: "SWIFT_CODE",
                routing_code: "ROUTING_CODE",

            };

            const newValues = req.body;

            // Define the .env file path
            const envFilePath = path.join(__dirname, '..', '.env');

            // Read the .env file
            let envContent = fs.readFileSync(envFilePath, 'utf-8');

            // Iterate through each variable and update its value
            for (const [key, envVar] of Object.entries(variableNames)) {
                const envVal = newValues[key];
                if (envVal) {
                    // Create a regular expression to find the variable
                    const regex = new RegExp(`^${envVar}=.*$`, 'm');

                    // Update the variable if it exists, otherwise add it
                    if (regex.test(envContent)) {
                        envContent = envContent.replace(regex, `${envVar}=${envVal}`);
                    } else {
                        envContent += `\n${envVar}=${envVal}`;
                    }
                }
            }

            // Write the updated content back to the .env file
            fs.writeFileSync(envFilePath, envContent);

            res.send({
                status: "SUCCESS",
                message: "Bank Account has been updated!"
            })
        }catch (error){
            res.send({
                status: "ERROR",
                message: error.message
            })
        }
    }
}
