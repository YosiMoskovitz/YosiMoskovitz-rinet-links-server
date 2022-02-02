const welcomeImage = `
<img
    alt="Rinet Links"
    src="http://yosi.webschoolcloud.com/rinet/images/base.png"
    style="display: block; height: 100px; border: 0; width: 120px; max-width: 100%;"
    title="Rinet Links" width="160" />
`;

const verifiedImage = `
<img
	alt="verified" class="big"
	src="http://yosi.webschoolcloud.com/rinet/images/verification/check.gif"
	style="display: block; height: auto; border: 0; width: 240px; max-width: 100%;"
	title="verified"
	width="640" />
`
const passwordResetImage = `
<img
	alt="password Reset" class="big"
	src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/4036/___passwordreset.gif"
	style="display: block; height: auto; border: 0; width: 640px; max-width: 100%;"
	title="Password Reset Email."
	width="640" />
`

const mainTitle = (text)=> {
    return `
    <div style="font-family: sans-serif;padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px;">
    <div>
        <p dir="rtl"
            style="margin: 0; font-size:30px; font-family: Montserrat, Trebuchet MS, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Tahoma, sans-serif; text-align: center;color:#2b303a;">
            <strong>
                ${text}
            </strong>	
        </p>
    </div>
</div>`
}