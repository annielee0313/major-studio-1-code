import json
import re

# Load the data from JSON file
with open('extractedData.json', 'r') as file:
    data = json.load(file)

# Define month mappings
month_map = {
    'January': 'January', 'February': 'February', 'March': 'March',
    'April': 'April', 'May': 'May', 'June': 'June', 'July': 'July',
    'August': 'August', 'September': 'September', 'October': 'October',
    'November': 'November', 'December': 'December'
}

# Define season mappings
season_map = {
    'Spring': ['March', 'April', 'May'],
    'Summer': ['June', 'July', 'August'],
    'Autumn': ['September', 'October', 'November'],
    'Winter': ['December', 'January', 'February'],
    'Year round': list(month_map.values())
}

# Function to convert bloom time descriptions to standard months
def normalize_bloom_time(bloom_time):
    bloom_time = bloom_time.lower()
    months = set()

    # Match and add months directly mentioned
    for month in month_map.keys():
        if month.lower() in bloom_time:
            months.add(month)
    
    # Match and add seasons
    for season, season_months in season_map.items():
        if season.lower() in bloom_time:
            months.update(season_months)
    
    # Match and add "Year round"
    if 'year round' in bloom_time:
        months.update(season_map['Year round'])
    
    # Extract peak times
    peaks = re.findall(r'peak(?:s)? from ([\w\s,]+)', bloom_time)
    if peaks:
        return list(months), peaks[0].split(', ')
    else:
        return list(months), []

# Clean the data: remove duplicates and normalize bloom times
seen = set()
cleaned_data = []
bloom_times_set = set()

for item in data:
    common_name = item.get('common_name', '')
    
    if common_name not in seen:
        seen.add(common_name)
 
        # Normalize bloom time
        bloom_time, peaks = normalize_bloom_time(item.get('bloom_time', ''))
        
        # Add to cleaned data
        cleaned_data.append({
            'common_name': common_name,
            'image_url': item.get('image_url', ''),
            'image_caption': item.get('image_caption', ''),
            'bloom_time': ', '.join(bloom_time) if bloom_time else 'Unknown',
            'life_form': item.get('life_form', 'Unknown'),
            'taxonomic_names': item.get('taxonomic_names', {}),
            'peak_times': ', '.join(peaks) if peaks else 'None'
        })
        
        # Update unique bloom times set
        bloom_times_set.update(bloom_time)

# Save cleaned data to a new JSON file
with open('cleanedData.json', 'w') as file:
    json.dump(cleaned_data, file, indent=4)

print("Data cleaning complete. Cleaned data saved to 'cleanedData.json'.")

# Print all unique bloom times
print("Unique Bloom Times:")
for bloom_time in sorted(bloom_times_set):
    print(bloom_time)


