
import { sendInfoMail } from './sendEmail.js';

export const passwordHasChanged = async (user) => {
    const result = await sendInfoMail(
        '../mail/htmlTemplates/passChanged-info.html',
        "סיסמתך השתנתה",
        user,
        'password changed successfully'
    );
    
    return result;
}
