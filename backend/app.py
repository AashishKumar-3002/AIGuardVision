from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.get_scores import get_prediction
from db.crud import fetch_data , insert_data


app = Flask(__name__)
CORS(app)


@app.route('/fetch_data', methods=['POST'])
def fetch_images():
    email_id = request.form.get('email')
    response = fetch_data(email_id)

    return jsonify(response)

@app.route('/predict', methods=['POST'])
def predict():

    # Get the data from the POST request. like image and email
    email = request.form.get('email')
    image = request.files['file']
    print(image)
    print(email)
    # Load the image
    confidence_score = get_prediction(image)

    # response_insertion = insert_data(email_id=email , image_data=image , classification_type=  , real_score= , fake_score= , )
    print(confidence_score)
    # Return the prediction
    return jsonify({
        'email': email,
        'confidence_score': confidence_score
        })

if __name__ == '__main__':
    app.run(debug=True)