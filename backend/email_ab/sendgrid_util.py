import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_email, subject, html_content, from_email=None, log_file="sent_emails.log"):
    if from_email is None:
        from_email = 'info@em5493.leaselink.app'
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(os.environ['SENDGRID_API_KEY'])
        response = sg.send(message)
        # Log to file
        with open(log_file, "a") as f:
            f.write(f"{to_email},{subject},{response.status_code}\n")
        return response.status_code
    except Exception as e:
        # Log failures too
        with open(log_file, "a") as f:
            f.write(f"{to_email},{subject},ERROR,{e}\n")
        return None