import { config } from "config/envs/config";
import { sendEmailWithTemplate } from "config/handlebars";


export const adminUserPassword= async (data:any) => {
  try {
   
    return await sendEmailWithTemplate(
      "../views/admin/onboarding/admin-account-password.handlebars",
      { ...data },
      data.email,
      config.SENDGRID.SENDGRID_SENDER,
      "Your admin password"
    );
  } catch (error) {
    return error;
  }
};


export const allowAdminToChangePassword = async (data: any) => {
  try {
    const linkWithToken = `https://frontend-page/change-password?token=${data.token}&email=${data.email}&userType=${data.userType}`;
    return await sendEmailWithTemplate(
      "../views/admin/onboarding/allow-admin-to-change-password.handlebars",
      { ...data, linkWithToken },
      data.email,
      config.SENDGRID.SENDGRID_SENDER,
      "Verify Account"
    );
  } catch (error) {
    return error;
  }
};
