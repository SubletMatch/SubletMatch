from celery import Celery
from backend.email_ab.sendgrid_util import send_email  # Your send_email function

app = Celery('email_tasks', broker='redis://localhost:6379/0')

@app.task
def send_email_task(to_email, subject, html_content):
    return send_email(to_email, subject, html_content)