from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import geocoding
import real_ocean_data

app = Flask(__name__)
CORS(app)

OUTPUT_FILE = "ocean_data.nc"


@app.route("/")
def home():
    return "🌊 Comprehensive Ocean Data API is running!"


@app.route("/debug/meteomatics-config", methods=["GET"])
def debug_meteomatics_config():
    try:
        username = os.getenv('METEOMATICS_USERNAME')
        password = os.getenv('METEOMATICS_PASSWORD')
        return jsonify({
            "success": True,
            "username_set": bool(username),
            "password_set": bool(password)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/ocean-data", methods=["GET"])
def get_comprehensive_ocean_data():
    """
    Get comprehensive ocean data including temperature, salinity, plankton,
    and other parameters
    """
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        date = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))

        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            error_msg = ("Invalid coordinates. Latitude must be between -90 "
                        "and 90, longitude between -180 and 180.")
            return jsonify({"error": error_msg})

        # Get data from multiple sources
        ocean_data = {
            "coordinates": {
                "latitude": lat,
                "longitude": lon,
                "date": date
            },
            "temperature": get_temperature_data(lat, lon, date),
            "salinity": get_salinity_data(lat, lon, date),
            "plankton": get_plankton_data(lat, lon, date),
            "water_quality": get_water_quality_data(lat, lon, date),
            "ocean_currents": get_current_data(lat, lon, date),
            "wave_data": get_wave_data(lat, lon, date),
            "bathymetry": get_bathymetry_data(lat, lon)
        }

        return jsonify(ocean_data)

    except Exception as e:
        return jsonify({"error": str(e)})


def get_temperature_data(lat, lon, date):
    """Get sea surface temperature data from real sources only"""
    try:
        real_sst = real_ocean_data.get_real_sst(lat, lon, date)
        if real_sst.get("real_data", False):
            return {
                "sea_surface_temperature": real_sst["sea_surface_temperature"],
                "unit": real_sst["unit"],
                "source": real_sst["source"],
                "real_data": True,
                "timestamp": real_sst.get("timestamp")
            }
        # No simulated fallback
        return {"sea_surface_temperature": None, "unit": "°C", "source": "Unavailable", "real_data": False}
    except Exception as e:
        return {"error": str(e), "source": "Error in data retrieval"}


def get_salinity_data(lat, lon, date):
    """Get salinity data from real sources only"""
    try:
        real_salinity = real_ocean_data.get_real_salinity(lat, lon, date)
        if real_salinity.get("real_data", False):
            return {
                "salinity": real_salinity["salinity"],
                "unit": real_salinity["unit"],
                "source": real_salinity["source"],
                "real_data": True,
                "timestamp": real_salinity.get("timestamp")
            }
        return {"salinity": None, "unit": "PSU", "source": "Unavailable", "real_data": False}
    except Exception as e:
        return {"error": str(e), "source": "Error in data retrieval"}


def get_plankton_data(lat, lon, date):
    """Get plankton data (chlorophyll-a) from real sources only"""
    try:
        real_chlorophyll = real_ocean_data.get_real_chlorophyll(lat, lon, date)
        if real_chlorophyll.get("real_data", False):
            return {
                "chlorophyll_a": real_chlorophyll["chlorophyll_a"],
                "unit": real_chlorophyll["unit"],
                "description": ("Chlorophyll-a concentration indicates "
                              "phytoplankton abundance"),
                "source": real_chlorophyll["source"],
                "real_data": True,
                "timestamp": real_chlorophyll.get("timestamp")
            }
        return {"chlorophyll_a": None, "unit": "mg/m³", "source": "Unavailable", "real_data": False}
    except Exception as e:
        return {"error": str(e), "source": "Error in data retrieval"}


