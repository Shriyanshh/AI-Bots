from coinbase.rest import RESTClient
from json import dumps
import uuid  # Add this import
import tweepy
from openai import OpenAI
import time


# API key and headers

api_key = "<YOUR_COINBASE_KEY>"
api_secret = "-----BEGIN EC PRIVATE KEY-----some_random_gibberish-----END EC PRIVATE KEY-----\n"
openai_api_key = '<YOUR_OPENAI_KEY>'


x_api_key = "<YOUR_X_KEY>"
x_api_secret = "<YOUR_X_SECRET>"
x_bearer_token = "<YOUR_X_BEARER_TOKEN>"

client = RESTClient(api_key=api_key, api_secret=api_secret)
ai_client = OpenAI(api_key=openai_api_key)


def get_current_price_details():
    product = client.get_product("DOGE-USD")
    return product

def get_wallet_balance():
    uuid = "your_account_uuid"
    accounts = client.get_accounts().to_dict()['accounts']
    usd_balance = ""
    for account in accounts:
        if account['name'] == "USD Wallet":
            usd_balance = account['available_balance']['value']
    
    print('Remaining USD balance: ' + usd_balance)
    return float(usd_balance)


def calculate_percent_change(price1, price2):
    return ((price2 - price1) / price1) * 100


def place_buy():
    client_order_id = str(uuid.uuid4())
    curr_balance = get_wallet_balance()
    if curr_balance > 3:
        response = client.market_order_buy(product_id="DOGE-USD", side="BUY", client_order_id=client_order_id, quote_size="3")
        if response['success']:
            response = response['success_response']['order_id']
            fills = client.get_fills(order_id=response)
            print("Successfuly bought DOGE")
            print(fills)
        else:
            error_response = response['error_response']
            print(error_response)
    else:
        print('Insufficiuent funds to buy DOGE')


def place_sell():
    client_order_id = str(uuid.uuid4())
    response = client.market_order_sell(product_id="DOGE-USD", side="SELL", client_order_id=client_order_id, quote_size="3")
    if response['success']:
        response = response['success_response']['order_id']
        fills = client.get_fills(order_id=response)
        print("Successfuly sold DOGE")
        print(fills)
    else:
        error_response = response['error_response']
        print(error_response)


def get_latest_tweet(username):
    client = tweepy.Client(bearer_token=x_bearer_token)
    user = client.get_user(username=username)
    tweets = client.get_users_tweets(id=user.data.id, max_results=5)
    if tweets.data:
        recent_tweet = tweets.data[0]
        print(f"Most recent tweet from {username}:")
        print(recent_tweet.text)
    else:
        print(f"No tweets found for user: {username}")



def ask_chatgpt(coin_context, tweet_context):
    response = ai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": """You are a helpful assistant that decides whether to place a trade for Dogecoin or not. You have high risk tolerance.
            This is for in and out, scalping trades for Dogecoin where if we even make 4-5% profit we sell. 
            You respond with YES or NO for whether to buy dogecoin or not followed by a comma, and then an explanation for your decision"""},

            {"role": "user", "content": f"""Based on this data of dogecoin's current price details: 
            {coin_context}, and based on dogecoin's performance over the last 2 hours (look at RSI, volume, and high of day) 
            and how much % change it has had in the last 5-90 minutes, decide whether I should buy dogecoin right now or not for a short term hold. I have high risk tolerance. 
            Another factor to consider in your decision is the latest tweet of Elon Musk. 
            Here is the latst tweet of Elon Musk: {tweet_context}. If the latest tweet does not signify anything, then ignore it.
            But if the latest tweet of Elon Musk includes 'doge' or 'DOGE' in it then respond with 'YES' no matter what. 
            Other than that, look at all of the details I asked of you and
            Respond with 'YES' or 'NO' only based on your analysis and if you think dogecoin is a good buy right now or not for a short term scalp for quick profit.
            Simply respond with 'YES' or 'NO' followed by a comma and then an explanation."""
            }
        ]
    )

    answer = response.choices[0].message.content
    print(answer)
    return answer


def place_smart_trade():
    current_price_details = get_current_price_details()
    tweet_context = 'None' 

    try:
        tweet_context = get_latest_tweet("elonmusk")
    except:
        print("Error getting tweet context")

    decision = ask_chatgpt(coin_context=current_price_details, tweet_context=tweet_context)

    if "YES" in decision:
        print(f"Buying dogecoin at {current_price_details['price']}")
        place_buy()
        return float(current_price_details['price'])
    elif "NO" in decision:
        print("No trade will be placed.")
        return -1
    else:
        print("Invalid response")
        return -1
    


def run_agent():
    
    result = place_smart_trade()
    while result < 0:
        time.sleep(600)
        result = place_smart_trade()
    
    bought_at_price = result
    current_price = float(get_current_price_details()['price'])
    percent_change = calculate_percent_change(bought_at_price, current_price)

    while percent_change < 4 and percent_change > -10:
        current_price = float(get_current_price_details()['price'])
        percent_change = calculate_percent_change(bought_at_price, current_price)
        print(f"Current price: {current_price}, Percent change: {percent_change}")
        time.sleep(300)
    
    print("Time to sell! Percent change: " + str(percent_change))
    place_sell()
    run_agent()
        
    
run_agent()




#place_smart_trade()



