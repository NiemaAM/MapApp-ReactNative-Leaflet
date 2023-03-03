import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MapViewComponent from './MapViewComponent';
import { Appbar, Card } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { pinStore } from '../models/PinStore';
import { pins } from '../models/Pins';
import BottomSheet, { BottomSheetRefProps } from './BottomSheet';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

// This is the main component of the app.
const AppPage = observer((setSelectedPin) => {
  const ref = useRef<BottomSheetRefProps>(null);

// call the setSelectedPin action method to set the data
return (
    // This component provides safe area insets to the app content
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, zIndex: 2 }}>
      <View style={styles.container}>
         {/* This component is the header of the app. */}
        <Appbar.Header style={{backgroundColor: 'white'}}>
          {/* This component represents the title of the header. */}
          <Appbar.Content title="Map App" />
        </Appbar.Header>
        {/* This component is the main content of the app. */}
        <MapViewComponent/>
        {/* Get the data from the pinStore and display it in a Card */}
        {pinStore.type && pinStore.display_name ? (
          <Card style={[styles.card, { zIndex: 0 }]}>
            <Card.Title title={pinStore.type} />
            <Card.Content>
              {/* Your data goes here */}
                <Text>{pinStore.display_name}</Text>
            </Card.Content>
          </Card>
        ) : null}
        {pins.getAllPins().length > 0 ? (
          <BottomSheet ref={ref}> 
              <ScrollView>
                {pins.getAllPins().map((pin, index) => (
                  <TouchableOpacity key={index} onPress={() => 
                  {
                  pinStore.setSelectedPin(pin.type,pin.display_name,pin.latitude,pin.longitude)
                  if (ref?.current?.isActive()) {
                    ref?.current?.scrollTo(0)
                  } else {
                    ref?.current?.scrollTo(0)
                  }}
                  }>
                  <View style={styles.item}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: 'green'}}>{pin.type}</Text>
                    <Text>{pin.display_name}</Text>
                  </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </BottomSheet>
        ) : 
        <BottomSheet ref={ref}>
          <Text style={{fontSize: 14, alignSelf: 'center', color: 'grey'}}>No Results Found</Text>
        </BottomSheet>
        }
      </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});

// this is the style of our page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  //Add this style
  card: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    borderRadius: 10,
    elevation: 4,
    zIndex: 1,
  },
  button: {
    height: 50,
    borderRadius: 25,
    aspectRatio: 1,
    backgroundColor: 'white',
    opacity: 0.6,
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default AppPage;