def get_water_quality_data(lat, lon, date):
    """Get additional water quality parameters from real sources only"""
    try:
        # Try to enrich with Meteomatics for DO and pH
        provider = real_ocean_data.RealOceanDataProvider()

        def _first_value(data_json):
            try:
                series = data_json.get('data', [])[0]
                coords = series.get('coordinates', [])[0]
                dates = coords.get('dates', [])
                if dates:
                    return dates[0].get('value')
            except Exception:
                pass
            return None

        iso_dt = date
        mm_loc = f"{lat},{lon}"
        dissolved_oxygen = None
        ph_value = None

        # Try a few likely aliases for DO
        do_params = [
            'dissolved_oxygen:mg_l',
            'dissolved_oxygen:ml_l',
            'o2:mg_l',
        ]
        for p in do_params:
            mm = provider.meteomatics_fetch(iso_dt, p, mm_loc, 'json')
            if isinstance(mm, dict) and not mm.get('error'):
                val = _first_value(mm)
                if val is not None:
                    dissolved_oxygen = float(val)
                    break

        # Try a few likely aliases for pH
        ph_params = [
            'ph',
            'sea_water_ph',
        ]
        for p in ph_params:
            mm = provider.meteomatics_fetch(iso_dt, p, mm_loc, 'json')
            if isinstance(mm, dict) and not mm.get('error'):
                val = _first_value(mm)
                if val is not None:
                    ph_value = float(val)
                    break

        return {
            "turbidity": None,
            "turbidity_unit": "m⁻¹ (Kd_490)",
            "turbidity_source": "Unavailable",
            "turbidity_real": False,
            "par": nasa_data.get_par(lat, lon, date),
            "par_unit": "Einstein/m²/day",
            "dissolved_oxygen": dissolved_oxygen,
            "ph": ph_value,
        }
    except Exception as e:
        return {"error": str(e)}


def get_current_data(lat, lon, date):
    """Get ocean current data (real sources only)"""
    try:
        current = real_ocean_data.get_real_currents(lat, lon, date)
        if isinstance(current, dict) and current.get("real_data"):
            return current
        return {"eastward_velocity": None, "northward_velocity": None, "speed": None, "direction": None, "unit": "m/s", "source": "Unavailable"}
    except Exception as e:
        return {"error": str(e), "source": "Unavailable"}


def get_wave_data(lat, lon, date):
    """Get wave data from real sources only"""
    try:
        real_wave_data = real_ocean_data.get_real_wave_data(lat, lon, date)
        if real_wave_data.get("real_data", False):
            return {
                "significant_wave_height": real_wave_data["significant_wave_height"],
                "wave_period": real_wave_data["wave_period"],
                "wave_direction": real_wave_data["wave_direction"],
                "source": real_wave_data["source"],
                "real_data": True,
                "timestamp": real_wave_data.get("timestamp")
            }
        return {"significant_wave_height": None, "wave_period": None, "wave_direction": None, "source": "Unavailable", "real_data": False}
    except Exception as e:
        return {"error": str(e)}


def get_bathymetry_data(lat, lon):
    """Get bathymetry (sea floor depth) data (real sources only)"""
    try:
        # Prefer Meteomatics ocean depth if available
        provider = real_ocean_data.RealOceanDataProvider()
        if provider.meteomatics_username and provider.meteomatics_password:
            loc = f"{lat},{lon}"
            res = provider.meteomatics_fetch(None, 'ocean_depth:m', loc, 'json')
            if isinstance(res, dict) and not res.get('error'):
                try:
                    d = res.get('data', [])[0]
                    c = d.get('coordinates', [])[0]
                    ds = c.get('dates', [])
                    if ds:
                        val = ds[0].get('value')
                        if val is not None:
                            return {
                                "depth": round(float(val), 1),
                                "unit": "m",
                                "source": "Meteomatics",
                                "real_data": True,
                                "timestamp": datetime.now().isoformat(),
                            }
                except Exception:
                    pass
        # Fallback to GEBCO bathymetry
        depth_data = real_ocean_data.get_real_bathymetry(lat, lon)
        if isinstance(depth_data, dict) and depth_data.get("real_data"):
            return depth_data
        return {"depth": None, "unit": "meters", "source": "Unavailable"}
    except Exception as e:
        return {"error": str(e)}


