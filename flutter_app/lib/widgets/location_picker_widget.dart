import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationPickerWidget extends StatefulWidget {
  final Function(double lat, double lng, String address) onLocationSelected;
  final double? initialLat;
  final double? initialLng;

  const LocationPickerWidget({
    Key? key,
    required this.onLocationSelected,
    this.initialLat,
    this.initialLng,
  }) : super(key: key);

  @override
  State<LocationPickerWidget> createState() => _LocationPickerWidgetState();
}

class _LocationPickerWidgetState extends State<LocationPickerWidget> {
  GoogleMapController? _mapController;
  LatLng _selectedPosition = const LatLng(12.3714, -1.5197); // Ouagadougou
  String _selectedAddress = '';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLat != null && widget.initialLng != null) {
      _selectedPosition = LatLng(widget.initialLat!, widget.initialLng!);
      _getAddressFromLatLng(_selectedPosition);
    } else {
      _getCurrentLocation();
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() {
      _loading = true;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _loading = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _loading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _loading = false;
        });
        return;
      }

      Position position = await Geolocator.getCurrentPosition();
      final newPosition = LatLng(position.latitude, position.longitude);

      setState(() {
        _selectedPosition = newPosition;
      });

      _mapController?.animateCamera(
        CameraUpdate.newLatLng(newPosition),
      );

      await _getAddressFromLatLng(newPosition);
    } catch (e) {
      print('Error getting location: $e');
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _getAddressFromLatLng(LatLng position) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          _selectedAddress =
              '${place.street ?? ''}, ${place.locality ?? ''}, ${place.country ?? ''}';
        });
      }
    } catch (e) {
      print('Error getting address: $e');
      setState(() {
        _selectedAddress = 'Adresse non disponible';
      });
    }
  }

  void _onMapTapped(LatLng position) {
    setState(() {
      _selectedPosition = position;
    });
    _getAddressFromLatLng(position);
  }

  void _confirmLocation() {
    widget.onLocationSelected(
      _selectedPosition.latitude,
      _selectedPosition.longitude,
      _selectedAddress,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sélectionner l\'emplacement'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _getCurrentLocation,
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _selectedPosition,
              zoom: 14,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
            },
            onTap: _onMapTapped,
            markers: {
              Marker(
                markerId: const MarkerId('selected'),
                position: _selectedPosition,
                draggable: true,
                onDragEnd: (position) {
                  _onMapTapped(position);
                },
              ),
            },
          ),
          if (_loading)
            Container(
              color: Colors.black26,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.red),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _selectedAddress.isEmpty
                              ? 'Sélectionnez un emplacement'
                              : _selectedAddress,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _selectedAddress.isEmpty ? null : _confirmLocation,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Confirmer l\'emplacement'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}

// Simple location picker without map (fallback)
class SimpleLocationPicker extends StatefulWidget {
  final Function(String city, String address) onLocationSelected;
  final String? initialCity;
  final String? initialAddress;

  const SimpleLocationPicker({
    Key? key,
    required this.onLocationSelected,
    this.initialCity,
    this.initialAddress,
  }) : super(key: key);

  @override
  State<SimpleLocationPicker> createState() => _SimpleLocationPickerState();
}

class _SimpleLocationPickerState extends State<SimpleLocationPicker> {
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cityController.text = widget.initialCity ?? '';
    _addressController.text = widget.initialAddress ?? '';
  }

  @override
  void dispose() {
    _cityController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Saisir l\'emplacement'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _cityController,
            decoration: const InputDecoration(
              labelText: 'Ville',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.location_city),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _addressController,
            decoration: const InputDecoration(
              labelText: 'Adresse',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.home),
            ),
            maxLines: 2,
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: () {
            widget.onLocationSelected(
              _cityController.text,
              _addressController.text,
            );
            Navigator.pop(context);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
          child: const Text('Confirmer'),
        ),
      ],
    );
  }
}
