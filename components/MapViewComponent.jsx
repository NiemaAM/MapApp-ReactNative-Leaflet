import React, { useState, useEffect, useRef } from 'react';
//make sure to add TextInput and Image in your import
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { pinStore } from '../models/PinStore.js';
import { pins } from '../models/Pins.js';

  // This component displays a MapView with current location of the user and 3 buttons to zoom in, zoom out and get current location
  const MapViewComponent = observer(({setSelectedPin, addPin, clearPins}) => {
    //ititialize the default location
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // This component is used to create a marker on the map
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [countryCode, setCountryCode] = useState("ma");

  // This useEffect hook is used to get the current location of the user when the component mounts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      //get the currect location
      let location = await Location.getCurrentPositionAsync({});
      //initialize the latitude and longitude variables from the location
      const { latitude, longitude } = location.coords;

      // Use a reverse geocoding API to get the address information
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const dataRegion = await response.json();
      // Get the country code from the address information
      setCountryCode(dataRegion.address.country_code);

      //set the region on the map
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05, //latitudeDelta is the amount of north-to-south distance displayed on the screen
        longitudeDelta: 0.05, //longitudeDelta is the amount of east-to-west distance displayed on the screen.
      });
    })();
  }, []);

  // This function is used to zoom in the map when the zoom in button is pressed
  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
  };

  // This function is used to zoom out the map when the zoom out button is pressed
  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
  };

  // This function is used to get the current location of the user and set the marker on the map when the location button is pressed
  const handleGetCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setMarkerCoordinate({ latitude, longitude });
    //setSearchMarkerCoordinate(null);
    setSearchMarkers([]);
    // initialize the pinStrore to make it null
    pinStore.setSelectedPin(null,null,null,null);
    setSearchText("");
    pins.clearPins()
  };
  //This is our search bar component
  const SearchBar = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
  //This allow us to change the Text variable value while the user is typing
    const handleSearchTextChange = (text) => {
      setSearchText(text);
    };
  //This is the call for the function that will process the search
    const handleSearch = () => {
      onSearch(searchText);
    };
  //This is our search bar that will be displayed on the screen
    return (
      <View style={styles.searchBar}>
      <TextInput
        placeholder="Search for a place"
        value={searchText}
        onChangeText={handleSearchTextChange}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <Text>   </Text>
      <FontAwesome name="search" size={18} color="#333" onPress={handleSearch} />
      </View>
    );
  };
  //This is the function that will process the search operation, we will keep it empty for the moment
  //This is our marker setter for the search result
  //const [SearchmarkerCoordinate, setSearchMarkerCoordinate] = useState(null);
  //This is our marker setter for the Multiple search results
  const [searchMarkers, setSearchMarkers] = useState([]);
  const [searchText, setSearchText] = useState("");
  //This function use OpenStreetMap API to search for a place in the map and get the latitude and longitude of this place then display it in the map
  const handleSearch = async (Text) => {
    pinStore.setSelectedPin(null,null,null,null);
    pins.clearPins()
    setSearchText('');
    setSearchText(Text);
    //This is our API call based on the searchText entred in the TextInput
    //Add the country code so you get the results of the ccountry the user is currently in, change the limit parameter
    const searchResults = await fetch(`https://nominatim.openstreetmap.org/search?q=${Text}&format=json&limit=20&countrycodes=${countryCode}`);
    //Fetching the data from the API Json response
    const data = await searchResults.json();
    //Making sure there is data in the Json response 
    if (data.length > 0) {
      //This Gets all the results and Keep only the closest one
      const markers = data
        .map(({ type, display_name, lat, lon }) => {
          const distance = Math.sqrt((region.latitude - parseFloat(lat)) ** 2 + (region.longitude - parseFloat(lon)) ** 2);
          return { latitude: parseFloat(lat), longitude: parseFloat(lon), title: type, description: display_name, distance };
        })
        // Add your search Distance here
        .filter(({ distance }) => distance < searchDistance) // Keep only places within searchDistance
        .sort((a, b) => a.distance - b.distance) // Sort by distance

    // Set the region and search markers
    if (markers.length > 0) {
      setSearchMarkers(markers);
      for (m in markers){
        pins.addPin(markers[m].title, markers[m].description, markers[m].latitude, markers[m].longitude)
      }
      return markers;
    } else {
      setSearchMarkers([]);
      return null;
    }
    }
  };
  // Fetch the data from the selected pin
  handleMarkerPress = (title, desc, lat, lon) => {
    pinStore.setSelectedPin(title,desc,lat,lon);
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  };
  //This is our distance hook
  const [searchDistance, setSearchDistance] = useState(0.5);
    // This function is used to append the search radius
    
    const handleAppend = () => {
        setSearchDistance(searchDistance+0.1);
        //refresh the search
        handleSearch(searchText);
    };
  
    // This function is used to minimize the search radius
    const handleMinimize = () => {
      if (searchDistance>0.2){
      setSearchDistance(searchDistance-0.1);
      //refresh the search
      handleSearch(searchText);
      }
    };
    
  //This is our marker that we exported from the assets folder
  // This component renders the MapView, Marker and 3 buttons (Zoom in, Zoom out and Location)
  return (
    <View style={styles.container}>
      <MapView 
      style={styles.mapStyle} 
      region={
        pinStore.latitude && pinStore.longitude ?
        ({
        latitude: pinStore.latitude,
        longitude: pinStore.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
        })
      : region
      }
      onPress={(e) => {e.stopPropagation(); pinStore.setSelectedPin(null,null,null,null)}}>
      {/* This is a marker that display a popup with the title and the description when you click on it */}
      {markerCoordinate && (
        <Marker
          coordinate={markerCoordinate}
          title="My Current Location"
          description="This is my current location"
          //Add The Listner here
          onPress={(e) => {e.stopPropagation(); handleMarkerPress("My Current Location", "This is my current location", markerCoordinate.latitude, markerCoordinate.longitude);}}
        />
      )}
      {/* Add the Circle component here, full documation : https://github.com/react-native-maps/react-native-maps */}
      {markerCoordinate && (
        <Circle
          center={markerCoordinate}
          radius={searchDistance * 98000} // Convert degrees to kilometers
          strokeColor="rgba(0, 0, 255, 0.5)"
          fillColor="rgba(255, 255, 255, 0.3)"
        />
      )}
        {searchMarkers.map((marker, index) => (
          marker.latitude == pinStore.latitude && marker.longitude == pinStore.longitude ? (
            <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={searchText}
            description={marker.title}
            //Add The Listner here
            onPress={(e) => {e.stopPropagation(); handleMarkerPress(marker.title, marker.description, marker.latitude, marker.longitude);}}
          >
            <Image style={{width:40,height:40}} source={{uri: 'https://cdn-icons-png.flaticon.com/512/3138/3138846.png'}} />
          </Marker>
          ) 
          :
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={searchText}
            description={marker.title}
            //Add The Listner here
            onPress={(e) => {e.stopPropagation(); handleMarkerPress(marker.title, marker.description, marker.latitude, marker.longitude);}}
          >
            <Image style={{width:40,height:40}} source={{uri: 'https://cdn-icons-png.flaticon.com/512/149/149059.png'}} />
          </Marker>
        ))}
      </MapView>
      {/*we have to add this line to fix a bug that stop the image from rendering and resize in the marker
      Link: https://github.com/react-native-maps/react-native-maps/issues/924#issuecomment-316064516 */}
      <Image style={{width:0,height:0}} source={{uri: 'https://cdn-icons-png.flaticon.com/512/149/149059.png'}} />
      <Image style={{width:0,height:0}} source={{uri: 'https://cdn-icons-png.flaticon.com/512/3138/3138846.png'}} />
      {/*!!! Add your searchBar here !!!*/}
      <View style={styles.searchBarContainer}>
        <SearchBar onSearch={handleSearch} />
      </View>
      {/* Those are the floating buttons to zoom and get the location */}
      <View style={styles.buttonContainer}>
        {/* Zoom in button */}
        <TouchableOpacity style={styles.button} onPress={handleZoomIn}>
        <AntDesign name="plus" size={18} color="black" />
        </TouchableOpacity>
        {/* Zoom out button */}
        <TouchableOpacity style={styles.button} onPress={handleZoomOut}>
        <AntDesign name="minus" size={18} color="black" />
        </TouchableOpacity>
        {/* Locate me button */}
        <TouchableOpacity style={styles.button} onPress={handleGetCurrentLocation}>
        <Ionicons name="ios-locate" size={18} color="black" />
        </TouchableOpacity>
        {/* append search button */}
        <TouchableOpacity style={styles.button} onPress={handleAppend}>
        <AntDesign name="arrowsalt" size={18} color="black" />
        </TouchableOpacity>
        {/* minimize search button */}
        <TouchableOpacity style={styles.button} onPress={handleMinimize}>
        <AntDesign name="shrink" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
});
//this is the style of our page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapStyle: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginHorizontal:5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
});

export default MapViewComponent;
