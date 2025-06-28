import pandas as pd
from sendgrid_util import send_email
import time
import os

# Read sent emails from log to avoid duplicates
sent_emails = set()
if os.path.exists('sent_emails.log'):
    with open('sent_emails.log') as f:
        for line in f:
            parts = line.strip().split(',')
            if len(parts) > 0:
                sent_emails.add(parts[0].strip().lower())

# Load your CSV
csv_path = 'emails_with_variants.csv'
df = pd.read_csv(csv_path)

# Ensure columns are stripped of whitespace
if 'Email' in df.columns:
    df['Email'] = df['Email'].astype(str).str.strip().str.lower()
else:
    raise Exception('No Email column found in CSV!')

# Read templates
with open('templates/a.html') as f:
    template_a = f.read()
with open('templates/b.html') as f:
    template_b = f.read()

# Select emails in order from the top of the CSV, skipping already sent
emails_to_send = df[~df['Email'].isin(sent_emails)].drop_duplicates('Email')
emails_a = emails_to_send.head(100)      # First 5 for template A
emails_b = emails_to_send.iloc[100:200]   # Next 5 for template B

# Send template A
# for idx, row in emails_a.iterrows():
#     email = row['Email']
#     first_name = row.get('First Name', 'there')
#     html_content = template_a.replace('[First Name]', first_name)
#     subject = 'Help Us Fix the Subletting Struggle @ UW 🏡 (1-min survey)'
#     status = send_email(email, subject, html_content)
#     print(f'sent email to {email}: {subject} (status: {status})')
#     time.sleep(10)
# Send a copy to both reviewers
for reviewer in ['vmandadi@wisc.edu', 'aghelani@wisc.edu']:
    html_content = template_a.replace('[First Name]', 'there')
    subject = 'Help Us Fix the Subletting Struggle @ UW 🏡 (1-min survey)'
    status = send_email(reviewer, subject, html_content)
    print(f'sent review copy to {reviewer}: {subject} (status: {status})')
    time.sleep(2)

# Send template B
for idx, row in emails_b.iterrows():
    email = row['Email']
    first_name = row.get('First Name', 'there')
    html_content = template_b.replace('[First Name]', first_name)
    subject = 'UW Student Housing Survey — 1 Min + $25 Raffle'
    status = send_email(email, subject, html_content)
    print(f'sent email to {email}: {subject} (status: {status})')
    time.sleep(10)
# Send a copy to both reviewers
for reviewer in ['vmandadi@wisc.edu', 'aghelani@wisc.edu']:
    html_content = template_b.replace('[First Name]', 'there')
    subject = 'UW Student Housing Survey — 1 Min + $25 Raffle'
    status = send_email(reviewer, subject, html_content)
    print(f'sent review copy to {reviewer}: {subject} (status: {status})')
    time.sleep(2)