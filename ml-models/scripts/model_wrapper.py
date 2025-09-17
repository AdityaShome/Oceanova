#!/usr/bin/env python3
"""
Model wrapper for integrating the gene sequence prediction model with the Next.js API.
This script provides a REST API interface for the model predictions.
"""

import os
import sys
import json
import traceback
from typing import Dict, List, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Model directory to the path
model_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'Model')
sys.path.insert(0, model_dir)

try:
    from infer_helper import predict_sequences
except ImportError as e:
    print(f"Warning: Could not import infer_helper: {e}")
    predict_sequences = None

app = Flask(__name__)
CORS(app)

class ModelWrapper:
    """Wrapper class for the gene sequence prediction model."""
    
    def __init__(self):
        self.model_loaded = False
        self.model_info = {
            "name": "Gene Sequence Species Classifier",
            "version": "1.0.0",
            "description": "Stacked ensemble model for species identification from gene sequences",
            "supported_genes": ["COI", "16S", "18S", "ITS", "General"],
            "model_type": "Stacked Ensemble (LightGBM + XGBoost + Meta Classifier)"
        }
    
    def is_model_available(self) -> bool:
        """Check if the model files are available."""
        required_files = [
            'stack_meta_clf.pkl',
            'stack_label_encoder.pkl', 
            'lgb_models_list.pkl',
            'xgb_models_list.pkl'
        ]
        
        for file in required_files:
            file_path = os.path.join(model_dir, file)
            if not os.path.exists(file_path):
                return False
        return True
    
    def predict_species(self, sequences: List[str]) -> Dict[str, Any]:
        """Predict species from gene sequences."""
        if not self.is_model_available():
            return {
                "success": False,
                "error": "Model files not found",
                "message": "Please ensure all model files are in the Model directory"
            }
        
        if not predict_sequences:
            return {
                "success": False,
                "error": "Model inference function not available",
                "message": "Could not import predict_sequences function"
            }
        
        try:
            # Validate sequences
            valid_sequences = []
            for seq in sequences:
                if seq and isinstance(seq, str) and len(seq.strip()) > 0:
                    # Basic validation - should contain only ATGC characters
                    seq_clean = seq.strip().upper()
                    if all(c in 'ATGC' for c in seq_clean):
                        valid_sequences.append(seq_clean)
            
            if not valid_sequences:
                return {
                    "success": False,
                    "error": "No valid sequences provided",
                    "message": "Sequences must contain only A, T, G, C characters"
                }
            
            # Make predictions
            predictions = predict_sequences(valid_sequences)
            
            # Format results
            results = []
            for i, pred in enumerate(predictions):
                result = {
                    "sequence_id": f"seq_{i+1}",
                    "sequence_length": len(valid_sequences[i]),
                    "predicted_species": pred.get('pred_label', 'Unknown'),
                    "confidence": max(pred.get('prob_vector', [0.0])),
                    "probability_distribution": pred.get('prob_vector', []),
                    "sequence_preview": valid_sequences[i][:50] + "..." if len(valid_sequences[i]) > 50 else valid_sequences[i]
                }
                results.append(result)
            
            return {
                "success": True,
                "predictions": results,
                "model_info": self.model_info,
                "total_sequences": len(results)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Prediction failed",
                "traceback": traceback.format_exc()
            }

