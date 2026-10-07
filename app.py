from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"

@app.route("/")
def home():
    """Display the weather app"""
    return render_template("index.html")

@app.route("/api/weather")
def weather():
    """ Get weather info for a city"""

    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({
            "error": "Please enter a city name."
        }), 400

    try:
        # Find the city's coordinates
        geocoding_response = requests.get(
            GEOCODING_API_URL,
            params={
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json"
            },
            timeout = 10
        )
        geocoding_response.raise_for_status()
        location_data = geocoding_response.json()

        if not location_data.get("results"):
            return jsonify({
                "error": f"Could not find the city '{city}'."
            }), 404

        location = location_data["results"][0]

        latitude = location["latitude"]
        longitude = location["longitude"]

        city_name = location["name"]
        country = location.get("country", "")

        # Request weather information
        weather_response = requests.get(
            WEATHER_API_URL,
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": (
                    "temperature_2m,"
                    "relative_humidity_2m,"
                    "apparent_temperature,"
                    "is_day,"
                    "precipitation,"
                    "weather_code,"
                    "wind_speed_10m,"
                    "surface_pressure"
                ),
                "hourly": (
                    "temperature_2m,"
                    "weather_code,"
                    "precipitation_probability,"
                    "relative_humidity_2m,"
                    "wind_speed_10"
                ),
                "daily": (
                    "weather_code,"
                    "temperature_2m_max,"
                    "temperature_2m_min,"
                    "sunrise,"
                    "sunset,"
                    "precipitation_probability_max"
                ),
                "timezone": "auto",
                "forecast_days": 7
            },
            timeout = 10
        )

        weather_response.raise_for_status()
        weather_data = weather_response.json()

        return jsonify({
            "location":{
                "city": city_name,
                "country": country,
                "latitude": latitude,
                "longitude": longitude
            },
            "current": weather_data.get("current", {}),
            "hourly": weather_data.get("hourly", {}),
            "daily": weather_data.get("daily", {}),
            "timezone": weather_data.get("timezone")
        })

    except requests.exceptions.Timeout:
        return jsonify({
            "error": "The weather service took too long to respond."
        }), 504

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Unable to connect to the weather service."
        }), 503
    
    except Exception as error:
        print(f"Error: {error}")

        return jsonify({
            "error": "An unexpected error occurred."
        }), 500

@app.route("/api/health")
def health_check():
    """Check whether the Flask application is running"""
    return jsonify({
        "status": "online",
        "message": "Weather API is running successfully."
    })

if __name__ == "__main__":
    app.run(debug=True)