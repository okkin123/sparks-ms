import AxiosInstance from './AxiosInstance';

const SendEmail = (values) => {
    AxiosInstance.post("/forgot/send_email", values)
    .then(function(response){})
    .catch(function(error){})
}

export default SendEmail;