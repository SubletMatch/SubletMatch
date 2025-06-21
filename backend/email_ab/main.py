import pandas as pd
from sendgrid_util import send_email
import time

# Load your labeled CSV
# df = pd.read_csv('ab_emailer/emails_with_variants.csv')
test_df = pd.DataFrame({'email': ['arjunghelani@gmail.com'], 'variant': ['A']})

# Read templates
with open('templates/a.html') as f:
    template_a = f.read()
with open('templates/b.html') as f:
    template_b = f.read()

for idx, row in test_df.iterrows():
    email = row['email']
    variant = row['variant']
    # Optional: personalize
    first_name = row.get('first_name', 'there')
    if variant == 'A':
        html_content = template_a.replace('[First Name]', first_name)
        subject = 'Help Us Fix the Subletting Struggle @ UW 🏡 (1-min survey)'
    else:
        html_content = template_b.replace('[First Name]', first_name)
        subject = 'UW Student Housing Survey — 1 Min + $25 Raffle'
    send_email(email, subject, html_content)
    print(f'sent email to {email}: {subject}')
    time.sleep(10)  # Wait 5 seconds between sends