import pandas as pd

# Load the datasets with the appropriate encoding
job_data = pd.read_csv("data\Job.csv", dtype={"FIPS": str}, encoding="ISO-8859-1")
health_data = pd.read_csv("data\Health.csv", dtype={"cnty_fips": str}, encoding="ISO-8859-1")

# Perform an inner join on 'FIPS' (Job.csv) and 'cnty_fips' (Health.csv)
merged_data = pd.merge(job_data, health_data, left_on="FIPS", right_on="cnty_fips", how="inner")

# Drop the redundant 'cnty_fips' column and ensure the column is named 'FIPS'
merged_data = merged_data.drop(columns=["cnty_fips"])
merged_data.rename(columns={"FIPS": "FIPS"}, inplace=True)

# Save the merged data to a new CSV file
merged_data.to_csv("Merged_Job_Health.csv", index=False)

print("Merged data has been saved to 'Merged_Job_Health.csv'.")