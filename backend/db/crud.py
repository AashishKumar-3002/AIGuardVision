
import os
from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv
import datetime
import hashlib
import base64

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key ,options=ClientOptions(
    postgrest_client_timeout=90,
    storage_client_timeout=90
  ))



def generate_primary_key(email_id, image_data):
    # Combine email ID and image data into a single string
    combined_data = email_id + image_data

    # Create a SHA-256 hash object
    hash_object = hashlib.sha256()

    # Update the hash object with the combined data
    hash_object.update(combined_data.encode('utf-8'))

    # Get the hexadecimal representation of the hash
    primary_key = hash_object.hexdigest()

    return primary_key

def encode_image_to_base64(image_file):
    try:
        encoded_string = base64.b64encode(image_file.read())
        return encoded_string.decode('utf-8')
    except Exception as e:
        print("Error encoding image:", e)
        return None


def insert_data(email_id: str, image_data: bytes, classification_type: str, real_score: float, fake_score: float):
    timestamp = str(datetime.datetime.now())
    encoded_image = encode_image_to_base64(image_path)
    
    if not encoded_image:
        return

    image_id = generate_primary_key(email_id, encoded_image)
    
    # List to keep track of successful inserts
    successful_inserts = []

    try:

        # Check if the email exists in the 'emails' table
        email_query , count = supabase.table('emails').select('*').eq('email_id', email_id).execute()
        # print(email_query[1])
        if not email_query[1]:
            emails_insert_query, count = supabase.table('emails').insert({"email_id": email_id, "timestamp": timestamp}).execute()
            # print(emails_insert_query, count)
            successful_inserts.append('emails')
        
        # Insert into Images table
        images_insert_query, countagain = supabase.table('images').insert([{'image_id': image_id, 'email_id': email_id, 'image_data': encoded_image, 'timestamp': timestamp}]).execute()
        # print(images_insert_query, countagain)
        successful_inserts.append('images')

        # Insert into ClassificationDetails table
        classification_details_insert_query, classification_count = supabase.table('classificationdetails').insert([{'image_id': image_id, 'classification_type': classification_type, 'real_score': real_score, 'fake_score': fake_score, 'timestamp': timestamp}]).execute()
        # print(classification_details_insert_query, classification_count)
        successful_inserts.append('classificationdetails')

        return "Data inserted successfully!"

    except Exception as e:
        print("Error inserting data:", e)

        # Delete entries from child tables
        for table_name in reversed(successful_inserts):  # Start the loop from the end
            supabase.table(table_name).delete().eq(table_name, email_id).execute()

        # Optionally raise the exception again to propagate it
        raise e
    
def delete_entry(table, image_id=None, email_id=None):
    try:
        tables = ['emails', 'images', 'classificationdetails']

        for table_name in reversed(tables):  # Start the loop from the end
            try:
                supabase.table(table_name).delete().eq(table_name, email_id).execute()
            except Exception as e:
                print(f"Error deleting data from {table_name}:", e)
    
    except Exception as e:
        print("Error deleting data:", e)
        raise e

def fetch_data(email_id):
    try:
        # Fetch data from the database
        data, count = supabase.table('images') \
            .select('image_id, image_data') \
            .eq('email_id', email_id) \
            .execute()

        if data[1] == 0:
            print("No data found for the given email ID")
            return None
        
        images = data[1]

        result = []
        for image in images:
            image_id = image['image_id']
            image_data = image['image_data']

            # Fetch data from ClassificationDetails table for each image
            classification_data, classification_count = supabase.table('classificationdetails') \
                .select('classification_type, real_score, fake_score') \
                .eq('image_id', image_id) \
                .execute()

            classifications = classification_data[1]
            print(classifications)
            result.append({
                'image_id': image_id,
                'image_data': image_data,
                'classifications': classifications
            })

        return result

    except Exception as e:
        print("Error fetching data:", e)
        return None

# # Example usage:
# email_id = "example@example.com"
# user_images_and_scores = fetch_data(email_id)
# if user_images_and_scores is not None:
#     for image_info in user_images_and_scores:
#         print("Image ID:", image_info['image_id'])
#         print("Image Data:", image_info['image_data'])
#         print("Classifications:")
#         for classification in image_info['classifications']:
#             print("- Classification Type:", classification['classification_type'])
#             print("  Real Score:", classification['real_score'])
#             print("  Fake Score:", classification['fake_score'])


if __name__ == "__main__":
    email_id = "duhyzy@pelagius.net"
    image_path = "../../Images/img3.HEIC"
    classification_type = "REAL"
    real_score = 0.983701
    fake_score = 0.16299
    insert_data(email_id, image_path, classification_type, real_score, fake_score)
    # data3= fetch_data(email_id)
    # print(data3)