from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline
import torch

model_id_or_path = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionImg2ImgPipeline.from_pretrained(model_id_or_path, torch_dtype=torch.float16)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
pipe = pipe.to(device)

init_image = Image.open("../../Images/IMG_3545.JPG").convert("RGB").resize((768, 512))
prompt = "A fantasy landscape, trending on artstation"

images = pipe(prompt=prompt, image=init_image, strength=0.75, guidance_scale=7.5).images
images[0].save("fantasy_landscape.png")
