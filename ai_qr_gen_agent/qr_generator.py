import qrcode
import requests
from PIL import Image, ImageOps, ImageFilter, ImageEnhance  # Make sure ImageEnhance is imported
from io import BytesIO
from openai import OpenAI


def get_landmark_info(city, client):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that provides information about city landmarks."},
            {"role": "user", "content": f"What is the main landmark in {city}? Provide two sentences about it and make sure to start with '[Landmark name] is'."}
        ]
    )
    return response.choices[0].message.content


def extract_landmark_name(info):
    # Simple extraction method - assumes the landmark name is at the beginning of the first sentence
    first_sentence = info.split('.')[0]
    return first_sentence.split('is')[0].strip()

def generate_city_image(landmark, city_name, client):
    #PROMPT = f"Create a image of {landmark}, an iconic landmark structure located in {city_name}. The perspective should not be directly underneath but slightly off to the side, giving a zoomed in view of the landmark’s height and grandeur. The landmark should fill up most of the image."
    PROMPT = f"Create a colorful image of {landmark}, an iconic landmark structure located in {city_name}. The landmark should fill up most of the image."

    response = client.images.generate(
        model="dall-e-3",
        prompt=PROMPT,
        n=1,
        size="1024x1024"
    )

    image_url = response.data[0].url
    print("View image at: " + image_url)

    image_response = requests.get(image_url)
    city_image = Image.open(BytesIO(image_response.content)).convert("RGBA")

    return city_image


def generate_scannable_stylized_qr_code(city_image):
    print('Generating QR code...')

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1,
    )
    qr.add_data("https://www.google.com") 
    qr.make(fit=True)

    qr_img = qr.make_image(fill='black', back_color='white').convert('RGBA')
    qr_img = qr_img.resize((city_image.width, city_image.height))

    qr_pixels = qr_img.load()
    for x in range(qr_img.width):
        for y in range(qr_img.height):
            if qr_pixels[x, y][0:3] == (0, 0, 0):
                continue
            else:
                qr_pixels[x, y] = (255, 255, 255, 255)  # Adjust transparency for QR code white areas


    blurred_city_image = city_image.filter(ImageFilter.GaussianBlur(radius=3))  

    enhancer = ImageEnhance.Color(blurred_city_image)  
    blurred_city_image = enhancer.enhance(1.2)  


    inverted_background = ImageOps.invert(blurred_city_image.convert('RGB')).convert("RGBA")
    qr_pixels = qr_img.load()
    bg_pixels = inverted_background.load()

    flip = 0
    for x in range(qr_img.width):
        for y in range(qr_img.height):
            if qr_pixels[x, y][0:3] == (0, 0, 0):
                if flip > 100: #can't go any lower than this
                    qr_pixels[x, y] = bg_pixels[x, y]  
                    flip = 0
                else:
                    flip += 1
            else:
                # White spaces remain white or transparent, this makes background less/more apparent
                qr_pixels[x, y] = (255, 255, 255, 150)

    contrast_enhancer = ImageEnhance.Contrast(blurred_city_image) 
    blurred_city_image = contrast_enhancer.enhance(1.9)  

    blurred_city_image.paste(qr_img, (0, 0), qr_img)
    
    return blurred_city_image


openai_api_key = '<YOUR_KEY>'
client = OpenAI(api_key=openai_api_key)

def run():
    city = input("Enter a city: ")
    landmark_context = get_landmark_info(city, client)
    landmark_name = extract_landmark_name(landmark_context)

    city_image = generate_city_image(landmark_name, city, client)
    final_image = generate_scannable_stylized_qr_code(city_image)


    print(landmark_context)
    final_image.save("city_with_scannable_qr.png")

while True:
    run()

