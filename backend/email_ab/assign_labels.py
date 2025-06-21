import pandas as pd
import random

def assign_variant():
    # Read the CSV file
    df = pd.read_csv('/Users/arjun/Downloads/UW-Madison-students-future_semester.csv')  # Adjust path as needed

    # Assign each row randomly to 'A' or 'B'
    df['variant'] = [random.choice(['A', 'B']) for _ in range(len(df))]

    # Print or save the result
    print(df.head())
    df.to_csv('data/labeled_emails.csv', index=False)
    print("Assigned variants and saved to data/labeled_emails.csv")

if __name__ == "__main__":
    assign_variant()