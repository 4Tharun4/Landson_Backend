import nodemailer,{Transporter} from 'nodemailer'
import ejs from 'ejs'
import path from 'path'

interface EmailOptions{
email:string,
subject:string,
template:string
data:{[key:string]:any}
}

const SendMail  = async (options:EmailOptions):Promise<void>=>{
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        service:process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const {email,data,subject,template} = options;


    //get the path to email template file
    const templatepath = path.join(__dirname,'../Email',template)


    //Render Email Template

    const html:string =await ejs.renderFile(templatepath,data);

    const mailoptions ={
        from:process.env.SMPT_MAIL,
        subject:subject,
        to:email,
        data,
        html
    }


    await transporter.sendMail(mailoptions)
}

export default SendMail