@app.route("/meteomatics", methods=["GET"])
def meteomatics_proxy():
    """Proxy endpoint to fetch Meteomatics data securely using server-side auth.
    Query params:
    - datetime: ISO datetime (e.g., 2025-09-08T00:00Z or YYYY-MM-DD)
    - parameter: e.g., salinity:psu, wave_height:m, sea_surface_temperature:degC
    - location: lat,lon or bounding box
    - format: json | csv | netcdf (default: json)
    """
    try:
        iso_datetime = request.args.get("datetime")
        parameter = request.args.get("parameter")
        location = request.args.get("location")
        fmt = request.args.get("format", "json")

        if not all([parameter, location]):
            return jsonify({
                "success": False,
                "error": "Missing required parameters",
                "message": "parameter and location are required"
            })

        provider = real_ocean_data.RealOceanDataProvider()
        result = provider.meteomatics_fetch(iso_datetime, parameter, location, fmt)

        if fmt != 'json':
            # For binary formats, return as attachment
            content = result.get('content') if isinstance(result, dict) else None
            if content is None:
                return jsonify({"success": False, "error": str(result)})
            headers = result.get('headers', {})
            return (content, 200, {
                "Content-Type": headers.get('Content-Type', 'application/octet-stream'),
                "Content-Disposition": headers.get('Content-Disposition', f"inline; filename=meteomatics.{fmt}")
            })

        if isinstance(result, dict) and result.get('error'):
            return jsonify({"success": False, "error": result['error']})

        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/extras", methods=["GET"])
def get_extras():
    """Return Meteomatics extras: precip, pressure, UV, radiation, sat RGB,
    and ocean depth. Query: lat, lon, date (YYYY-MM-DD)."""
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        date = request.args.get("date")

        provider = real_ocean_data.RealOceanDataProvider()
        if not (provider.meteomatics_username and provider.meteomatics_password):
            return jsonify({
                "success": False,
                "error": "Meteomatics credentials not configured"
            })

        iso_dt = date
        loc = f"{lat},{lon}"

        def first_val(j):
            try:
                d = j.get('data', [])[0]
                c = d.get('coordinates', [])[0]
                ds = c.get('dates', [])
                if ds:
                    return ds[0].get('value')
            except Exception:
                return None
            return None

        items = {
            "precipitation": ("precip_24h:mm", "mm"),
            "pressure": ("msl_pressure:hPa", "hPa"),
            "uv_index": ("uv:idx", "index"),
            "global_radiation": ("global_rad:W", "W/m²"),
            "satellite_rgb_index": ("sat_rgb:idx", "index"),
            "pm10": ("pm10:ugm3", "µg/m³"),
        }

        out = {"success": True}
        for key, (param, unit) in items.items():
            res = provider.meteomatics_fetch(iso_dt, param, loc, 'json')
            val = None
            if isinstance(res, dict) and not res.get('error'):
                v = first_val(res)
                if v is not None:
                    try:
                        val = float(v)
                    except Exception:
                        val = v
            out[key] = val
            out[f"{key}_unit"] = unit
            out[f"{key}_source"] = "Meteomatics" if val is not None else "Unavailable"

        return jsonify(out)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/geocode", methods=["GET"])
def geocode_place():
    """Convert place name to coordinates"""
    try:
        place_name = request.args.get("place", "").strip()
        
        if not place_name:
            return jsonify({
                "success": False,
                "error": "Missing place name",
                "message": "Please provide a place name"
            })
        
        result = geocoding.geocode_place(place_name)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Geocoding error",
            "message": str(e)
        })


@app.route("/search-places", methods=["GET"])
def search_places():
    """Search for places matching the query"""
    try:
        query = request.args.get("q", "").strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Missing query",
                "message": "Please provide a search query"
            })
        
        result = geocoding.search_places(query)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Search error",
            "message": str(e)
        })


@app.route("/popular-places", methods=["GET"])
def get_popular_places():
    """Get list of popular ocean places"""
    try:
        places = geocoding.get_ocean_places()
        return jsonify({
            "success": True,
            "places": places
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })


@app.route("/sst", methods=["GET"])
def get_sst():
    """Legacy endpoint for backward compatibility"""
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        date = request.args.get("date", "2025-09-01")

        sst_data = get_temperature_data(lat, lon, date)

        return jsonify({
            "latitude": lat,
            "longitude": lon,
            "date": date,
            "sst": sst_data.get("sea_surface_temperature")
        })

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
