from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.get_scores import get_prediction
from db.crud import fetch_data , insert_data
import base64


app = Flask(__name__)
CORS(app)


@app.route('/fetch_data', methods=['POST'])
def fetch_images():
    email_id = request.form.get('email')
    response = fetch_data(email_id)

    return jsonify(response)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the data from the POST request. like image and email
        email = request.form.get('email')
        image = request.files['file']

        # Convert the image to base64 string
        image_string = base64.b64encode(image.read()).decode('utf-8')

        # Load the image
        confidence_score = get_prediction(image)

        # Extract individual label scores
        fake_score = None
        real_score = None
        for score in confidence_score:
            if score['label'] == 'FAKE':
                fake_score = score['score']
            elif score['label'] == 'REAL':
                real_score = score['score']
        
        # Make sure both scores are present
        if fake_score is None or real_score is None:
            return jsonify({'error': 'Unable_to_extract_confidence_scores_for_both_labels'})
        print(confidence_score)
        classification = None
        # Adjust the scores so that they add up to 1, keeping the minority score unchanged
        if fake_score > real_score:
            real_score = 1 - fake_score
            classification = 'FAKE'
        else:
            fake_score = 1 - real_score
            classification = 'REAL'
        
        # Classify whether the image is REAL or FAKE based on the scores
        classification_new = 'FAKE' if fake_score > real_score else 'REAL'
        if classification_new != classification:
            fake_score = 1 - fake_score
            real_score = 1 - real_score
        
        response_insertion = insert_data(email_id=email , encoded_image=image_string , classification_type=classification  , real_score=real_score , fake_score=fake_score)
        
        response_new = []
        # Print the top two labels and their scores
        for score in confidence_score:
            if score['label'] == 'FAKE':
                score_new = fake_score
                result = {
                    "label": score['label'],
                    "score": fake_score
                }
            else:
                score_new = real_score
                result = {
                    "label": score['label'],
                    "score": real_score
                }
            response_new.append(result)
        # Return the prediction
        return jsonify({
            'email': email,
            'confidence_score': response_new
            })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)