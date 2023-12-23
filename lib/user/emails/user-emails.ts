import { config } from "config/envs/config";
import { sendEmailWithTemplate } from "config/handlebars";



export const verifyEmail = async (data: { email: string, token: string, userType: string }) => {
    try {
        const linkWithToken = `${config.SENDGRID.FRONTEND_EMAIL_PORT}/verify-email?token=${data.token}&email=${data.email}&userType=${data.userType}`;
        return await sendEmailWithTemplate("../views/user/verify-user-email.handlebars", { ...data, linkWithToken }, data.email, config.SENDGRID.SENDGRID_SENDER, "Verify Account")

    } catch (error) {
        return error
    }
}

export const forgetPassword = async (data: { email: string; token: string; userType: string }) => {
  try {
    const linkWithToken = `${config.SENDGRID.FRONTEND_EMAIL_PORT}/new-password?token=${data.token}&email=${data.email}&userType=${data.userType}`;
    return await sendEmailWithTemplate(
      "../views/user/forget-password.handlebars",
      { ...data, linkWithToken },
      data.email,
      config.SENDGRID.SENDGRID_SENDER,
      "Forget Password"
    );
  } catch (error) {
    return error;
  }
};

export const accountSuccessMessage = async (data: { email: string }) => {
    try {
        return await sendEmailWithTemplate("../views/user/user-signup.handlebars", data, data.email, config.SENDGRID.SENDGRID_SENDER, "Account Signup Successfully")
    } catch (error) {
        return error
    }
}


export const requestOTP = async (data: { email: string, token: string, userType: string }) => {
    try {
       const linkWithToken = `${config.SENDGRID.FRONTEND_EMAIL_PORT}/verify-email?token=${data.token}&email=${data.email}&userType=${data.userType}`;
        return await sendEmailWithTemplate("../views/user/verify-user-email.handlebars", { ...data, linkWithToken }, data.email, config.SENDGRID.SENDGRID_SENDER, "Verify Account")
    } catch (error) {
        return error
    }
}

