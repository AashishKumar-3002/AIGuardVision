from transformers import AutoImageProcessor, ViTForImageClassification
import torch
from PIL import Image
from pillow_heif import register_heif_opener , register_avif_opener

register_heif_opener()
register_avif_opener()

def get_prediction(img):
    image = Image.open(img)
    image = image.convert('RGB')

    # Initialize the image processor and model
    image_processor = AutoImageProcessor.from_pretrained("AashishKumar/AIvisionGuard-v2")
    model = ViTForImageClassification.from_pretrained("AashishKumar/AIvisionGuard-v2")

    # Process the image
    inputs = image_processor(image, return_tensors="pt")

    # Get the model predictions
    with torch.no_grad():
        logits = model(**inputs).logits

    # Get the top two labels and their scores
    top2_labels = logits.topk(2).indices.squeeze().tolist()
    top2_scores = logits.topk(2).values.squeeze().tolist()
    
    response = []
    # Print the top two labels and their scores
    for label, score in zip(top2_labels, top2_scores):
        result = {
            "label": model.config.id2label[label],
            "score": score
        }
        response.append(result)
    
    print("sending response" , response)
    return response

