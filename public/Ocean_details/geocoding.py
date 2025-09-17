import requests
import json
import random


def geocode_place(place_name):
    """
    Convert place name to coordinates using OpenStreetMap Nominatim API
    """
    try:
        # Use OpenStreetMap Nominatim API (free, no API key required)
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': place_name,
            'format': 'json',
            'limit': 1,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'OceanDataExplorer/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            return {
                "success": True,
                "place_name": result.get('display_name', place_name),
                "latitude": float(result.get('lat', 0)),
                "longitude": float(result.get('lon', 0)),
                "country": result.get('address', {}).get('country', ''),
                "region": result.get('address', {}).get('state', ''),
                "city": result.get('address', {}).get('city', ''),
                "type": result.get('type', ''),
                "source": "OpenStreetMap Nominatim"
            }
        else:
            return {
                "success": False,
                "error": "Place not found",
                "message": f"Could not find coordinates for '{place_name}'"
            }
            
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": "Network error",
            "message": f"Failed to connect to geocoding service: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Geocoding error",
            "message": f"Error processing place name: {str(e)}"
        }


def get_ocean_places():
    """
    Get a list of popular ocean locations for suggestions
    """
    return [
        {"name": "Miami Beach, Florida", "lat": 25.7617, "lon": -80.1918},
        {"name": "San Francisco Bay, California", "lat": 37.7749, "lon": -122.4194},
        {"name": "North Sea", "lat": 56.0, "lon": 3.0},
        {"name": "Mediterranean Sea", "lat": 35.0, "lon": 18.0},
        {"name": "Indian Ocean", "lat": -20.0, "lon": 80.0},
        {"name": "Atlantic Ocean", "lat": 30.0, "lon": -30.0},
        {"name": "Pacific Ocean", "lat": 0.0, "lon": -150.0},
        {"name": "Caribbean Sea", "lat": 15.0, "lon": -75.0},
        {"name": "Gulf of Mexico", "lat": 25.0, "lon": -90.0},
        {"name": "Red Sea", "lat": 20.0, "lon": 38.0},
        {"name": "Baltic Sea", "lat": 55.0, "lon": 20.0},
        {"name": "Black Sea", "lat": 43.0, "lon": 34.0},
        {"name": "Arabian Sea", "lat": 15.0, "lon": 65.0},
        {"name": "Bay of Bengal", "lat": 15.0, "lon": 88.0},
        {"name": "South China Sea", "lat": 10.0, "lon": 115.0},
        {"name": "Bering Sea", "lat": 60.0, "lon": -170.0},
        {"name": "Hudson Bay", "lat": 60.0, "lon": -85.0},
        {"name": "Great Barrier Reef, Australia", "lat": -18.0, "lon": 147.0},
        {"name": "Monterey Bay, California", "lat": 36.8, "lon": -121.9},
        {"name": "Chesapeake Bay, Maryland", "lat": 38.0, "lon": -76.0},
        {"name": "Puget Sound, Washington", "lat": 47.6, "lon": -122.4},
        {"name": "Long Island Sound, New York", "lat": 41.0, "lon": -73.0},
        {"name": "Gulf of Alaska", "lat": 58.0, "lon": -150.0},
        {"name": "Labrador Sea", "lat": 60.0, "lon": -55.0},
        {"name": "Tasman Sea", "lat": -35.0, "lon": 160.0}
    ]


def search_places(query):
    """
    Search for places matching the query
    """
    try:
        places = get_ocean_places()
        query_lower = query.lower()
        
        # Filter places that match the query
        matches = []
        for place in places:
            if query_lower in place["name"].lower():
                matches.append(place)
        
        # Also try geocoding for more results
        geocode_result = geocode_place(query)
        if geocode_result.get("success"):
            matches.append({
                "name": geocode_result["place_name"],
                "lat": geocode_result["latitude"],
                "lon": geocode_result["longitude"]
            })
        
        return {
            "success": True,
            "places": matches[:10],  # Limit to 10 results
            "query": query
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "places": []
        }