# Global model wrapper instance
model_wrapper = ModelWrapper()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_available": model_wrapper.is_model_available(),
        "model_info": model_wrapper.model_info
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        sequences = data.get('sequences', [])
        if not sequences:
            return jsonify({
                "success": False,
                "error": "No sequences provided"
            }), 400
        
        if isinstance(sequences, str):
            sequences = [sequences]
        
        result = model_wrapper.predict_species(sequences)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Internal server error"
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information."""
    return jsonify({
        "model_info": model_wrapper.model_info,
        "model_available": model_wrapper.is_model_available(),
        "required_files": [
            'stack_meta_clf.pkl',
            'stack_label_encoder.pkl',
            'lgb_models_list.pkl', 
            'xgb_models_list.pkl'
        ]
    })

@app.route('/popular-places', methods=['GET'])
def popular_places():
    """Get popular ocean locations for the frontend."""
    popular_locations = [
        {"name": "Monterey Bay", "lat": 36.7783, "lon": -119.4179},
        {"name": "Great Barrier Reef", "lat": -18.2871, "lon": 147.6992},
        {"name": "Maldives", "lat": 3.2028, "lon": 73.2207},
        {"name": "Hawaiian Islands", "lat": 19.8968, "lon": -155.5828},
        {"name": "Mediterranean Sea", "lat": 35.0, "lon": 18.0},
        {"name": "Caribbean Sea", "lat": 15.0, "lon": -75.0},
        {"name": "Red Sea", "lat": 22.0, "lon": 38.0},
        {"name": "Bermuda Triangle", "lat": 25.0, "lon": -71.0},
        {"name": "Mariana Trench", "lat": 11.35, "lon": 142.2},
        {"name": "Antarctic Ocean", "lat": -60.0, "lon": 0.0}
    ]
    
    return jsonify({
        "success": True,
        "places": popular_locations
    })

@app.route('/geocode', methods=['GET'])
def geocode():
    """Geocode a place name to coordinates."""
    place = request.args.get('place')
    if not place:
        return jsonify({
            "success": False,
            "error": "Place parameter is required"
        }), 400
    
    # Simple geocoding for common places
    geocoding_data = {
        "miami beach": {"lat": 25.7907, "lon": -80.1300, "place_name": "Miami Beach, FL, USA", "country": "USA", "region": "Florida", "city": "Miami Beach"},
        "monterey bay": {"lat": 36.7783, "lon": -119.4179, "place_name": "Monterey Bay, CA, USA", "country": "USA", "region": "California", "city": "Monterey"},
        "great barrier reef": {"lat": -18.2871, "lon": 147.6992, "place_name": "Great Barrier Reef, Australia", "country": "Australia", "region": "Queensland", "city": "Cairns"},
        "maldives": {"lat": 3.2028, "lon": 73.2207, "place_name": "Maldives", "country": "Maldives", "region": "Indian Ocean", "city": "Malé"},
        "hawaii": {"lat": 19.8968, "lon": -155.5828, "place_name": "Hawaiian Islands, USA", "country": "USA", "region": "Hawaii", "city": "Honolulu"},
        "mediterranean": {"lat": 35.0, "lon": 18.0, "place_name": "Mediterranean Sea", "country": "International Waters", "region": "Mediterranean", "city": "Mediterranean Sea"},
        "caribbean": {"lat": 15.0, "lon": -75.0, "place_name": "Caribbean Sea", "country": "International Waters", "region": "Caribbean", "city": "Caribbean Sea"},
        "red sea": {"lat": 22.0, "lon": 38.0, "place_name": "Red Sea", "country": "International Waters", "region": "Red Sea", "city": "Red Sea"},
        "bermuda": {"lat": 25.0, "lon": -71.0, "place_name": "Bermuda Triangle", "country": "International Waters", "region": "North Atlantic", "city": "Bermuda Triangle"},
        "mariana trench": {"lat": 11.35, "lon": 142.2, "place_name": "Mariana Trench", "country": "International Waters", "region": "Pacific Ocean", "city": "Mariana Trench"}
    }
    
    place_lower = place.lower().strip()
    if place_lower in geocoding_data:
        return jsonify({
            "success": True,
            "latitude": geocoding_data[place_lower]["lat"],
            "longitude": geocoding_data[place_lower]["lon"],
            "place_name": geocoding_data[place_lower]["place_name"],
            "country": geocoding_data[place_lower]["country"],
            "region": geocoding_data[place_lower]["region"],
            "city": geocoding_data[place_lower]["city"]
        })
    else:
        return jsonify({
            "success": False,
            "error": f"Place '{place}' not found in our database"
        }), 404

@app.route('/ocean-data', methods=['GET'])
def ocean_data():
    """Get ocean data for given coordinates and date."""
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        date = request.args.get('date', '2024-01-01')
        
        # Mock ocean data for demonstration
        ocean_data = {
            "coordinates": {"latitude": lat, "longitude": lon, "date": date},
            "temperature": {
                "surface": round(20 + (lat * 0.1) + (lon * 0.05), 1),
                "depth_100m": round(15 + (lat * 0.08) + (lon * 0.03), 1),
                "depth_500m": round(8 + (lat * 0.05) + (lon * 0.02), 1)
            },
            "salinity": {
                "surface": round(35.0 + (lat * 0.01), 2),
                "depth_100m": round(35.2 + (lat * 0.008), 2),
                "depth_500m": round(34.8 + (lat * 0.005), 2)
            },
            "plankton": {
                "chlorophyll_a": round(0.5 + (lat * 0.01), 3),
                "phytoplankton_biomass": round(100 + (lat * 2), 1),
                "zooplankton_biomass": round(50 + (lat * 1.5), 1)
            },
            "water_quality": {
                "ph": round(7.8 + (lat * 0.001), 2),
                "dissolved_oxygen": round(6.5 + (lat * 0.01), 1),
                "turbidity": round(0.3 + (lat * 0.005), 2)
            },
            "ocean_currents": {
                "surface_speed": round(0.5 + (lat * 0.01), 2),
                "surface_direction": round(180 + (lon * 0.5), 1),
                "deep_current_speed": round(0.2 + (lat * 0.005), 2)
            },
            "wave_data": {
                "height": round(1.0 + (lat * 0.02), 1),
                "period": round(8.0 + (lat * 0.1), 1),
                "direction": round(270 + (lon * 0.3), 1)
            },
            "bathymetry": {
                "depth": round(2000 + (lat * 50), 0),
                "seafloor_type": "Abyssal plain" if lat > 30 else "Continental slope"
            }
        }
        
        return jsonify(ocean_data)
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to fetch ocean data"
        }), 500

if __name__ == '__main__':
    print("Starting Gene Sequence Prediction API...")
    print(f"Model directory: {model_dir}")
    print(f"Model available: {model_wrapper.is_model_available()}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
